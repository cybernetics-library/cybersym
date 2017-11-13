from collections import defaultdict
from functools import reduce
import copy
from .lvsolver import lotka_volterra_phase_curve
from .params import PP_MSTATE_TO_RELATIONS_FUNCTIONS, PP_DEFAULT_RELATIONS, PP_GROUPS 

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
    if(mstate_key in PP_MSTATE_TO_RELATIONS_FUNCTIONS):
        return PP_MSTATE_TO_RELATIONS_FUNCTIONS[mstate_key](weight)
    else:
        return {}

def relations_to_groups(relations):
    r = defaultdict(dict)

    # sort relations into groups
    for thisrel, thisval in relations.items():
        thisgroup = [k for k, v in PP_GROUPS.items() if thisrel.split("->")[0] in [v['predator'], v['prey']]]
        if(len(thisgroup) > 0): 
            r[thisgroup[0]][thisrel] =  thisval

    # insert into groups dict
    groups = copy.deepcopy(PP_GROUPS)
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

        r = reduce(lambda a, b: combine_dicts(a, b), r, PP_DEFAULT_RELATIONS)
        # group into relations
        r = relations_to_groups(r)
        return r
    except Exception as e:
        print(e)
        return None


