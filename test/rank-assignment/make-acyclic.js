import makeAcyclic from 'lib/rank-assignment/make-acyclic';

import { Graph, alg } from 'graphlib';
import test from 'prova';


test('rank assignment: makeAcyclic', t => {
  let { G } = exampleWithLoop();
  t.ok(!alg.isAcyclic(G), 'initially has a cycle');
  makeAcyclic(G, 'a');
  t.ok(alg.isAcyclic(G), 'made acyclic');

  t.deepEqual(G.nodes(), ['a', 'b', 'c', 'd'], 'nodes');
  t.deepEqual(G.edges(), [
    {v: 'a', w: 'b'},
    {v: 'b', w: 'c'},
    {v: 'a', w: 'c'},
    {v: 'b', w: 'd'},
    {v: 'a', w: 'd'},  // REVERSED!
  ], 'edges');
  t.deepEqual(G.edges().map(e => G.edge(e)), [
    {},
    {},
    {},
    {},
    { reversed: true },
  ], 'edges labels');

  t.end();
});


// test('assignInitialRanks', t => {
//   let { G, rankSets } = exampleWithLoop();
//   assignInitialRanks(G);

//   t.deepEqual(ranks.map(d => d.length),
//               order.map(d => d.length),
//               'order is same length as original list of ranks');

//   t.end();
// });


function exampleWithLoop() {
  const G = new Graph({directed: true});
  G.setEdge('a', 'b', {});
  G.setEdge('b', 'c', {});
  G.setEdge('a', 'c', {});
  G.setEdge('b', 'd', {});
  G.setEdge('d', 'a', {});

  return { G };
}
