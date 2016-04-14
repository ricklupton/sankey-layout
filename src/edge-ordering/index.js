/** @module edge-ordering */

import materialOrder from './material-order';
import linkDirection from './link-direction';


/**
 * Order the edges in the graph G, with node positions already set.
 *
 * Assigns each node a list `incoming` and `outgoing`, containing the incoming
 * and outgoing edges in order.
 *
 * @param {Graph} G - The graph. Nodes must have `x` and `y` attributes.
 *
 */
export default function orderEdges(G, {alignMaterials = false} = {}) {
  G.nodes().forEach(u => {
    const node = G.node(u);

    node.incoming = G.inEdges(u);
    node.outgoing = G.outEdges(u);

    if (alignMaterials) {
      const mo = materialOrder(G, u);
      node.incoming.sort(compareDirectionGroupingMaterials(G, mo, false));
      node.outgoing.sort(compareDirectionGroupingMaterials(G, mo, true));
    } else {
      node.incoming.sort(compareDirection(G, false));
      node.outgoing.sort(compareDirection(G, true));
    }
  });
}


function compareDirection(G, clockwise=true) {
  return function(a, b) {
    var da = linkDirection(G, a),
        db = linkDirection(G, b),
        c = clockwise ? 1 : -1;

    // links between same node, sort on material
    if (a.v === b.v && a.w === b.w) {
      if (typeof a.name === 'number' && typeof b.name === 'number') {
        return a.name - b.name;
      } else if (typeof a.name === 'string' && typeof b.name === 'string') {
        return a.name.localeCompare(b.name);
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


function compareDirectionGroupingMaterials(G, mo, clockwise=true) {
  return function(a, b) {
    // sort first by material order
    if (a.name !== b.name) {
      return mo.indexOf(a.name) - mo.indexOf(b.name);
    }

    // Sort on direction for same material
    const da = linkDirection(G, a),
          db = linkDirection(G, b),
          c = clockwise ? 1 : -1;

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


