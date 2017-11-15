
# groups of relation. each relation should be a pair.

PP_NAMES = {
    "friendsdrama": "The Cycle of Friends and Drama"
}

PP_GROUPS = {
    "rabbitfoxes": {
        "predator": "foxes",
        "prey": "rabbits",
    },
    "friendsdrama": {
        "predator": "drama",
        "prey": "friends",
    }
}
# these are default relations. any relation that doesn't exist will default to 0.
PP_DEFAULT_RELATIONS = {
    "rabbits->rabbits" : 0.66,
    "foxes->rabbits": -1.33,
    "foxes->foxes" : -1,
    "rabbits->foxes" : 1,
    "drama->friends": 0.1,
    "drama->drama" : 0.1,
    "friends->drama" : 0,
    "friends->friends" : 0
}

# example: "monument factor": { "relation": "increase"}
# contains functions for converting monument state into relation.
# relation values are all combined together.

PP_MSTATE_TO_RELATIONS_FUNCTIONS = {
    "peacebalance": lambda w: { "foxes->rabbits" : -10.01 * w },
    "flourishingfauna": lambda w: { "foxes->rabbits" : -0.01 * w,
        "rabbits->foxes": 0.01 * w },
    "shelterhearth": lambda w: { },
    "productiveexchange": lambda w: { "friends->friends": 0.1 * w },
    "knowledgecomputation": lambda w: { },
    "contemplation": lambda w: { },
    "play": lambda w: { "friends->friends": 0.1 * w },
}

##


MONUMENT_NAMES = {
    'peacebalance': 'Monument to Peace and Balance',
    'flourishingfauna': 'Monument to Flourishing Fauna',
    'shelterhearth': 'Monument to Shelter\'s Hearth',
    'productiveexchange': 'Monument to Productive Exchange',
    'knowledgecomputation': 'Monument to Knowledge and Computation',
    'contemplation': 'Monument to Self-Contemplation',
    'play': 'Monument to Play and Cooperation',
    'viableutopias': 'Monument to Viable Utopias'
}

TOPICS = [
    'architecture',
    'art',
    'business',
    'biology',
    'cognition',
    'computation',
    'design',
    'economics',
    'humanities',
    'media',
    'politics',
    'society',
    'systems',
    'science'
]

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
    },
    'viableutopias': {
        'society': 0.4,
        'systems': 0.3,
        'economics': 0.5,
        'politics': 0.3,
        'business': 0.3,
        'architecture': 0.1
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
