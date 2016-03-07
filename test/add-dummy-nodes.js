import addDummyNodes from '../src/add-dummy-nodes';
import createGraph from '../src/utils';

import { Graph } from 'graphlib';
import test from 'prova';
import { assertSetEqual } from './assertions';


test('addDummyNodes', t => {
  const G = new Graph({directed: true});

  G.setEdge('a', 'b', {data: {}});
  G.setEdge('b', 'c', {data: {}});
  G.setEdge('a', 'd', {data: {extra: 42}});
  G.setEdge('c', 'e', {data: {}});
  G.setEdge('d', 'e', {data: {}});
  G.setEdge('e', 'b', {data: {}});
  G.setEdge('f', 'c', {data: {}});

  const ranks = [
    ['a', 'f'],
    ['b'],
    ['c', 'd'],
    ['e'],
  ];

  ranks.forEach((rank, i) => {
    rank.forEach(u => {
      G.setNode(u, { rank: i, data: {} });
    });
  });

  G.node('c').data = { title: 'CC' };

  addDummyNodes(G);

  assertSetEqual(t, G.nodes(),
                 ['__a_d_1',
                  '__e_b_1', '__e_b_2', '__e_b_3',
                  '__f_c_1',
                  'a', 'b', 'c', 'd', 'e', 'f',
                 ],
                 'nodes');

  t.deepEqual(G.node('a'), { rank: 0, data: {} }, 'node label a');
  t.deepEqual(G.node('__e_b_1'), { rank: 1, dummy: true, data: null, direction: 'l' }, 'node label __e_b_1');
  t.deepEqual(G.node('c'), { rank: 2, data: { title: 'CC' } }, 'node label c');

  t.deepEqual(G.edge('a', 'b'),
              { data: {} },
              'edge label a-b');
  t.deepEqual(G.edge('a', '__a_d_1'),
              { data: { extra: 42 } },
              'edge label a-d');

  t.end();
});


test('addDummyNodes: reversed nodes', t => {

  // left to left
  const G1 = new Graph({directed: true});
  G1.setEdge('a', 'b', {data: {}});
  G1.setNode('a', { rank: 1, direction: 'l' });
  G1.setNode('b', { rank: 0, direction: 'l' });
  addDummyNodes(G1);

  assertSetEqual(t, G1.nodes(), ['a', 'b'], 'G1 nodes');
  assertSetEqual(t, G1.edges(), [{v: 'a', w: 'b'}], 'G1 edges');

  // right to left
  const G2 = new Graph({directed: true});
  G2.setEdge('a', 'b', {data: {}});
  G2.setNode('a', { rank: 1, direction: 'r' });
  G2.setNode('b', { rank: 0, direction: 'l' });
  addDummyNodes(G2);

  assertSetEqual(t, G2.nodes(), ['a', 'b', '__a_b_1'], 'G2 nodes');
  assertSetEqual(t, G2.edges(), [
    {v: 'a', w: '__a_b_1'},
    {v: '__a_b_1', w: 'b'},
  ], 'G2 edges');

  // right to left
  const G3 = new Graph({directed: true});
  G3.setEdge('a', 'b', {data: {}});
  G3.setNode('a', { rank: 1, direction: 'l' });
  G3.setNode('b', { rank: 0, direction: 'r' });
  addDummyNodes(G3);

  assertSetEqual(t, G3.nodes(), ['a', 'b', '__a_b_0'], 'G3 nodes');
  assertSetEqual(t, G3.edges(), [
    {v: 'a', w: '__a_b_0'},
    {v: '__a_b_0', w: 'b'},
  ], 'G3 edges');

  t.end();
});
