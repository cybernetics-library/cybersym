from collections import defaultdict
from functools import reduce


# LOGIC BELOW ###################

# these are default relations. These should only be used to illustrate what edges are going to be used. 
# will be overriden by mstate_to_relations_functions.

default_relations = {
    "foxes->rabbits": 0,
    "rabbits->foxes" : 0
}

# example: "monument factor": { "relation": "increase"}
# contains functions for converting monument state into relation.
# relation values are all combined together.

mstate_to_relations_functions = {
    "peace": lambda w: { "foxes->rabbits" : -0.3 * w },
    "anger": lambda w: { "foxes->rabbits": -0.2 * w },
    "agriculture": lambda w: { "foxes->rabbits" : -0.3 * w, "rabbits->foxes": 0.8 * w}
}

OVERRIDE = True

override_relations = {
        "foxes->foxes": -0.2,
        "foxes->rabbits": -0.0005,
        "rabbits->rabbits": 0.04,
        "rabbits->foxes": 0.0004
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

""" example mstate:
{
  "agriculture": 0.8, 
  "anger": 0.6, 
  "peace": 0.2
}
"""


def relations_to_ploopy_relations(relations):
    edges = [(key.split("->")[0], key.split("->")[1], round(val, 5)) for key,val in relations.items()]
    r = defaultdict(lambda : defaultdict(float))
    for edge in edges:
        r[edge[0]][edge[1]] = edge[2]
    return r


def monument_state_to_relations(mstate):
    if(OVERRIDE):
        ploopy_relations = relations_to_ploopy_relations(override_relations)
        return ploopy_relations

    try: 
        converted_relations = [mstate_to_relations_functions[mkey](mval) for mkey, mval in mstate.items()]
        merged_relations = reduce(lambda a, b: combine_dicts(a, b), converted_relations, default_relations)
        ploopy_relations = relations_to_ploopy_relations(merged_relations)
        return ploopy_relations
    except Exception as e:
        print(e)
        return None

