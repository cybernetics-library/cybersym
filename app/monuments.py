from .params import MONUMENT_GRAPH
from collections import defaultdict


def sum_dicts(*dicts):
    sum = defaultdict(int)
    for d in dicts:
        for k, v in d.items():
            sum[k] += v
    return sum


def compute_monuments_state(topic_mixtures):
    """given a list of topic mixtures,
    which each represent a book checkout,
    compute its deterministic monuments state"""

    # initial state
    state = defaultdict(int)

    # for each topic mixture
    # (each represents a book checkout)
    for tm in topic_mixtures:
        # for each topic and its proportion,
        # update the corresponding monument
        state = sum_dicts(state, tm)

        # then compute how each monument
        # influences each other
        influence_update = defaultdict(int)
        for frm, children in MONUMENT_GRAPH.items():
            for to, strength in children.items():
                influence_update[to] += strength * state[frm]

        # apply the influence update
        state = sum_dicts(state, influence_update)

    return state
