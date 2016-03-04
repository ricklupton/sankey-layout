import { Graph } from 'graphlib';


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
    if (sources) {
      rankSets.unshift({ type: 'min', nodes: [ sources[0] ] });
    } else {
      // no sources, just use the first nodes
      rankSets.unshift({ type: 'min', nodes: [ G.nodes()[0] ] });
    }
  }

  // Construct map of node ids to the set they are in, if any
  const nodeSets = new Map();
  rankSets.forEach((set, i) => {
    const id = `__S${i}`;
    set.nodes.forEach(n => {
      nodeSets.set(n, id);
    });

    if (set.nodes.length) {
      GG.setNode(id, { set: set });
    }
  });

  // Add edges between nodes/groups
  G.edges().forEach(e => {
    const source = nodeSets.has(e.v) ? nodeSets.get(e.v) : e.v,
          target = nodeSets.has(e.w) ? nodeSets.get(e.w) : e.w;
    GG.setEdge(source, target, {});
  });

  // Add temporary edges between Smin and sources
  G.sources().forEach(u => {
    if (nodeSets.get(u) !== '__S0') {
      GG.setEdge('__S0', u, { temp: true, delta: 0 });
    }
  });

  // XXX Should also add edges from sinks to Smax

  // G.nodes().forEach(u => {
  //   if (!nodeSets.has(u)) {
  //     GG.
  //   }
  // });

  return GG;
}
