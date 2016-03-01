import initialOrdering from './initial-ordering';
import swapNodes from './swap-nodes';
import countCrossings from './count-crossings';
import sortNodes from './weighted-median';


export default function ordering(G, maxIterations=25) {
  let order = initialOrdering(G),
      best = order,
      i = 0;

  while (i++ < maxIterations) {
    sortNodes(G, order, (i % 2 == 0));
    // swapNodes(G, order);
    if (allCrossings(G, order) < allCrossings(G, best)) {
      console.log('improved', allCrossings(G, order), order);
      best = copy(order);
    }
  }

  return best;
}


function allCrossings(G, order) {
  let count = 0;
  for (let i = 0; i < order.length - 1; ++i) {
    count += countCrossings(G, order[i], order[i + 1]);
  }
  return count;
}


function copy(order) {
  let result = [];
  for (let rank of order) {
    let r = [];
    result.push(r);
    for (let node of rank) r.push(node);
  }
  return result;
}
