import { alg } from 'graphlib';

export default function initialOrdering(G) {
  let order = [];

  const start = G.nodes().filter(u => G.node(u).rank === 0)
          .concat(G.sources());
  if (start.length === 0) {
    throw Error('No sources or nodes with rank 0');
  }

  alg.preorder(G, start).forEach(u => {
    const rank = G.node(u).rank;
    while (rank >= order.length) order.push([]);
    order[rank].push(u);
  });

  return order;
}
