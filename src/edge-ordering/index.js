/** @module edge-ordering */


/**
 * Order the edges in the graph G, with node positions already set.
 *
 * Assigns each node a list `incoming` and `outgoing`, containing the incoming
 * and outgoing edges in order.
 *
 * @param {Graph} G - The graph. Nodes must have `x` and `y` attributes.
 *
 */
export default function orderEdges(G) {
  G.nodes().forEach(u => {
    const node = G.node(u);

    node.incoming = G.inEdges(u);
    node.outgoing = G.outEdges(u);

    node.incoming.sort(compareDirection(G, false));
    node.outgoing.sort(compareDirection(G, true));
  });
}


function compareDirection(G, clockwise=true, flipMaterial=false) {
  return function(a, b) {
    var da = linkDirection(G, a),
        db = linkDirection(G, b),
        c = clockwise ? 1 : -1,
        m = flipMaterial ? -1 : 1;

    // links between same node, sort on material
    if (a.v === b.v && a.w === b.w) {
      if (typeof a.name === 'number' && typeof b.name === 'number') {
        return m * (a.name - b.name);
      } else if (typeof a.name === 'string' && typeof b.name === 'string') {
        return m * a.name.localeCompare(b.name);
      } else {
        return 0;
      }
    }

    // loops to same slice based on y-position
    if (Math.abs(da - db) < 1e-3) {
      if (a.v && a.w && b.v && b.w) {
        if (a.w === b.w) {
          return c * (da > 0 ? -1 : 1 ) * (G.node(a.v).y - G.node(b.v).y);
        } else if (a.v === b.v) {
          return c * (da > 0 ? -1 : 1 ) * (G.node(a.w).y - G.node(b.w).y);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }

    // otherwise sort by direction
    return c * (da - db);
  };
}


function linkDirection(G, link) {
  if (link.w === null) return 0;
  if (link.v === null) return 0;
  if (link.w === link.v) {
    // pretend self-links go downwards
    return Math.PI / 2;
  } else {
    const source = G.node(link.v),
          target = G.node(link.w);
    return Math.atan2(target.y - source.y,
                      target.x - source.x);
  }
}
