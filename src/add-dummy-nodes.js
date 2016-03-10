
export default function addDummyNodes(G) {
  // Loop through edges, looking for ones longer than one rank gap
  G.edges().forEach(e => {
    const V = G.node(e.v), W = G.node(e.w);
    let r = V.rank, id, dummyRanks = [];

    G.edge(e).source = V;
    G.edge(e).target = W;

    if (r + 1 < W.rank) {
      // add more to get forwards
      while (++r < W.rank) {
        dummyRanks.push(r);
      }
      replaceEdge(G, e, dummyRanks, 'r');

    } else if (r > W.rank) {
      // add more to get backwards
      if (V.direction !== 'l')
        dummyRanks.push(r);  // turn around
      while (r-- > W.rank + 1) {
        dummyRanks.push(r);
      }
      if (W.direction !== 'l')
        dummyRanks.push(r);  // turn around
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
      G.setEdge(nn[i], nn[i + 1], {
        source: G.node(oldEdge.v),
        target: G.node(oldEdge.w),
        data: G.edge(oldEdge).data
      }, oldEdge.name);
  });

  G.removeEdge(oldEdge);
}
