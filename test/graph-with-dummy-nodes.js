import graphWithDummyNodes from 'lib/graph-with-dummy-nodes';

import test from 'prova';


test('graph with dummy nodes', t => {
  // required?
  const nodes = [
    {id: 'c', title: 'CC'},
  ];

  const edges = [
    {source: 'a', target: 'b'},
    {source: 'b', target: 'c'},
    {source: 'a', target: 'd', extra: 42 },
    {source: 'c', target: 'e'},
    {source: 'd', target: 'e'},
    {source: 'e', target: 'b'},
    {source: 'f', target: 'c'},
  ];

  const ranks = [
    ['a', 'f'],
    ['b'],
    ['c', 'd'],
    ['e'],
  ];

  const G = graphWithDummyNodes(nodes, edges, ranks);

  assertSetEqual(t, G.nodes(),
                 ['__a_d_1',
                  '__e_b_1', '__e_b_2', '__e_b_3',
                  '__f_c_1',
                  'a', 'b', 'c', 'd', 'e', 'f',
                 ],
                 'nodes');

  t.deepEqual(G.node('a'), { rank: 0, data: {} }, 'node label a');
  t.deepEqual(G.node('__e_b_1'), { rank: 1, dummy: true, data: null, direction: 'l' }, 'node label __e_b_1');
  t.deepEqual(G.node('c'), { rank: 2, data: { id: 'c', title: 'CC' } }, 'node label c');

  t.deepEqual(G.edge('a', 'b'),
              { data: { source: 'a', target: 'b' } },
              'edge label a-b');
  t.deepEqual(G.edge('a', '__a_d_1'),
              { data: { source: 'a', target: 'd', extra: 42 } },
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
