import { Graph } from 'graphlib';
import test from 'tape';

import { createGraph } from '../src/utils';
import assignRanks from '../src/rank-assignment';
import addDummyNodes from '../src/add-dummy-nodes';
import ordering from '../src/node-ordering';
import justified from '../src/node-positioning/justified';
import orderEdges from '../src/edge-ordering';
import linkLayout from '../src/edge-positioning';

import sankeyLayout from '../src/layout';


test('combined layout', t => {
  // XXX TODO start from rank assignment

  const {nodes, links} = exampleBlastFurnace();

  //////// Steps ///////

  const G1 = createGraph(nodes, links);
  assignRanks(G1, []);
  addDummyNodes(G1);
  const order = ordering(G1);

  // Position and scale nodes within ranks
  const pos = justified().size([10, 8]);
  const n1 = pos(G1, order);

  // Order incoming and outgoing edges at each node
  orderEdges(G1);

  // Position edges and calculate curvatures
  const f1 = linkLayout()(G1);

  //////// Combined layout ////////

  const layout = sankeyLayout()
          .size([10, 8]);
  layout(links, nodes);

  const n2 = layout.nodes(),
        f2 = layout.links();

  ///////// Compare ////////

  t.deepEqual(n2, n1, 'nodes');

  t.deepEqual(f2, f1, 'links');

  t.end();
});


test('allows ordering without band lists', t => {
  const links = [
    {source: 'A', target: 'B', value: 1},
    {source: 'A', target: 'C', value: 1},
    {source: 'B', target: 'D', value: 1},
  ];

  const orderWithBands = [
    [['A']],
    [['B', 'C']],
    [['D']],
  ];

  const orderWithoutBands = [
    ['A'],
    ['B', 'C'],
    ['D'],
  ];

  const layout1 = sankeyLayout(),
        layout2 = sankeyLayout();

  layout1(links, [], {order: orderWithBands});
  layout2(links, [], {order: orderWithoutBands});

  t.deepEqual(layout1.nodes(), layout2.nodes());
  t.deepEqual(layout1.links(), layout2.links());
  t.end();
});


test('layout: works with empty input', t => {
  t.doesNotThrow(() => {
    sankeyLayout()([], []);
  });

  // ignores nodes in order that aren't in node list
  t.doesNotThrow(() => {
    sankeyLayout()([], [], { order: [[['a']]] });
  });
  t.end();
});


function exampleBlastFurnace() {
  // Simplified example of links through coke oven and blast furnace
  const nodes = [
  ];

  const links = [
    // main flow
    {source: 'input', target: 'oven', value: 2.5},
    {source: 'oven', target: 'coke', value: 2.5},
    {source: 'coke', target: 'sinter', value: 1},
    {source: 'coke', target: 'bf', value: 1.5},
    {source: 'sinter', target: 'bf', value: 1},
    {source: 'bf', target: 'output', value: 1},
    {source: 'bf', target: 'export', value: 1},

    // additional export links, and input-sinter
    {source: 'sinter', target: 'export', value: 0.2},
    {source: 'oven', target: 'export', value: 0.2},
    {source: 'input', target: 'sinter', value: 0.2},

    // return loops
    {source: 'oven', target: 'input', value: 0.5},
    {source: 'bf', target: 'input', value: 0.5},
  ];

  return {nodes, links};
}
