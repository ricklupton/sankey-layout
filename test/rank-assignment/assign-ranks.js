import assignRanks from '../../src/rank-assignment';

import { Graph } from 'graphlib';
import test from 'prova';


test('rank assignment: overall', t => {
  let { G, rankSets } = exampleWithLoop();

  // Without rankSets
  assignRanks(G, []);
  const rank1 = G.nodes().map(u => [u, G.node(u).rank]);
  t.deepEqual(rank1, [
    ['a', 0],
    ['b', 1],
    ['c', 2],
    ['d', 1],
    ['e', 3],
    ['f', 0],
    ['g', 1],
    ['h', 0],
  ], 'node ranks without rankSets');

  assignRanks(G, rankSets);
  const rank2 = G.nodes().map(u => [u, G.node(u).rank]);
  t.deepEqual(rank2, [
    ['a', 0],
    ['b', 1],
    ['c', 2],
    ['d', 2],
    ['e', 3],
    ['f', 0],
    ['g', 2],
    ['h', 0],  // this is the initial ranking -- haven't shorted g-h
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
    {v: 'd', w: 'g'},
    {v: 'g', w: 'h'},
  ], 'edges');

  t.end();
});


function exampleWithLoop() {
  //
  //  f -------,    b<-,
  //  a -- b -- c -- e `
  //    `------ d -'
  //              \
  //      <h---<g-`
  //
  const G = new Graph({directed: true});

  G.setEdge('a', 'b');
  G.setEdge('b', 'c');
  G.setEdge('a', 'd');
  G.setEdge('c', 'e');
  G.setEdge('d', 'e');
  G.setEdge('e', 'b');
  G.setEdge('f', 'c');
  G.setEdge('d', 'g');
  G.setEdge('g', 'h');

  G.setNode('g', { reversed: true });
  G.setNode('h', { reversed: true });

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] },
  ];

  return { G, rankSets };
}
