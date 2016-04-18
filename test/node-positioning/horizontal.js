import { positionHorizontally, spanMinWidths } from '../../src/node-positioning/horizontal';

import { Graph } from 'graphlib';
import test from 'prova';

import { assertAlmostEqual } from '../assert-almost-equal';


test('horizontal positioning: spanMinWidths', t => {
  function offsetLinkMinWidth(dy) {
    const G = new Graph({ directed: true });
    G.setNode('0', { y: 0 });
    G.setNode('1', { y: dy });
    G.setEdge('0', '1', { dy: 3 });
    const order = [
      [ ['0'] ], [ ['1'] ],
    ];
    const widths = spanMinWidths(G, order);
    return widths[0];
  }

  t.equal(offsetLinkMinWidth(0), 0, 'no offset has no limit');
  assertAlmostEqual(t, offsetLinkMinWidth(2), 2.83, 1e-2, 'offset of 2');
  assertAlmostEqual(t, offsetLinkMinWidth(10), 3, 1e-2, 'limit of big offset');
  t.end();
});


test('horizontal positioning', t => {
  function offsetLinkX(minWidths) {
    const width = 10;
    const G = new Graph({ directed: true });
    G.setNode('0', { y: 0 });
    G.setNode('1', { y: 0 });
    G.setNode('2', { y: 0 });
    G.setEdge('0', '1', { dy: 3 });
    G.setEdge('1', '2', { dy: 3 });
    const order = [
      [ ['0'] ], [ ['1'] ], [ ['2'] ],
    ];
    positionHorizontally(G, order, width, minWidths);
    return G.nodes().map(u => G.node(u).x);
  }

  t.deepEqual(offsetLinkX([0, 0]), [0, 5, 10], 'no offset has no limit');
  t.deepEqual(offsetLinkX([6, 0]), [0, 8, 10], 'min width moves x position');
  t.deepEqual(offsetLinkX([6, 2]), [0, 7, 10], 'min width moves x position 2');
  t.deepEqual(offsetLinkX([7, 5]), [0, 10*7/12, 10], 'width allocated fairly if insufficient');
  t.end();
});
