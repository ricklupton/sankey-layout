import { alg } from 'graphlib';

export default function initialOrdering(G) {
  let order = [];

  let rank0 = G.nodes()
        .filter(u => G.node(u).rank === 0);

  // XXX should have already reversed cycles by here?

  alg.preorder(G, rank0).forEach(u => {
    const rank = G.node(u).rank;
    if (rank >= order.length) order.push([]);
    order[rank].push(u);
  });

  return order;
}
