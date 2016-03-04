import assignInitialRanks from 'lib/rank-assignment/initial-rank';

import { Graph } from 'graphlib';
import test from 'prova';


test('rank assignment: assignInitialRanks', t => {
  let { G } = exampleAcyclic();
  assignInitialRanks(G);

  t.deepEqual(G.nodes(), ['a', 'b', 'cd', 'e', 'f'], 'nodes');
  t.deepEqual(G.nodes().map(u => G.node(u).rank),
              [0, 1, 2, 3, 0], 'ranks');

  // Change minimum edge length
  G.setEdge('b', 'cd', { delta: 2 });
  G.setEdge('cd', 'e', { delta: 0 });
  assignInitialRanks(G);

  t.deepEqual(G.nodes().map(u => G.node(u).rank),
              [0, 1, 3, 3, 0], 'updated ranks');
  t.end();
});


function exampleAcyclic() {
  const G = new Graph({directed: true});

  G.setEdge('a', 'b');
  G.setEdge('a', 'cd');
  G.setEdge('b', 'cd');
  G.setEdge('cd', 'e');
  G.setEdge('b', 'e');  // REVERSED from other example
  G.setEdge('f', 'cd');

  return { G };
}