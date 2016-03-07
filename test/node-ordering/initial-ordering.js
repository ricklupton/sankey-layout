import initialOrdering from '../../src/node-ordering/initial-ordering';
import { exampleBlastFurnaceWithDummy } from './examples';

import { Graph } from 'graphlib';
import test from 'prova';


test('initialOrdering', t => {
  let {G} = exampleBlastFurnaceWithDummy();
  let order = initialOrdering(G);

  t.deepEqual(order, [
    [ "_bf_input_5", "input", "_oven_input_2" ],
    [ "oven", "_bf_input_4", "_oven_input_1", "_input_sinter_1" ],
    [ "coke", "_bf_input_3", "_oven_export_1", "_input_sinter_2" ],
    [ "sinter", "_bf_input_2", "_coke_bf", "_oven_export_2" ],
    [ "bf", "_bf_input_1", "_sinter_export", "_oven_export_3" ],
    [ "output", "export" ]
  ], 'order');

  t.end();
});
