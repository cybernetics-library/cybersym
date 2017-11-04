from collections import defaultdict, Counter
import operator
import networkx


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
    "anger": lambda w: { "foxes->rabbits": 0.5 * w },
    "agriculture": lambda w: { "rabbits->foxes" : 0.1 * w }
}


###################
###################

def combine_dicts(a, b, op=operator.add):
    return dict(a.items() + b.items() +
        [(k, op(a[k], b[k])) for k in set(b) & set(a)])

""" example mstate:
{
  "agriculture": 0.8, 
  "anger": 0.6, 
  "peace": 0.2
}
"""

def state_to_relations(mstate):
    try: 
        converted_relations = [mstate_to_relations_functions[mkey](mval) for mkey, mval in mstate.items()]
        merged_relations = reduce(lambda a, b: combine_dicts(a, b), converted_relations, default_relations)
        return merged_relations
    except:
        return None
