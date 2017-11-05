from Ploopy import Ploopy
import time

# World implements Ploopy.
# The World is in charge of running the Ploopy graph,
# as well as changing any Ploopy graph relations based on new input
# as well as output, etc.

# World treates Ploopy as a library that knows nothing about cybersym.

# this is starting to become a useless wrapper... but keeping here for now.

class World:

    def __init__(self, state=None):
        self.WorldPloopy = Ploopy()
        self.generations_run = 0

    # update loop
    def update(self):
        self.WorldPloopy.update()
        self.generations_run += 1

    def pprint(self):
        print("GENERATION: {}".format(self.generations_run))
        self.WorldPloopy.pprint()

    def replace_edges(self, relations):
        if(relations):
            self.WorldPloopy.replace_edges(relations)

    def import_graph(self, g):
        self.WorldPloopy.import_graph(g)
        if('generations_run' in g):
            self.generations_run = g['generations_run']
        else:
            self.generations_run = 0

    def export_graph(self):
        g = self.WorldPloopy.export_graph()
        g['generations_run'] = self.generations_run
        return g

