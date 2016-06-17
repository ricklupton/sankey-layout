import { alg } from 'graphlib';

export default function initialOrdering(G) {
  let order = [];

  let start = G.nodes()
        .filter(u => G.node(u).rank === 0)
        .concat(G.sources());
  if (start.length === 0) {
    // start with first node even if it's not a source or rank 0
    start = G.nodes().slice(0, 1);
  }

  alg.preorder(G, start).forEach(u => {
    const rank = G.node(u).rank;
    while (rank >= order.length) order.push([]);
    order[rank].push(u);
  });

  return order;
}
