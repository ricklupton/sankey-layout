import { Graph } from 'graphlib';


export function createGraph(nodes, edges) {
  const G = new Graph({directed: true});

  edges.forEach(edge => {
    G.setEdge(edge.source, edge.target, { data: edge });
  });

  G.nodes().forEach(u => G.setNode(u, { data: {} }));

  nodes.forEach(node => {
    if (G.hasNode(node.id))
      G.node(node.id).data = node;
  });

  return G;
}

