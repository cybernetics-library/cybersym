from Ploopy import Ploopy
import time

# World implements Ploopy.
# The World is in charge of running the Ploopy graph,
# as well as changing any Ploopy graph relations based on new input
# as well as output, etc.

# World treates Ploopy as a library that knows nothing about cybersym.

class World:

    # example relations: {'rabbits->foxes': 0.08000000000000002, 'foxes->rabbits': 0.24}
    def __init__(self, state=None):
        self.WorldPloopy = Ploopy()
        if(state):
            parseState
            print(state)

    # update loop
    def update(self):
        self.WorldPloopy.update()
        self.WorldPloopy.pprint()

    def change(self, relations=None):
        if(relations):
            self.WorldPloopy.replace_edges(relations)

    def import_graph(self, g):
        self.WorldPloopy.import_graph(g)

