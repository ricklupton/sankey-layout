import assignRanks from 'lib/rank-assignment';

import { Graph } from 'graphlib';
import test from 'prova';


test('rank assignment: overall', t => {
  let { G, rankSets } = exampleWithLoop();

  // Check node order
  t.deepEqual(G.nodes(), ['a', 'b', 'c', 'd', 'e', 'f'],
              'nodes');

  // Without rankSets
  assignRanks(G, []);
  t.deepEqual(G.nodes().map(u => G.node(u).rank),
              [0, 1, 2, 1, 3, 0],
              'node ranks without rankSets');

  assignRanks(G, rankSets);
  t.deepEqual(G.nodes().map(u => G.node(u).rank),
              [0, 1, 2, 2, 3, 0],
              'node ranks with rankSets');

  t.end();
});


function exampleWithLoop() {
  const G = new Graph({directed: true});

  G.setEdge('a', 'b');
  G.setEdge('b', 'c');
  G.setEdge('a', 'd');
  G.setEdge('c', 'e');
  G.setEdge('d', 'e');
  G.setEdge('e', 'b');
  G.setEdge('f', 'c');

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] },
  ];

  return { G, rankSets };
}
