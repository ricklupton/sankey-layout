import { alg } from 'graphlib';

export default function initialOrdering(G, ranks) {
  // deep copy
  let order = ranks.map(rank => rank.slice());

  if (ranks.length > 0) {
    const orderedNodes = alg.preorder(G, ranks[0]);
    order.forEach(rank => {
      rank.sort((a, b) => orderedNodes.indexOf(a) - orderedNodes.indexOf(b));
    });
  }

  return order;
}
