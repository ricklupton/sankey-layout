import { Graph } from 'graphlib';
import test from 'prova';

import ordering from 'lib/node-ordering';
import justified from 'lib/node-positioning/justified';
import orderEdges from 'lib/edge-ordering';
import flowLayout from 'lib/edge-positioning';

import sankeyLayout from 'lib/layout';


test('combined layout', t => {
  // XXX TODO start from rank assignment

  //////// Steps ///////

  // Graph with dummy nodes
  const {G: G1} = exampleBlastFurnaceWithDummy();

  // Assign orders within ranks
  const order = ordering(G1);

  // Position and scale nodes within ranks
  const pos = justified().size([10, 8]);
  pos(G1, order);

  // Order incoming and outgoing edges at each node
  orderEdges(G1);

  // Position edges and calculate curvatures
  const flayout = flowLayout();
  flayout(G1);

  //////// Combined layout ////////

  const layout = sankeyLayout()
          .size([10, 8]);

  const {G: G2} = exampleBlastFurnaceWithDummy();
  layout(G2);

  ///////// Compare ////////

  t.deepEqual(G2.nodes(), G1.nodes(), 'node ids');
  t.deepEqual(G2.nodes().map(u => G2.node(u)),
              G1.nodes().map(u => G1.node(u)),
              'node objects');

  t.deepEqual(G2.edges(), G1.edges(), 'edge ids');
  t.deepEqual(G2.edges().map(e => G2.edge(e)),
              G1.edges().map(e => G1.edge(e)),
              'edge objects');

  t.end();
});


export function exampleBlastFurnaceWithDummy() {
  let G = new Graph({ directed: true });

  // Simplified example of flows through coke oven and blast furnace
  // Padded to have dummy nodes

  let ranks = [
    ['_bf_input_5', 'input', '_oven_input_2'],
    ['_bf_input_4', 'oven', '_oven_input_1', '_input_sinter_1'],
    ['_bf_input_3', 'coke', '_input_sinter_2', '_oven_export_1'],
    ['_bf_input_2', '_coke_bf', 'sinter', '_oven_export_2'],
    ['_bf_input_1', 'bf', '_sinter_export', '_oven_export_3'],
    ['output', 'export'],
  ];

  ranks.forEach((rank, i) => {
    rank.forEach(u => {
      G.setNode(u, { rank: i, data: {} });
    });
  });

  // main flow
  G.setEdge('input', 'oven', {data: {value: 2.5}});
  G.setEdge('oven', 'coke', {data: {value: 2.5}});
  G.setEdge('coke', 'sinter', {data: {value: 1}});
  G.setEdge('coke', '_coke_bf', {data: {value: 1.5}});
  G.setEdge('_coke_bf', 'bf', {data: {value: 1.5}});
  G.setEdge('sinter', 'bf', {data: {value: 1}});
  G.setEdge('bf', 'output', {data: {value: 1}});
  G.setEdge('bf', 'export', {data: {value: 1}});

  // additional export flows, and input-sinter
  G.setEdge('sinter', '_sinter_export', {data: {value: 0.2}});
  G.setEdge('_sinter_export', 'export', {data: {value: 0.2}});
  G.setEdge('oven', '_oven_export_1', {data: {value: 0.2}});
  G.setEdge('_oven_export_1', '_oven_export_2', {data: {value: 0.2}});
  G.setEdge('_oven_export_2', '_oven_export_3', {data: {value: 0.2}});
  G.setEdge('_oven_export_3', 'export', {data: {value: 0.2}});
  G.setEdge('input', '_input_sinter_1', {data: {value: 0.2}});
  G.setEdge('_input_sinter_1', '_input_sinter_2', {data: {value: 0.2}});
  G.setEdge('_input_sinter_2', 'sinter', {data: {value: 0.2}});

  // return loops
  G.setEdge('oven', '_oven_input_1', {data: {value: 0.5}});
  G.setEdge('_oven_input_1', '_oven_input_2', {data: {value: 0.5}});
  G.setEdge('_oven_input_2', 'input', {data: {value: 0.5}});
  G.setEdge('bf', '_bf_input_1', {data: {value: 0.5}});
  G.setEdge('_bf_input_1', '_bf_input_2', {data: {value: 0.5}});
  G.setEdge('_bf_input_2', '_bf_input_3', {data: {value: 0.5}});
  G.setEdge('_bf_input_3', '_bf_input_4', {data: {value: 0.5}});
  G.setEdge('_bf_input_4', '_bf_input_5', {data: {value: 0.5}});
  G.setEdge('_bf_input_5', 'input', {data: {value: 0.5}});

  return {G, ranks};
}
