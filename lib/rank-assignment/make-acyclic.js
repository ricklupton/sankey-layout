import { Graph, alg } from 'graphlib';


/**
 * Reverse edges in G to make it acyclic
 */
export default function makeAcyclic(G, v0) {

  const tree = findSpanningTree(G, v0);

  G.edges().forEach(e => {
    const rel = nodeRelationship(tree, e.v, e.w);
    if (rel < 0) {
      const label = G.edge(e) || {};
      label.reversed = true;
      G.removeEdge(e);
      G.setEdge(e.w, e.v, label);
    }
  });

  return G;
}


// find spanning tree, starting from the given node.
// return new graph where nodes have depth and thread
export function findSpanningTree(G, v0) {
  const visited = new Set();
  const tree = new Graph({directed: true});
  const thread = [];
  doDfs(G, v0, visited, tree, thread);

  thread.forEach((u, i) => {
    tree.node(u).thread = (i + 1 < thread.length) ? thread[i + 1] : thread[0];
  });

  return tree;
}


/**
 * Returns 1 if w is a descendent of v, -1 if v is a descendent of w, and 0 if
 * they are unrelated.
 */
export function nodeRelationship(tree, v, w) {
  const V = tree.node(v), W = tree.node(w);
  if (V.depth < W.depth) {
    let u = V.thread;  // next node
    while (tree.node(u).depth > V.depth) {
      if (u === w) return 1;
      u = tree.node(u).thread;
    }
  } else if (W.depth < V.depth) {
    let u = W.thread;  // next node
    while (tree.node(u).depth > W.depth) {
      if (u === v) return -1;
      u = tree.node(u).thread;
    }
  }
  return 0;
}


function doDfs(G, v, visited, tree, thread, depth=0) {
  if (!visited.has(v)) {
    visited.add(v);
    thread.push(v);
    tree.setNode(v, { depth: depth });

    const next = G.successors(v);
    next.forEach((w, i) => {
      if (!visited.has(w)) {
        tree.setEdge(v, w, { delta: 1 });
      }
      doDfs(G, w, visited, tree, thread, depth + 1);
    });
  }
}

// find spanning tree, starting from the given node.
// - follow normal edges forwards
// - follow reverse edges backwards
// return forward and reverse edges
function dfs(g, vs, order, cb) {
  if (!_.isArray(vs)) {
    vs = [vs];
  }

  var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);

  var visited = {};
  _.each(vs, function(v) {
    if (!g.hasNode(v)) {
      throw new Error("Graph does not have node: " + v);
    }

    doDfs(g, v, order === "post", visited, navigation, cb);
  });
}