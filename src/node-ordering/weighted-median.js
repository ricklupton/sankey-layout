export function medianValue(positions) {
  const m = Math.floor(positions.length / 2);
  if (positions.length === 0) {
    return -1;
  } else if (positions.length % 2 === 1) {
    return positions[m];
  } else if (positions.length === 2) {
    return (positions[0] + positions[1]) / 2;
  } else {
    const left = positions[m-1] - positions[0],
          right = positions[positions.length - 1] - positions[m];
    return (positions[m-1]*right + positions[m]*left) / (left + right);
  }
};


export default function sortNodes(G, order, sweepDirection=1, includeLoops=false) {
  if (sweepDirection > 0) {
    for (let r = 1; r < order.length; ++r) {
      let medians = new Map();
      // console.group('median rank', r, sweepDirection);
      // console.log(order[r]);
      order[r].forEach(u => {
        const neighbour = medianValue(neighbourPositions(G, order, r, r - 1, u, includeLoops));
        // console.log(u, neighbour);
        medians.set(u, neighbour);
      });
      // order[r].sort((a, b) => medians.get(a) - medians.get(b));
      sortByPositions(order[r], medians);
      // console.log(order[r]);
      // console.groupEnd();
      // if (r === 3) console.log('rank 3 ->', Array.from(medians));
      // if (r === 4) console.log('bf ->', neighbourPositions(G, order, r, r - 1, 'bf'));
    }
  } else {
    for (let r = order.length - 2; r >= 0; --r) {
      let medians = new Map();
      // console.group('median rank', r, sweepDirection);
      // console.log(order[r]);
      order[r].forEach(u => {
        const neighbour = medianValue(neighbourPositions(G, order, r, r + 1, u, includeLoops));
        // console.log(u, neighbour);
        medians.set(u, neighbour);
      });
      // order[r].sort((a, b) => medians.get(a) - medians.get(b));
      sortByPositions(order[r], medians);
      // console.log(order[r]);
      // console.groupEnd();
      // if (r === 3) console.log('rank 3 <-', Array.from(medians));
      // if (r === 4) console.log('bf <-', neighbourPositions(G, order, r, r + 1, 'bf'));
    }
  }
};


export function neighbourPositions(G, order, i, j, u, includeLoops=false) {
  // current rank i
  // neighbour rank j
  const thisRank = order[i],
        otherRank = order[j];

  const positions = [];

  // neighbouring positions on other rank
  otherRank.forEach((n, i) => {
    if (G.nodeEdges(n, u).length > 0) {
      positions.push(i);
    }
  });

  if (positions.length === 0 && includeLoops) {
    // if no neighbours in other rank, look for loops to this rank
    // XXX only on one side?
    // console.log('loops:', u);
    thisRank.forEach((n, i) => {
      if (G.nodeEdges(n, u).length > 0) {
        positions.push(i + 0.5);
        console.log('   ', n, i);
      }
    });
  }

  positions.sort((a, b) => a - b);

  return positions;
}


/**
 * Sort arr according to order. -1 in order means stay in same position.
 */
export function sortByPositions(arr, order) {
  const origOrder = new Map(arr.map((d, i) => [d, i]));

  // console.log('sorting', arr, order, origOrder);
  for (let i = 1; i < arr.length; ++i) {
    // console.group('start', i, arr[i]);
    for (let k = i; k > 0; --k) {

      let j = k - 1,
          a = order.get(arr[j]),
          b = order.get(arr[k]);

      // count back over any fixed positions (-1)
      while ((a = order.get(arr[j])) === -1 && j > 0) j--;

      // console.log(j, k, arr[j], arr[k], a, b);
      if (b === -1 || a === -1) {
        // console.log('found -1', a, b, 'skipping', j, k);
        break;
      }

      if (a === b) {
        a = origOrder.get(arr[j]);
        b = origOrder.get(arr[k]);
        // console.log('a == b, switching to orig order', a, b);
      }

      if (b >= a) {
        // console.log('k > k -1, stopping');
        break;
      }
      // console.log('swapping', arr[k], arr[j]);
      // swap arr[k], arr[j]
      [arr[k], arr[j]] = [arr[j], arr[k]];
      // console.log(arr);
    }
    // console.groupEnd();
  }
  // console.log('-->', arr);
}
