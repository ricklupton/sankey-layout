import { alg } from 'graphlib';

export default function initialOrdering(G) {
  let order = [];

  const rank0 = G.nodes().filter(u => G.node(u).rank === 0);
  if (rank0.length === 0) {
    throw Error('No nodes with rank 0');
  }

  alg.preorder(G, rank0).forEach(u => {
    const rank = G.node(u).rank;
    while (rank >= order.length) order.push([]);
    order[rank].push(u);
  });

  return order;
}
