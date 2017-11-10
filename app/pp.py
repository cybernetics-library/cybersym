from collections import defaultdict
from functools import reduce
import copy
from .lvsolver import lotka_volterra_phase_curve


# LOGIC BELOW ###################

# groups of relation. each relation should be a pair.
predator_prey_groups= {
    "rabbitfoxes": {
        "predator": "foxes",
        "prey": "rabbits",
    },
    "angerjoy": {
        "predator": "anger",
        "prey": "joy",
    }
}
# these are default relations. These should only be used to illustrate what edges are going to be used. 
# will be overriden by mstate_to_relations_functions.

default_relations = {
    "rabbits->rabbits" : 0.66,
    "foxes->rabbits": -1.33,
    "foxes->foxes" : -1,
    "rabbits->foxes" : 1,
    "anger->joy": 0.1,
    "anger->anger" : 0.1,
    "joy->anger" : 0,
    "joy->joy" : 0
}

# example: "monument factor": { "relation": "increase"}
# contains functions for converting monument state into relation.
# relation values are all combined together.

mstate_to_relations_functions = {
    "peace": lambda w: { "foxes->rabbits" : -0.01 * w },
    "anger": lambda w: { "foxes->rabbits": -0.01 * w },
    "agriculture": lambda w: { "foxes->rabbits" : -0.01 * w, "rabbits->foxes": 0.01 * w}
}

# only used for testing
DEBUG_OVERRIDE = False

override_mstate = {
        "peace": 0.4,
        "anger": 0.1,
        "agriculture": 0.3,
        "magic": 0.1
    }
###################
###################

def combine_dicts(a, b):
    c = defaultdict(float)
    for k, v in a.items():
        c[k] += v
    for k, v in b.items():
        c[k] += v
    return c


def mstate_weight_to_relation(mstate_key, weight):
    if(mstate_key in mstate_to_relations_functions):
        return mstate_to_relations_functions[mstate_key](weight)
    else:
        return {}

def relations_to_groups(relations):
    r = defaultdict(dict)

    # sort relations into groups
    for thisrel, thisval in relations.items():
        thisgroup = [k for k, v in predator_prey_groups.items() if thisrel.split("->")[0] in [v['predator'], v['prey']]]
        if(len(thisgroup) > 0): 
            r[thisgroup[0]][thisrel] =  thisval

    # insert into groups dict
    groups = copy.deepcopy(predator_prey_groups)
    for thisrel, thisvel in r.items():
        groups[thisrel]['relations'] = thisvel

    for thisrel, thisval in groups.items():
        # pos/neg is tweaked; may want to use absolute values instead
        lv_a = thisval["relations"][thisval["prey"] + "->" + thisval["prey"]] 
        lv_b = -1 * thisval["relations"][thisval["predator"] + "->" + thisval["prey"]] 
        lv_c = -1 * thisval["relations"][thisval["predator"] + "->" + thisval["predator"]] 
        lv_d = thisval["relations"][thisval["prey"] + "->" + thisval["predator"]]

        lv_a = max(lv_a, 0.00001)
        lv_b = max(lv_b, 0.00001)
        lv_c = max(lv_c, 0.00001)
        lv_d = max(lv_d, 0.00001)

        groups[thisrel]["lv_vars"] = {
            "a" : lv_a, 
            "b" : lv_b,
            "c" : lv_c,
            "d" : lv_d
        }

        (r, f) = lotka_volterra_phase_curve(a=lv_a, b=lv_b, c=lv_c, d=lv_d)
        groups[thisrel]["phase_curve"] = list(zip(r,f))

    return groups


"""
a is the natural growth rate of prey, (positive)
b is the death rate per encounter of prey, (negative)
c is the natural death rate of predators, (negative)
d is the efficiency of turning predated prey into predators.(positive) 
"""

def compute_pp_state(mstate):

    if(DEBUG_OVERRIDE):
        mstate = override_mstate
    try: 
        #translate
        r = [mstate_weight_to_relation(mkey, mval) for mkey, mval in mstate.items()]
        # merge all keys
        r = reduce(lambda a, b: combine_dicts(a, b), r, default_relations)
        # group into relations
        r = relations_to_groups(r)
        return r
    except Exception as e:
        print(e)
        return None


