import ordering from 'lib/node-ordering';
import sankeyDiagram from 'lib/svg/diagram';

import { Graph } from 'graphlib';
import d3 from 'd3';
import test from 'prova';


test('diagram', t => {
  console.log('TEST!');

  // prepare data
  const {G, ranks} = exampleBlastFurnaceWithDummy();
  const order = ordering(G, ranks);

  // diagram

  const diagram = sankeyDiagram();

  d3.select('body').append('div')
    .datum({graph: G, order: order})
    .call(diagram);

  t.end();
});


function exampleBlastFurnaceWithDummy() {
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

  // node directions
  G.nodes().forEach(u => G.setNode(u, { direction: 'r', data: {} }));
  ['_bf_input_1', '_bf_input_2', '_bf_input_3', '_bf_input_4', '_bf_input_5',
   '_oven_input_1', '_oven_input_2'].forEach(u => {
     G.setNode(u, { direction: 'l', data: {} });
   });

  return {G, ranks};
}
