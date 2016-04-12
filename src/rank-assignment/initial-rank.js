import defined from 'defined';


/**
 * Take an acyclic graph and assign initial ranks to the nodes
 */
export default function assignInitialRanks(G) {
  // Place nodes on queue when they have no unmarked in-edges. Initially, this
  // means sources.
  const queue = G.sources(),
        seen = new Set(),
        marked = new Set();

  // Mark any loops, since they don't affect rank assignment
  G.edges().forEach(e => {
    if (e.v === e.w) marked.add(e);
  });

  while (queue.length > 0) {
    const v = queue.shift();
    seen.add(v);

    let V = G.node(v);
    if (!V) G.setNode(v, (V = {}));

    // Set rank to minimum of incoming edges
    V.rank = 0;
    for (let e of G.inEdges(v)) {
      const delta = defined((G.edge(e) || {}).delta, 1);
      V.rank = Math.max(V.rank, G.node(e.v).rank + delta);
    }

    // Mark outgoing edges
    for (let e of G.outEdges(v)) {
      marked.add(e);
    }

    // Add nodes to queue when they have no unmarked in-edges.
    for (let n of G.nodes()) {
      if (queue.indexOf(n) < 0 && !seen.has(n) &&
          !G.inEdges(n).some(e => !marked.has(e))) {
        queue.push(n);
      }
    }
  }
}
