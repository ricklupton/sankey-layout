import groupedGraph from 'lib/rank-assignment/grouped-graph';

import { Graph } from 'graphlib';
import test from 'prova';


// XXX reversing edges into Smin and out of Smax?
// XXX reversing edges marked as "right to left"?

test('rank assignment: groupedGraph', t => {
  let { G, rankSets } = exampleWithLoop();

  let G2 = groupedGraph(G, rankSets);

  G2.nodes().sort();
  t.deepEqual(G2.nodes(), ['__S0', '__S1', 'b', 'e', 'f'],
              'nodes');

  t.deepEqual(G2.edges(), [
    {v: '__S0', w: 'b'},
    {v: '__S0', w: '__S1'},
    {v: 'b', w: '__S1'},
    {v: '__S1', w: 'e'},
    {v: 'e', w: 'b'},
    {v: 'f', w: '__S1'},
    {v: '__S0', w: 'f'},
  ], 'edges');
  t.deepEqual(G2.edges().map(e => G2.edge(e)), [
    {},
    {},
    {},
    {},
    {},
    {},
    { temp: true, delta: 0 },
  ], 'edges labels');

  t.end();
});


function exampleWithLoop() {
  const G = new Graph({directed: true});

  G.setEdge('a', 'b');
  G.setEdge('a', 'd');
  G.setEdge('b', 'c');
  G.setEdge('c', 'e');
  G.setEdge('d', 'e');
  G.setEdge('e', 'b');
  G.setEdge('f', 'c');

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] },
  ];

  return { G, rankSets };
}
