import orderEdges from 'lib/edge-ordering';

import { Graph } from 'graphlib';
import test from 'prova';

import assertAlmostEqual from '../assert-almost-equal';


test('edgeOrdering: to neighbouring layers', t => {
  const {G} = example4to1();
  orderEdges(G);

  const nodes = G.nodes().map(u => G.node(u));

  t.deepEqual(nodes[0].incoming, [], 'node 0 incoming');
  t.deepEqual(nodes[1].incoming, [], 'node 1 incoming');
  t.deepEqual(nodes[2].incoming, [], 'node 2 incoming');
  t.deepEqual(nodes[3].incoming, [], 'node 3 incoming');

  t.deepEqual(nodes[0].outgoing, [{v: '0', w: '4'}], 'node 0 outgoing');
  t.deepEqual(nodes[1].outgoing, [{v: '1', w: '4'}], 'node 1 outgoing');
  t.deepEqual(nodes[2].outgoing, [{v: '2', w: '4'}], 'node 2 outgoing');
  t.deepEqual(nodes[3].outgoing, [{v: '3', w: '4'}], 'node 3 outgoing');

  t.deepEqual(nodes[4].incoming, [
    {v: '0', w: '4'},
    {v: '1', w: '4'},
    {v: '2', w: '4'},
    {v: '3', w: '4'},
  ], 'node 4 incoming');
  t.deepEqual(nodes[4].outgoing, [], 'node 4 outgoing');

  // change ordering: put node 3 at top, node 0 at bottom
  G.node('0').y = G.node('3').y;
  G.node('3').y = 0;
  orderEdges(G);

  const nodes1 = G.nodes().map(u => G.node(u));
  t.deepEqual(nodes1[4].incoming, [
    {v: '3', w: '4'},
    {v: '1', w: '4'},
    {v: '2', w: '4'},
    {v: '0', w: '4'},
  ], 'nodes 0 and 3 have swapped');

  t.end();
});


test('edgeOrdering: starting and ending in same slice', t => {
  const {G} = exampleLoops();
  orderEdges(G);

  const nodes = G.nodes().map(u => G.node(u));

  const incoming = G.node('2').incoming,
        outgoing = G.node('2').outgoing;

  // left-hand side of 2
  t.deepEqual(incoming, [
    {v: '1', w: '2'},
    {v: '0', w: '2'},
    {v: '4', w: '2'},
    {v: '3', w: '2'},
  ], 'incoming edges into 2');

  // right-hand side of 2
  t.deepEqual(outgoing, [
    {v: '2', w: '1'},
    {v: '2', w: '5'},
    {v: '2', w: '4'},
    {v: '2', w: '3'},
  ], 'outgoing edges from 2');

  t.end();
});


function example4to1() {
  let G = new Graph({ directed: true });

  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|4
  // 2|------|
  //       ,-|
  // 3|---/
  //

  G.setNode('0', {x: 0, y: 0});
  G.setNode('1', {x: 0, y: 1});
  G.setNode('2', {x: 0, y: 2});
  G.setNode('3', {x: 0, y: 3});
  G.setNode('4', {x: 1, y: 0});

  G.setEdge('0', '4', {value: 5});
  G.setEdge('1', '4', {value: 5});
  G.setEdge('2', '4', {value: 5});
  G.setEdge('3', '4', {value: 5});

  return {G};
}


function exampleLoops() {
  let G = new Graph({ directed: true });

  //
  //      |-1-|
  //  0 --- 2 --- 5
  //     ||-3-||
  //     |--4--|
  //

  G.setNode('0', {x: 0, y: 1});

  G.setNode('1', {x: 1, y: 0});
  G.setNode('2', {x: 1, y: 1});
  G.setNode('3', {x: 1, y: 2});
  G.setNode('4', {x: 1, y: 3});

  G.setNode('5', {x: 2, y: 1});

  G.setEdge('0', '2', {value: 2});
  G.setEdge('2', '5', {value: 2});
  ['1', '3', '4'].forEach(n => {
    G.setEdge('2', n, {value: 2});
    G.setEdge(n, '2', {value: 2});
  });

  return {G};
}
