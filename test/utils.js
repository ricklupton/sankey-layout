import { createGraph } from '../src/utils';

import test from 'prova';


test('createGraph', t => {
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

  const G = createGraph(nodes, edges);

  t.deepEqual(G.nodes(), ['a', 'b', 'c', 'd', 'e', 'f']);
  t.equal(G.edges().length, edges.length);

  t.deepEqual(G.node('c'), { data: { id: 'c', title: 'CC' }});

  nodes.push({id: 'xx'});
  t.doesNotThrow(() => { createGraph(nodes, edges); },
                 'ignores non-existant node ids');

  t.end();
});
