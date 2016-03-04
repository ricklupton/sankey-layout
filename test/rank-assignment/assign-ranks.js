import assignRanks from 'lib/rank-assignment';

import { Graph } from 'graphlib';
import test from 'prova';


test('rank assignment: overall', t => {
  let { G, rankSets } = exampleWithLoop();

  // Without rankSets
  const rank1 = assignRanks(G, []);
  t.deepEqual(rank1, [
    ['a', 'f'],
    ['b', 'd'],
    ['c'],
    ['e'],
  ], 'node ranks without rankSets');

  const rank2 = assignRanks(G, rankSets);
  t.deepEqual(rank2, [
    ['a', 'f'],
    ['b'],
    ['c', 'd'],
    ['e'],
  ], 'node ranks with rankSets');

  // Edges are still in original orientation
  t.deepEqual(G.edges(), [
    {v: 'a', w: 'b'},
    {v: 'b', w: 'c'},
    {v: 'a', w: 'd'},
    {v: 'c', w: 'e'},
    {v: 'd', w: 'e'},
    {v: 'e', w: 'b'},
    {v: 'f', w: 'c'},
  ], 'edges');

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
