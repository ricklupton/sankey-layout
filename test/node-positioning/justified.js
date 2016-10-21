import justified from '../../src/node-positioning/justified';
// import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'tape';

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
    2  // centred
  ], 1e-6, 'node y');

  assertAlmostEqual(t, nodes.map(node => node.x), [0, 0, 0, 0, 1], 'node x');
  t.end();
});


test('justifiedPositioning: override', t => {
  const {G, order} = example4to1();

  // margin = 8 * 50% / 5 = 0.8
  const margin = 8 * 0.5 / 5;
  const pos = justified().size([1, 8]);

  console.log('------ before', G.node('4'));
  pos(G, order);
  console.log('------ after', G.node('4'));

  const autoY = G.node('4').y;

  // Force to top of band
  G.node('4').data.forceY = 0;
  pos(G, order);
  t.notEqual(G.node('4').y, autoY, 'forced y - changed 1');
  assertAlmostEqual(t, G.node('4').y, margin, 1e-3, 'forced y - value 1');

  // Force to bottom of band
  G.node('4').data.forceY = 1;
  pos(G, order);
  t.notEqual(G.node('4').y, autoY, 'forced y - changed 2');
  assertAlmostEqual(t, G.node('4').y, 8 - margin - G.node('4').dy, 1e-3, 'forced y - value 2');

  t.end();
});


test('justifiedPositioning: nodes with zero value are ignored', t => {
  const {G, order} = example4to1();
  G.setEdge('2', '4', {data: {value: 0}});

  const pos = justified();
  pos(G, order);

  const nodes = G.nodes().map(u => G.node(u));
  const sep01 = nodes[1].y - nodes[0].y,
        sep13 = nodes[3].y - nodes[1].y;

  t.equal(nodes[2].dy, 0, 'node 2 should have no height');
  assertAlmostEqual(t, sep01, sep13, 1e-6, 'node 2 should not affect spacing of others');

  t.end();
});


test('justifiedPositioning: bands', t => {
  const {G, order} = exampleBands();

  const pos = justified().size([1, 8]);
  pos(G, order);

  // 50% whitespace: scale = 8 / 20 * 0.5 = 0.2
  const scale = 8 / 30 * 0.5,
        margin1 = ( 5/30) * 8 / 5,
        margin2 = (25/30) * 8 / 5,
        nodeHeights = (5 + 10 + 15) * scale;
        // space = 8 - nodeHeights - 2 * margin,
        // gap

  const nodes = G.nodes().map(u => G.node(u));

  // Bands should not overlap
  const yb = margin1 + nodes[0].dy + margin1;
  t.ok(nodes[0].y >= margin1, 'node 0 >= margin');
  t.ok(nodes[2].y >= margin1, 'node 2 >= margin');
  t.ok(nodes[0].y + nodes[0].dy < yb, 'node 0 above boundary');
  t.ok(nodes[2].y + nodes[2].dy < yb, 'node 2 above boundary');

  t.ok(nodes[1].y > yb, 'node 1 below boundary');
  t.ok(nodes[3].y > yb, 'node 3 below boundary');
  t.ok(nodes[4].y > yb, 'node 4 below boundary');
  t.ok(nodes[1].y + nodes[1].dy <= 8, 'node 1 within height');
  t.ok(nodes[3].y + nodes[3].dy <= 8, 'node 3 within height');
  t.ok(nodes[4].y + nodes[4].dy <= 8, 'node 4 within height');

  t.end();
});


test('justifiedPositioning: horizontal distribution', t => {
  let G, order, nodes;

  // no bends
  G = new Graph({ directed: true });
  G.setNode('0', { });
  G.setNode('1', { });
  G.setNode('2', { });
  G.setEdge('0', '1', { data: { value: 3 } });
  G.setEdge('1', '2', { data: { value: 3 } });
  order = [
    [ ['0'] ], [ ['1'] ], [ ['2'] ],
  ];

  justified().size([200, 200])(G, order);
  nodes = G.nodes().map(u => G.node(u));
  assertAlmostEqual(t, nodes.map(node => node.x), [0, 100, 200], 1e-3, 'node x, no bends');

  // with bends
  G = new Graph({ directed: true });
  G.setEdge('0', '1', { data: { value: 6 } });
  G.setEdge('1', '2', { data: { value: 3 } });
  G.setEdge('1', '3', { data: { value: 3 } });
  order = [
    [ ['0'] ], [ ['1'] ], [ ['2', '3'] ],
  ];

  justified().size([20, 50])(G, order);
  nodes = G.nodes().map(u => G.node(u));
  assertAlmostEqual(t, nodes.map(node => node.x), [0, 4.27, 20, 20], 1e-2, 'node x with bends');

  // with 2 bends & not enough space
  G = new Graph({ directed: true });
  G.setEdge('0', '2', { data: { value: 3 } });
  G.setEdge('1', '2', { data: { value: 3 } });
  G.setEdge('2', '3', { data: { value: 3 } });
  G.setEdge('2', '4', { data: { value: 3 } });
  order = [
    [ ['0', '1'] ], [ ['2'] ], [ ['3', '4'] ],
  ];

  justified().size([20, 50])(G, order);
  nodes = G.nodes().map(u => G.node(u));
  assertAlmostEqual(t, nodes.map(node => node.x), [0, 0, 10, 20, 20], 1e-2, 'node x with 2 bends');
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
  G.setEdge('0', '4', {data: {value: 5}});
  G.setEdge('1', '4', {data: {value: 5}});
  G.setEdge('2', '4', {data: {value: 5}});
  G.setEdge('3', '4', {data: {value: 5}});

  G.nodes().forEach(u => G.setNode(u, { data: {} }));

  let order = [
    ['0', '1', '2', '3'],
    ['4'],
  ];

  return {G, order};
}


function exampleBands() {
  let G = new Graph({ directed: true });

  // 0 -- 2         : band x
  //
  //      1 -- 3    : band y
  //        `- 4    :
  //
  G.setEdge('0', '2', {data: {value: 5}});
  G.setEdge('1', '3', {data: {value: 10}});
  G.setEdge('1', '4', {data: {value: 15}});

  G.nodes().forEach(u => G.setNode(u, { data: {} }));

  let order = [
    [ ['0'], [] ],
    [ ['2'], ['1'] ],
    [ [   ], ['3', '4'] ],
  ];

  return {G, order};
}
