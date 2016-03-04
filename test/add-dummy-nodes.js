import addDummyNodes from 'lib/add-dummy-nodes';
import createGraph from 'lib/utils';

import { Graph } from 'graphlib';
import test from 'prova';


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


function assertSetEqual(t, a, b, msg) {
  const x = Array.from(a),
        y = Array.from(b);
  x.sort();
  y.sort();
  t.deepEqual(x, y, msg);
}
