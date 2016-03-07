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


export default function sortNodes(G, order, sweepDirection=1) {
  if (sweepDirection > 0) {
    for (let r = 1; r < order.length; ++r) {
      let medians = new Map();
      order[r].forEach(u => {
        medians.set(u, medianValue(neighbourPositions(G, order, r, r - 1, u)));
      });
      order[r].sort((a, b) => medians.get(a) - medians.get(b));
      // if (r === 3) console.log('rank 3 ->', Array.from(medians));
      // if (r === 4) console.log('bf ->', neighbourPositions(G, order, r, r - 1, 'bf'));
    }
  } else {
    for (let r = order.length - 2; r >= 0; --r) {
      let medians = new Map();
      order[r].forEach(u => {
        medians.set(u, medianValue(neighbourPositions(G, order, r, r + 1, u)));
      });
      order[r].sort((a, b) => medians.get(a) - medians.get(b));
      // if (r === 3) console.log('rank 3 <-', Array.from(medians));
      // if (r === 4) console.log('bf <-', neighbourPositions(G, order, r, r + 1, 'bf'));
    }
  }
};


export function neighbourPositions(G, order, i, j, u) {
  // current rank i
  // neighbour rank j
  const thisRank = order[i],
        otherRank = order[j];

  const positions = [];

  // neighbouring positions on other rank
  otherRank.forEach((n, i) => {
    if (G.hasEdge(n, u) || G.hasEdge(u, n)) {
      positions.push(i);
    }
  });

  // thisRank.forEach((n, i) => {
  //   if (G.hasEdge(n, u) || G.hasEdge(u, n)) {
  //     positions.push(i);
  //   }
  // });

  positions.sort((a, b) => a - b);

  return positions;
}
