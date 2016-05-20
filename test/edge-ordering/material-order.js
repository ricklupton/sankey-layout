import materialOrder from '../../src/edge-ordering/material-order';

import { Graph } from 'graphlib';
import test from 'tape';

import assertAlmostEqual from '../assert-almost-equal';


test('edgeOrdering: materialOrder', t => {
  const G1 = exampleMaterials(['m1', 'm2']);
  const mo1 = materialOrder(G1, '2');
  t.deepEqual(mo1, ['m1', 'm2']);

  const G2 = exampleMaterials(['m2', 'm1']);
  const mo2 = materialOrder(G2, '2');
  t.deepEqual(mo2, ['m2', 'm1']);

  t.end();
});



function exampleMaterials(materials) {
  let G = new Graph({ directed: true, multigraph: true });

  //
  //  0 --|
  //  1 --|2 -- 3
  //

  G.setNode('0', {x: 0, y: 0});
  G.setNode('1', {x: 0, y: 3});
  G.setNode('2', {x: 1, y: 0.5});
  G.setNode('3', {x: 2, y: 0.5});

  G.setEdge('0', '2', {value: 1.5}, materials[0]);
  G.setEdge('0', '2', {value: 0.5}, materials[1]);
  G.setEdge('1', '2', {value: 0.5}, materials[0]);
  G.setEdge('1', '2', {value: 1.5}, materials[1]);
  G.setEdge('2', '3', {value: 2.0}, materials[0]);
  G.setEdge('2', '3', {value: 2.0}, materials[1]);

  return G;
}
