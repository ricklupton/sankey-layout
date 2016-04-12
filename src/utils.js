import { Graph } from 'graphlib';


export function createGraph(nodes, edges) {
  const G = new Graph({directed: true, multigraph: true});

  edges.forEach(edge => {
    G.setEdge(edge.source, edge.target, { data: edge }, edge.material);
  });

  G.nodes().forEach(u => G.setNode(u, { data: {} }));

  nodes.forEach(node => {
    if (G.hasNode(node.id)) {
      G.node(node.id).data = node;

      // XXX should be configurable?
      if (node.direction !== undefined)
        G.node(node.id).direction = node.direction;
    }
  });

  return G;
}

