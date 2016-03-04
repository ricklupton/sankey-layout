import { Graph } from 'graphlib';


export default function graphWithDummyNodes(nodes, edges, ranks) {
  const G = new Graph({directed: true});

  edges.forEach(edge => {
    G.setEdge(edge.source, edge.target, { data: edge });
  });

  G.nodes().forEach(u => G.setNode(u, { data: {} }));

  nodes.forEach(node => {
    G.node(node.id).data = node;
  });

  // Put ranks back onto nodes
  ranks.forEach((rank, i) => {
    rank.forEach(u => {
      if (G.hasNode(u)) G.node(u).rank = i;
    });
  });

  // Loop through edges, looking for ones longer than one rank gap
  G.edges().forEach(e => {
    const V = G.node(e.v), W = G.node(e.w);
    let r = V.rank, id, dummyRanks = [];

    if (r + 1 < W.rank) {
      // add more to get forwards
      while (++r < W.rank) {
        dummyRanks.push(r);
      }
      replaceEdge(G, e, dummyRanks, 'r');

    } else if (r > W.rank) {
      // add more to get backwards
      dummyRanks.push(r);
      while (r-- > W.rank) {
        dummyRanks.push(r);
      }
      replaceEdge(G, e, dummyRanks, 'l');
    }
  });

  return G;
}


function replaceEdge(G, oldEdge, dummyRanks, direction) {
  if (dummyRanks.length === 0) return;

  const dummies = dummyRanks.map(r => {
    const id = `__${oldEdge.v}_${oldEdge.w}_${r}`;
    G.setNode(id, { rank: r, dummy: true, data: null, direction: direction });
    return id;
  });

  const nn = [oldEdge.v, ...dummies, oldEdge.w];
  nn.forEach((n, i) => {
    if (i + 1 < nn.length)
      G.setEdge(nn[i], nn[i + 1], { data: G.edge(oldEdge).data });
  });

  G.removeEdge(oldEdge);
}
