import countCrossings, { countBetweenCrossings, countLoopCrossings } from '../../src/node-ordering/count-crossings';
import { exampleTwoLevel, exampleTwoLevelWithLoops } from './examples';

import { Graph } from 'graphlib';
import test from 'tape';


test('countBetweenCrossings', t => {
  const {G, order} = exampleTwoLevel();

  // layer 1 to layer 2
  const count = countBetweenCrossings(G, order[0], order[1]);
  t.equal(count, 12);

  // layer 2 to layer 1
  const G2 = new Graph({ directed: true });
  G.edges().forEach(({v, w}) => G2.setEdge(w, v));
  const count2 = countBetweenCrossings(G2, order[1], order[0]);
  t.equal(count2, 12);

  t.end();
});


test('countLoopCrossings', t => {
  const {G, order} = exampleTwoLevelWithLoops();

  const count = countLoopCrossings(G, order[0], order[1]);
  t.equal(count, 1);
  t.end();
});


test('countLoopCrossings: types', t => {
  const {G, order} = exampleTwoLevelWithLoops('m');

  const count = countLoopCrossings(G, order[0], order[1]);
  t.equal(count, 1);
  t.end();
});
