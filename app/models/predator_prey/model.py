from collections import defaultdict
import operator

model_monument_to_pp_influence = {
        # example: "monument factor": { "pp_model_factor": "increase"}
        "peace": {"rabbits": 0.1, "foxes": -0.1},
        "anger": {"foxes": 0.5},
        "agriculture": {"rabbits": 0.5}
        }

model_pp = [
        "rabbits foxes -3",
        "foxes rabbits +3",
        "food crumbs cockroaches +1",
        "cockroaches food crumbs -1"
        ]



def combine_dicts(a, b, op=operator.add):
    return dict(a.items() + b.items() +
        [(k, op(a[k], b[k])) for k in set(b) & set(a)])


def monuments_delta_to_pp(prev_monuments, monuments):

    delta = defaultdict(float)
    for k, v in monuments.items():
        for i, j in model_monument_to_pp_influence[k].items():
            delta[i] += j * v
    # could be more pythonic

    return delta


