import { Graph } from 'graphlib';


export function createGraph(nodes, edges) {
  const G = new Graph({directed: true, multigraph: true});

  edges.forEach(edge => {
    G.setEdge(edge.source, edge.target, { data: edge }, edge.type);
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

  // Add references to the source and target details of each edge.
  G.edges().forEach(e => {
    G.edge(e).source = G.node(e.v);
    G.edge(e).target = G.node(e.w);
  });

  return G;
}

