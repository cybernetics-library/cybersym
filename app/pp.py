from collections import defaultdict
from functools import reduce


# LOGIC BELOW ###################

# groups of relation. each relation should be a pair.
groups_of_relations= {
    "rabbitfoxes": ["foxes", "rabbits"],
    "angerjoy": ["anger", "joy"],
    }

# these are default relations. These should only be used to illustrate what edges are going to be used. 
# will be overriden by mstate_to_relations_functions.

default_relations = {
    "foxes->rabbits": 0,
    "rabbits->foxes" : 0,
    "foxes->foxes" : 0,
    "rabbits->rabbits" : 0,
    "anger->joy": 0.1,
    "anger->anger" : 0.1,
    "joy->anger" : 0,
    "joy->joy" : 0
}

# example: "monument factor": { "relation": "increase"}
# contains functions for converting monument state into relation.
# relation values are all combined together.

mstate_to_relations_functions = {
    "peace": lambda w: { "foxes->rabbits" : -0.3 * w },
    "anger": lambda w: { "foxes->rabbits": -0.2 * w },
    "agriculture": lambda w: { "foxes->rabbits" : -0.3 * w, "rabbits->foxes": 0.8 * w}
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
    for thisrel, thisval in relations.items():
        print(thisrel.split("->")[0], thisval)
        thisgroup = [k for k, v in groups_of_relations.items() if thisrel.split("->")[0] in v]
        if(len(thisgroup) > 0): 
            r[thisgroup[0]][thisrel] =  thisval
    return r   
    

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


