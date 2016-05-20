import groupedGraph from '../../src/rank-assignment/grouped-graph';

import { Graph } from 'graphlib';
import test from 'tape';
import { assertSetEqual } from '../assertions';


// XXX reversing edges into Smin and out of Smax?
// XXX reversing edges marked as "right to left"?

test('rank assignment: groupedGraph', t => {
  let { G, rankSets } = exampleWithLoop();

  let G2 = groupedGraph(G, rankSets);

  const nodes = sortedNodeItems(G2);
  t.deepEqual(nodes, [
    ['0', { type: 'min', nodes: ['a'] }],
    ['1', { type: 'same', nodes: ['c', 'd'] }],
    ['2', { type: 'same', nodes: ['b'] }],
    ['3', { type: 'same', nodes: ['e'] }],
    ['4', { type: 'same', nodes: ['f'] }],
  ], 'nodes');

  t.deepEqual(G2.edges(), [
    {v: '0', w: '2'},  // a-b
    {v: '0', w: '1'},  // a-cd
    {v: '2', w: '1'},  // b-cd
    {v: '1', w: '3'},  // cd-e
    {v: '3', w: '2'},  // e-b
    {v: '4', w: '1'},  // f-cd
  ], 'edges');
  t.deepEqual(G2.edges().map(e => G2.edge(e)), [
    { delta: 1 },
    { delta: 1 },
    { delta: 1 },
    { delta: 1 },
    { delta: 1 },
    { delta: 1 },
  ], 'edges labels');

  t.end();
});


test('rank assignment: groupedGraph with reversed nodes', t => {
  const G = new Graph({directed: true});

  G.setEdge('a', 'b');
  G.setEdge('a', 'c');
  G.setEdge('c', 'd');
  G.setNode('c', { direction: 'l' });
  G.setNode('d', { direction: 'l' });

  let G2 = groupedGraph(G, []);

  const nodes = sortedNodeItems(G2);
  t.deepEqual(nodes, [
    ['0', { type: 'min', nodes: ['a'] }],
    ['1', { type: 'same', nodes: ['b'] }],
    ['2', { type: 'same', nodes: ['c'] }],
    ['3', { type: 'same', nodes: ['d'] }],
  ], 'nodes');

  t.deepEqual(G2.edges(), [
    {v: '0', w: '1'},
    {v: '0', w: '2'},
    {v: '3', w: '2'},    // REVERSED
  ], 'edges');

  t.deepEqual(G2.edges().map(e => G2.edge(e)), [
    { delta: 1 },
    { delta: 0 },
    { delta: 1 },
  ], 'edges labels');

  t.end();
});


test('rank assignment: groupedGraph ignores multiple edges', t => {
  const G = new Graph({directed: true, multigraph: true});
  G.setEdge('a', 'b', {}, 'material1');
  G.setEdge('a', 'b', {}, 'material2');

  const GG = groupedGraph(G, []);

  const nodes = sortedNodeItems(GG);
  t.deepEqual(nodes, [
    ['0', { type: 'min', nodes: ['a'] }],
    ['1', { type: 'same', nodes: ['b'] }],
  ], 'nodes');
  t.deepEqual(GG.edges(), [{v: '0', w: '1'}], 'edges');
  t.end();
});


test('rank assignment: groupedGraph sets delta = 0 on loops', t => {
  // loops (with same source and target) should have zero rank difference
  const G = new Graph({directed: true});
  G.setEdge('a', 'a');
  const GG = groupedGraph(G, []);

  t.deepEqual(GG.edges(), [{v: '0', w: '0'}], 'edges');
  t.deepEqual(GG.edge({v: '0', w: '0'}), { delta: 0}, 'edge has delta == 0');

  t.end();
});

function exampleWithLoop() {
  //
  //  f -------,    b<-,
  //  a -- b -- c -- e `
  //    `------ d -'
  //
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


function sortedNodeItems(G) {
  const nodes = G.nodes().map(u => [u, G.node(u)]);
  nodes.sort(([a], [b]) => a < b ? -1 : b > a ? 1 : 0);
  return nodes;
}
