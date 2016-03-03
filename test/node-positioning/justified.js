import justified from 'lib/node-positioning/justified';
// import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'prova';

import { assertAlmostEqual } from '../assert-almost-equal';


test('justifiedPositioning: scaleToFit', t => {
  const {G, order} = example4to1();
  const pos = justified();

  t.equal(pos.scale(), null, 'initially scale is null');

  pos.scaleToFit(G, order);
  t.equal(pos.scale(), 1 / 20 * 0.5, 'default scaling with 50% whitespace');

  pos.whitespace(0).scaleToFit(G, order);
  t.equal(pos.scale(), 1 / 20 * 1.0, 'scaling with 0% whitespace');

  t.end();
});


test('justifiedPositioning: basic positioning', t => {
  const {G, order} = example4to1();

  // 50% whitespace: scale = 8 / 20 * 0.5 = 0.2
  // margin = 8 * 50% / 5 = 0.8
  // total node height = 4 * 5 * 0.2 = 4
  // remaining space = 8 - 4 - 2*0.8 =2.4
  // spread betweeen 3 gaps = 0.8
  const pos = justified().size([1, 8]);
  pos(G, order);

  const nodes = G.nodes().map(u => G.node(u));

  t.deepEqual(nodes.map(node => node.dy), [1, 1, 1, 1, 4], 'node heights');
  assertAlmostEqual(t, nodes.map(node => node.y), [
    0.8,
    0.8 + 1 + 0.8,
    0.8 + 1 + 0.8 + 1 + 0.8,
    0.8 + 1 + 0.8 + 1 + 0.8 + 1 + 0.8,
    0.8], 1e-6, 'node y');

  assertAlmostEqual(t, nodes.map(node => node.x), [0, 0, 0, 0, 1], 'node x');
  t.end();
});


test('justifiedPositioning: nodes with zero value are ignored', t => {
  const {G, order} = example4to1();
  G.setEdge('2', '4', {value: 0});

  const pos = justified();
  pos(G, order);

  const nodes = G.nodes().map(u => G.node(u));
  const sep01 = nodes[1].y - nodes[0].y,
        sep13 = nodes[3].y - nodes[1].y;

  t.equal(nodes[2].dy, 0, 'node 2 should have no height');
  assertAlmostEqual(t, sep01, sep13, 1e-6, 'node 2 should not affect spacing of others');

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
  G.setEdge('0', '4', {value: 5});
  G.setEdge('1', '4', {value: 5});
  G.setEdge('2', '4', {value: 5});
  G.setEdge('3', '4', {value: 5});

  let order = [
    ['0', '1', '2', '3'],
    ['4'],
  ];

  return {G, order};
}
