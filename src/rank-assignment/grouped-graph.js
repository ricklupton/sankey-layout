import { Graph } from 'graphlib';


/**
 * Create a new graph where nodes in the same rank set are merged into one node.
 *
 * Depends on the "direction" attribute of the nodes in G, and the "delta"
 * atribute of the edges.
 *
 */
export default function groupedGraph(G, rankSets) {
  // Not multigraph because this is only used for calculating ranks
  const GG = new Graph({directed: true});

  // Make sure there is a minimum-rank set
  let Smin = false;
  for (let set of rankSets) {
    if (set.type === 'min') {
      Smin = true;
      break;
    }
  }
  if (!Smin) {
    // find the first source node
    const sources = G.sources();
    if (sources.length > 0) {
      rankSets.unshift({ type: 'min', nodes: [ sources[0] ] });
    } else {
      // no sources, just use the first nodes
      rankSets.unshift({ type: 'min', nodes: [ G.nodes()[0] ] });
    }
  }

  // Construct map of node ids to the set they are in, if any
  const nodeSets = new Map();
  let i = 0;
  rankSets.forEach(set => {
    if (!set.nodes || set.nodes.length === 0) return;
    const id = `${i++}`;
    set.nodes.forEach(n => {
      nodeSets.set(n, id);
    });
    GG.setNode(id, { type: set.type, nodes: set.nodes });
  });

  G.nodes().forEach(u => {
    if (!nodeSets.has(u)) {
      const id = `${i++}`;
      const set = { type: 'same', nodes: [u] };
      nodeSets.set(u, id);
      GG.setNode(id, set);
    }
  });

  // Add edges between nodes/groups
  G.edges().forEach(e => {
    const source = nodeSets.has(e.v) ? nodeSets.get(e.v) : e.v,
          target = nodeSets.has(e.w) ? nodeSets.get(e.w) : e.w;

    // Minimum edge length depends on direction of nodes:
    //  -> to -> : 1
    //  -> to <- : 0
    //  <- to -> : 0 (in opposite direction??)
    //  <- to <- : 1 in opposite direction
    const V = G.node(e.v) || {},
          W = G.node(e.w) || {};

    const edge = GG.edge(source, target) || { delta: 0 };
    if (V.direction === 'l') {
      edge.delta = Math.max(edge.delta, W.direction === 'l' ? 1 : 0);
      GG.setEdge(target, source, edge);
    } else {
      edge.delta = Math.max(edge.delta, W.direction === 'l' ? 0 : 1);
      GG.setEdge(source, target, edge);
    }
  });

  return GG;
}
