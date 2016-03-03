import initialOrdering from 'lib/node-ordering/initial-ordering';
import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'tape';


test('initialOrdering', t => {
  let {G, ranks} = exampleBlastFurnaceWithDummy();
  let order = initialOrdering(G, ranks);

  t.deepEqual(ranks.map(d => d.length),
              order.map(d => d.length),
              'order is same length as original list of ranks');

  t.end();
});
