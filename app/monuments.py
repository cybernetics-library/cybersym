from collections import defaultdict
from .params import MONUMENT_GRAPH, MONUMENT_TOPICS


def sum_dicts(*dicts):
    sum = defaultdict(int)
    for d in dicts:
        for k, v in d.items():
            sum[k] += v
    return sum


def clamp(state):
    """clamp to [0, 1]"""
    return {k: max(min(v, 1), 0) for k, v in state}


def mixture_update(topic_mixture):
    """compute a monument state update
    given a topic mixture"""
    update = {}
    for monument, mixture in MONUMENT_TOPICS.items():
        update[monument] = 0
        for topic, weight in topic_mixture.items():
            update[monument] += mixture.get(topic, 0) * weight
    return update


def compute_monuments_state(topic_mixtures):
    """given a list of topic mixtures,
    which each represent a book checkout,
    compute its deterministic monuments state"""

    # initial state
    state = {t: 0 for t in MONUMENT_GRAPH.keys()}

    # for each topic mixture
    # (each represents a book checkout)
    for tm in topic_mixtures:
        # for each topic and its proportion,
        # update the corresponding monument
        update = mixture_update(tm)
        state = sum_dicts(state, update)

        # then compute how each monument
        # influences each other
        influence_update = defaultdict(int)
        for frm, children in MONUMENT_GRAPH.items():
            for to, strength in children.items():
                influence_update[to] += strength * state[frm]

        # apply the influence update
        state = sum_dicts(state, influence_update)

    return clamp(state)
