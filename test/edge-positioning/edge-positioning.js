import flowLayout from 'lib/edge-positioning';
// import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'prova';

import { assertAlmostEqual, assertNotAlmostEqual } from '../assert-almost-equal';

test('flowLayout: flow endpoints', t => {
  const {G} = example2to1(0);
  const layout = flowLayout();
  layout(G);

  const flows = G.edges().map(e => G.edge(e));

  // x coordinates
  t.deepEqual(flows.map(f => f.x0), [0, 0], 'f.x0');
  t.deepEqual(flows.map(f => f.x1), [3, 3], 'f.x1');

  // y coordinates
  t.deepEqual(flows.map(f => f.y0), [0.5, 3.5], 'f.y0');
  t.deepEqual(flows.map(f => f.y1), [2.5, 3.5], 'f.y1');

  // directions
  t.deepEqual(flows.map(f => f.d0), ['r', 'r'], 'f.d0');
  t.deepEqual(flows.map(f => f.d1), ['r', 'r'], 'f.d1');

  t.end();
});


test('flowLayout: loose edges', t => {
  const {G} = example2to1(0);
  const layout = flowLayout();
  layout(G);

  const flows = G.edges().map(e => G.edge(e));

  // XXX initially symmetric curvature
  assertAlmostEqual(t, flows.map(f => f.r0), flows.map(f => f.r1),
                    'radius equal at both ends');

  // should not overlap
  t.ok((flows[0].r1 + flows[0].dy/2) <= (flows[1].r1 - flows[1].dy/2),
       'flow curvature should not overlap');

  t.end();
});


test('flowLayout: tight curvature', t => {
  // setting f= 0.5 moves up the lower flow to constrain the curvature at node
  // 2.
  const {G} = example2to1(0.5);
  const layout = flowLayout();
  layout(G);

  const flows = G.edges().map(e => G.edge(e));

  // curvature should no longer be symmetric
  assertNotAlmostEqual(t, flows.map(f => f.r0), flows.map(f => f.r1), 1e-6,
                       'radius should not be equal at both ends');

  // should not overlap
  assertAlmostEqual(t, (flows[0].r1 + flows[0].dy/2), (flows[1].r1 - flows[1].dy/2), 1e-6,
       'flow curvatures should just touch');

  t.end();
});


test('flowLayout: maximum curvature limit', t => {
  // setting f=1 moves up the lower flow so far the curvature hits the limit
  // 2.
  const {G} = example2to1(1.0);
  const layout = flowLayout();
  layout(G);

  const flows = G.edges().map(e => G.edge(e));

  // curvature should no longer be symmetric
  assertNotAlmostEqual(t, flows.map(f => f.r0), flows.map(f => f.r1), 1e-6,
                       'radius should not be equal at both ends');

  // should not overlap
  assertAlmostEqual(t, (flows[0].r1 + flows[0].dy/2), (flows[1].r1 - flows[1].dy/2), 1e-6,
                    'flow curvatures should just touch');

  assertAlmostEqual(t, (flows[0].r1 - flows[0].dy/2), 0, 1e-6,
                    'inner flow curvature should be zero');

  t.end();
});


function example2to1(f) {
  let G = new Graph({ directed: true });

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

  G.setNode('0', {x: 0, y: y0, dy: 1, incoming: [], outgoing: [{v: '0', w: '2'}]});
  G.setNode('1', {x: 0, y: y1, dy: 1, incoming: [], outgoing: [{v: '1', w: '2'}]});
  G.setNode('2', {x: 3, y: y2, dy: 2, incoming: [
    {v: '0', w: '2'},
    {v: '1', w: '2'},
  ], outgoing: []});

  G.setEdge('0', '2', {dy: 1});
  G.setEdge('1', '2', {dy: 1});

  return {G};
}
