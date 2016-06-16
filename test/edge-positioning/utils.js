import { findFirst, sweepCurvatureInwards } from '../../src/edge-positioning/utils';

import { Graph } from 'graphlib';
import test from 'tape';

import { assertAlmostEqual, assertNotAlmostEqual } from '../assert-almost-equal';


test('linkLayout: findMiddle', t => {
  const jmid = findFirst([
    {y0: 0, y1: -10},
    {y0: 1, y1: 0},
    {y0: 2, y1: 10},
  ], f => f.y1 > f.y0);
  t.equal(jmid, 2, 'returns first link for which y1 > y0');
  t.end();
});


test('linkLayout: sweepCurvatureInwards', t => {
  const links1 = [
    { Rmax: 100, dy: 6, r0: 42 },
    { Rmax: 100, dy: 6, r0: 40 },
  ];
  sweepCurvatureInwards(links1, 'r0');
  t.deepEqual(links1.map(f => f.r0), [46, 40],
              'radius increased on outwide to avoid overlap, if possible');

  const links2 = [
    { Rmax: 42, dy: 6, r0: 42 },
    { Rmax: 100, dy: 6, r0: 40 },
  ];
  sweepCurvatureInwards(links2, 'r0');
  t.deepEqual(links2.map(f => f.r0), [42, 36],
              'radius reduced on inside if needed by Rmax');

  const links3 = [
    { Rmax: 8,   dy: 6, r0: 4 },
    { Rmax: 100, dy: 6, r0: 3 },
  ];
  sweepCurvatureInwards(links3, 'r0');
  t.deepEqual(links3.map(f => f.r0), [8, 3],
              'minimum radius is limited by inside of bend, even with Rmax');

  t.end();
});
