from collections import defaultdict
import copy




"""
Ploopy

simple directed graph structure that's loopy-esque
super light weight. Each graph state is a dict.
All functions just return new states.

Example structure is:
{
    edges: {
        "rabbit": {"rabbit" : 0.5, "fox": 0.3 },
        "fox": {"rabbit" : -0.5 }
    },
    nodes: {
        "rabbit": { "value": 0.5, "properties": {} },
        "fox": { "value": 0.5, "properties": {} }
    }
}

update() method updates nodes.
"""


class Ploopy():

    def __init__(self):
        self.Graph = {}
        self.Graph['nodes'] = defaultdict(float)
        self.Graph['edges'] = defaultdict(lambda: defaultdict(float))


    def add_edge(self, node_from_name, node_to_name, weight=1):
        self.Graph['edges'][node_from_name][node_to_name] = weight
        self.create_actor_if_none(name=node_from_name)
        self.create_actor_if_none(name=node_to_name)

    def create_actor_if_none(self, name, value=0, properties={}):
        if(name not in self.Graph['nodes']):
            self.Graph['nodes'][name] = { "value": value, "properties": properties}


    def pprint(self):
        for name, actor in self.Graph['nodes'].items():
            print("{:10}({:3}), properties: {}".format(name, actor['value'], actor['properties']))
        for node_from,nodes_to in self.Graph['edges'].items():
            for node_to, weight in nodes_to.items():
                print("{:10} --> {:10} : {:4}".format(node_from, node_to, weight))


    def replace_edges(self, edges):
        self.Graph['edges'] = edges
        self.add_missing_nodes()

    def add_missing_nodes(self):
        all_node_names = set()
        for node_from,nodes_to in self.Graph['edges'].items():
            all_node_names.add(node_from)
            all_node_names.update([k for k, v in nodes_to.items()])

        for n in all_node_names:
            self.create_actor_if_none(n, value=1)
        

    def update(self):
        self.pprint()

        newG = copy.deepcopy(self.Graph)

        # iterate over each node, then that node's edges.
        # multiply the value of that node with the edge, and add it to the target node's value (in the newG)
        # newG becomes the current graph. 

        for node_from, nodes_to in self.Graph['edges'].items():
            for node_to, weight in nodes_to.items():
                newG['nodes'][node_to]['value'] += self.Graph['nodes'][node_from]['value'] * weight

        self.Graph = newG



