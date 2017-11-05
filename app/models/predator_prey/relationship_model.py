import networkx as nx

class Model:

    # example relations: {'rabbits->foxes': 0.08000000000000002, 'foxes->rabbits': 0.24}
    def __init__(self, relations=None):
        if(relations):
            self.relations = relations

    def yo(self):
        print(self.relations, "yo")
