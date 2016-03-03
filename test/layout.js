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
    rank.forEach(node => {
      G.setNode(node, { rank: i });
    });
  });

  // main flow
  G.setEdge('input', 'oven', {value: 2.5});
  G.setEdge('oven', 'coke', {value: 2.5});
  G.setEdge('coke', 'sinter', {value: 1});
  G.setEdge('coke', '_coke_bf', {value: 1.5});
  G.setEdge('_coke_bf', 'bf', {value: 1.5});
  G.setEdge('sinter', 'bf', {value: 1});
  G.setEdge('bf', 'output', {value: 1});
  G.setEdge('bf', 'export', {value: 1});

  // additional export flows, and input-sinter
  G.setEdge('sinter', '_sinter_export', {value: 0.2});
  G.setEdge('_sinter_export', 'export', {value: 0.2});
  G.setEdge('oven', '_oven_export_1', {value: 0.2});
  G.setEdge('_oven_export_1', '_oven_export_2', {value: 0.2});
  G.setEdge('_oven_export_2', '_oven_export_3', {value: 0.2});
  G.setEdge('_oven_export_3', 'export', {value: 0.2});
  G.setEdge('input', '_input_sinter_1', {value: 0.2});
  G.setEdge('_input_sinter_1', '_input_sinter_2', {value: 0.2});
  G.setEdge('_input_sinter_2', 'sinter', {value: 0.2});

  // return loops
  G.setEdge('oven', '_oven_input_1', {value: 0.5});
  G.setEdge('_oven_input_1', '_oven_input_2', {value: 0.5});
  G.setEdge('_oven_input_2', 'input', {value: 0.5});
  G.setEdge('bf', '_bf_input_1', {value: 0.5});
  G.setEdge('_bf_input_1', '_bf_input_2', {value: 0.5});
  G.setEdge('_bf_input_2', '_bf_input_3', {value: 0.5});
  G.setEdge('_bf_input_3', '_bf_input_4', {value: 0.5});
  G.setEdge('_bf_input_4', '_bf_input_5', {value: 0.5});
  G.setEdge('_bf_input_5', 'input', {value: 0.5});

  return {G};
}
