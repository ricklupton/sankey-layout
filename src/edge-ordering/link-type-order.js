
import sumBy from 'lodash.sumby';


export default function linkTypeOrder(G, u) {
  const incoming = G.inEdges(u),
        outgoing = G.outEdges(u);

  const edgesByType = new Map();
  [...incoming, ...outgoing].forEach(e => {
    if (!edgesByType.has(e.name)) edgesByType.set(e.name, []);
    edgesByType.get(e.name).push(e);
  });

  const dirs = new Map(Array.from(edgesByType.entries()).map(([k, v]) => {
    console.log(k, v, G.edge(v[0]));
    const total = sumBy(v, e => G.edge(e).value),
          wdirs = sumBy(v, e => G.edge(e).value * otherY(e));
    return [k, wdirs / total];
  }));

  const mo = Array.from(dirs.keys());

  // XXX This isn't right because the correct order should depend on the order
  // of neighbouring nodes...
  /* mo.sort((a, b) => dirs.get(a) - dirs.get(b)); */
  mo.sort();

  return mo;

  function otherY(e) {
    if (e.v === u) return G.node(e.w).y;
    if (e.w === u) return G.node(e.v).y;
    throw new Error();
  }
}
