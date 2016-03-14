export function findFirst(flows, p) {
  let jmid = null;
  for (let j = 0; j < flows.length; ++j) {
    if (p(flows[j])) { jmid = j; break; }
  }
  return jmid;
}


/**
 * Adjust radii of curvature to avoid overlaps, as much as possible.
 * @param flows - the list of flows, ordered from outside to inside of bend
 * @param rr - "r0" or "r1", the side to work on
 */
export function sweepCurvatureInwards(flows, rr) {
  if (flows.length === 0) return;

  // sweep from inside of curvature towards outside
  let Rmin = 0;
  for (let i = flows.length - 1; i >= 0; --i) {
    h = flows[i].dy / 2;
    if (flows[i][rr] - h < Rmin) {  // inner radius
      flows[i][rr] = Math.min(flows[i].Rmax, Rmin + h);
    }
    Rmin = flows[i][rr] + h;
  }

  // sweep from outside of curvature towards centre
  let h, Rmax = flows[0].Rmax + flows[0].dy / 2;
  for (let i = 0; i < flows.length; ++i) {
    h = flows[i].dy / 2;
    if (flows[i][rr] + h > Rmax) {  // outer radius
      flows[i][rr] = Math.max(h, Rmax - h);
    }
    Rmax = flows[i][rr] - h;
  }

}
