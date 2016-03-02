
import defined from 'defined';
import almostEqual from 'almost-equal';

import Test from 'tape/lib/test';


function deepAlmostEqual(a, b, tol) {
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); ++i) {
      if (!almostEqual(a[i], b[i], tol)) return false;
    }
    return true;
  } else {
    return almostEqual(a, b, tol);
  }
}


export default function assertAlmostEqual(t, a, b, tol, msg, extra) {
  t._assert(deepAlmostEqual(a, b, tol), {
    message : defined(msg, 'should be almost equal'),
    operator : 'deepAlmostEqual',
    actual : a,
    expected : b,
    extra : extra
  });
}


export function install() {
  Test.prototype.deepAlmostEqual = function (a, b, tol, msg, extra) {
    assertAlmostEqual(this, a, b, tol, msg, extra);
  };
}
