

# groups of relation. each relation should be a pair.
PP_GROUPS = {
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

PP_DEFAULT_RELATIONS = {
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

PP_MSTATE_TO_RELATIONS_FUNCTIONS = {
    "peace": lambda w: { "foxes->rabbits" : -0.01 * w },
    "anger": lambda w: { "foxes->rabbits": -0.01 * w },
    "agriculture": lambda w: { "foxes->rabbits" : -0.01 * w, "rabbits->foxes": 0.01 * w}
}

##


MONUMENT_NAMES = {
    'peacebalance': 'Monument to Peace and Balance',
    'flourishingfauna': 'Monument to Flourishing Fauna',
    'shelterhearth': 'Monument to Shelter\'s Hearth',
    'productivexchange': 'Monument to Productive Exchange',
    'knowledgecomputation': 'Monument to Knowledge and Computation',
    'contemplation': 'Monument to Self-Contemplation',
    'play': 'Monument to Play and Cooperation'
}

"""
architecture
art
business
biology
cognition
computation
design
economics
humanities
media
politics
society
systems
science
"""

MONUMENT_TOPICS = {
    'peacebalance': {
        'society': 0.5,
        'humanities': 0.15,
        'media': 0.15,
        'art': 0.1
    },
    'productiveexchange': {
        'economics': 0.6,
        'politics': 0.15,
        'systems': 0.1,
        'business': 0.15
    },
    'flourishingfauna': {
        'biology': 0.65,
        'science': 0.2,
        'cognition': 0.05,
        'systems': 0.1
    },
    'shelterhearth': {
        'architecture': 0.7,
        'design': 0.2,
        'art': 0.1
    },
    'knowledgecomputation': {
        'computation': 0.6,
        'cognition': 0.4
    },
    'contemplation': {
        'humanities': 0.5,
        'systems': 0.2,
        'cognition': 0.7,
    },
    'play': {
        'society': 0.4,
        'humanities': 0.3,
        'art': 0.5,
    }
}

MONUMENT_GRAPH = {
    'productiveexchange': {
        'flourishingfauna': -0.1
    },
    'flourishingfauna': {},
    'shelterhearth': {},
    'peacebalance': {},
    'knowledgecomputation': {}
}
