
export function assertSetEqual(t, a, b, msg) {
  const x = Array.from(a),
        y = Array.from(b);
  x.sort();
  y.sort();
  t.deepEqual(x, y, msg);
}
