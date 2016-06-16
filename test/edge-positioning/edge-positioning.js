import linkLayout from '../../src/edge-positioning';
// import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'tape';

import { assertAlmostEqual, assertNotAlmostEqual } from '../assert-almost-equal';

test('linkLayout: link attributes', t => {
  const {G} = example2to1(0);
  const layout = linkLayout();
  const links = layout(G);

  // ids
  t.deepEqual(links.map(f => f.id), ['0-2-m1', '1-2-m2'], 'f.id');

  // x coordinates
  t.deepEqual(links.map(f => f.x0), [0, 0], 'f.x0');
  t.deepEqual(links.map(f => f.x1), [2, 2], 'f.x1');

  // y coordinates
  t.deepEqual(links.map(f => f.y0), [0.5, 3.5], 'f.y0');
  t.deepEqual(links.map(f => f.y1), [2.5, 3.5], 'f.y1');

  // directions
  t.deepEqual(links.map(f => f.d0), ['r', 'r'], 'f.d0');
  t.deepEqual(links.map(f => f.d1), ['r', 'r'], 'f.d1');

  t.end();
});


test('linkLayout: loose edges', t => {
  const {G} = example2to1(0);
  const layout = linkLayout();
  const links = layout(G);

  // should not overlap
  console.log(links);
  t.ok((links[0].r1 + links[0].dy/2) <= (links[1].r1 - links[1].dy/2),
       'links should not overlap');

  t.end();
});


test('linkLayout: tight curvature', t => {
  // setting f= 0.3 moves up the lower link to constrain the curvature at node
  // 2.
  const {G} = example2to1(0.3);
  const layout = linkLayout();
  const links = layout(G);

  // curvature should no longer be symmetric
  assertNotAlmostEqual(t, links.map(f => f.r0), links.map(f => f.r1), 1e-6,
                       'radius should not be equal at both ends');

  // should not overlap
  assertAlmostEqual(t, (links[0].r1 + links[0].dy/2), (links[1].r1 - links[1].dy/2), 1e-6,
       'link curvatures should just touch');

  t.end();
});


test('linkLayout: maximum curvature limit', t => {
  // setting f=1 moves up the lower link so far the curvature hits the limit
  // 2.
  const {G} = example2to1(1.0);
  const layout = linkLayout();
  const links = layout(G);

  // curvature should no longer be symmetric
  assertNotAlmostEqual(t, links.map(f => f.r0), links.map(f => f.r1), 1e-6,
                       'radius should not be equal at both ends');

  assertAlmostEqual(t, (links[0].r1 - links[0].dy/2), 0, 1e-6,
                    'inner link curvature should be zero');

  t.end();
});


function example2to1(f) {
  let G = new Graph({ directed: true, multigraph: true });

  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|2
  //

  // f == 0 means 1-2 is level
  // f == 1 means 1-2 is tight below 0-2

  const y0 = 0,
        y1 = 1 + (1-f)*2,
        y2 = 2;

  const e02 = {v: '0', w: '2', name: 'm1'},
        e12 = {v: '1', w: '2', name: 'm2'};

  G.setNode('0', {x: 0, y: y0, dy: 1, incoming: [], outgoing: [e02]});
  G.setNode('1', {x: 0, y: y1, dy: 1, incoming: [], outgoing: [e12]});
  G.setNode('2', {x: 2, y: y2, dy: 2, incoming: [e02, e12], outgoing: []});

  G.setEdge('0', '2', {dy: 1}, 'm1');
  G.setEdge('1', '2', {dy: 1}, 'm2');

  return {G};
}
