import sortNodes, { medianValue, neighbourPositions } from '../../src/node-ordering/weighted-median';
import { exampleTwoLevel,
         exampleTwoLevelMultigraph,
         exampleTwoLevelWithLoops } from './examples';

import { Graph } from 'graphlib';
import test from 'prova';


test('medianValue', t => {
  t.equal(medianValue([3, 4, 6]), 4,
          'picks out middle value');

  t.equal(medianValue([3, 4]), 3.5,
          'returns average of 2 values');

  t.equal(medianValue([]), -1,
          'returns -1 for empty list of positions');

  t.equal(medianValue([0, 5, 6, 7, 8, 9]), 6.75,
          'weighted median for even number of positions');

  t.end();
});


test('neighbourPositions', t => {
  let {G, order} = exampleTwoLevel();

  t.deepEqual(neighbourPositions(G, order, 0, 1, 'n2'), [0, 3, 4], 'n2');
  t.deepEqual(neighbourPositions(G, order, 0, 1, 'n0'), [0], 'n0');

  t.deepEqual(neighbourPositions(G, order, 1, 0, 's4'), [2, 5], 's4');
  t.deepEqual(neighbourPositions(G, order, 1, 0, 's0'), [0, 2, 3], 's0');

  t.end();
});


test('neighbourPositions: multigraph', t => {
  let {G, order} = exampleTwoLevelMultigraph();

  t.deepEqual(neighbourPositions(G, order, 0, 1, 'a'), [0, 2], 'a');
  t.deepEqual(neighbourPositions(G, order, 0, 1, 'b'), [1, 2], 'b');

  t.deepEqual(neighbourPositions(G, order, 1, 0, '1'), [0], '1');
  t.deepEqual(neighbourPositions(G, order, 1, 0, '3'), [0, 1], '3');

  t.end();
});

// test('neighbourPositions with loops', t => {
//   let {G, order} = exampleTwoLevelWithLoops();

//   t.deepEqual(neighbourPositions(G, order, 0, 1, 'n0'), [0, 2], 'n0');
//   t.deepEqual(neighbourPositions(G, order, 0, 1, 'n1'), [0], 'n1');
//   t.deepEqual(neighbourPositions(G, order, 0, 1, 'n2'), [0, 1], 'n2');

//   t.deepEqual(neighbourPositions(G, order, 1, 0, 's0'), [0, 1], 's0');
//   t.deepEqual(neighbourPositions(G, order, 1, 0, 's1'), [2], 's1');

//   t.end();
// });


test('sortNodes', t => {
  let {G, order} = exampleTwoLevel();

  sortNodes(G, order, +1);
  t.deepEqual(order, [
    ['n0', 'n1', 'n2', 'n3', 'n4', 'n5'],
    ['s1', 's0', 's2', 's3', 's4'],
  ], 'forward sweep');

  ({G, order} = exampleTwoLevel());
  sortNodes(G, order, -1);

  t.deepEqual(order, [
    ['n0', 'n3', 'n1', 'n2', 'n4', 'n5'],
    ['s0', 's1', 's2', 's3', 's4'],
  ], 'backward sweep');

  t.end();
});

