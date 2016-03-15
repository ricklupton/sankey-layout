import min from 'lodash.min';

import groupedGraph from './grouped-graph';
import makeAcyclic from './make-acyclic';
import assignInitialRanks from './initial-rank';


/**
 * Assign ranks to the nodes in G, according to rankSets.
 */
export default function assignRanks(G, rankSets) {
  if (G.nodes().length === 0) return;

  // Group nodes together, and add additional edges from Smin to sources
  const GG = groupedGraph(G, rankSets);

  // Add additional edges from Smin to sources
  addTemporaryEdges(GG);

  // Make the graph acyclic
  makeAcyclic(GG, '0');

  // Assign the initial ranks
  assignInitialRanks(GG);

  // XXX improve initial ranking...
  moveSourcesRight(GG);

  // Apply calculated ranks to original graph
  G.nodes().forEach(u => {
    if (!G.node(u)) G.setNode(u, {});
  });

  GG.nodes().forEach(u => {
    const node = GG.node(u);
    node.nodes.forEach(v => {
      G.node(v).rank = node.rank;
    });
  });
}


function addTemporaryEdges(GG) {
  // Add temporary edges between Smin and sources
  GG.sources().forEach(u => {
    if (u !== '0') {
      GG.setEdge('0', u, { temp: true, delta: 0 });
    }
  });

  // XXX Should also add edges from sinks to Smax

  // G.nodes().forEach(u => {
  //   if (!nodeSets.has(u)) {
  //     GG.
  //   }
  // });
}


function moveSourcesRight(GG) {
  GG.edges().forEach(e => {
    const edge = GG.edge(e);
    if (edge.temp) moveRight(e.w);
  });

  function moveRight(v) {
    const V = GG.node(v);
    const rank = min(GG.outEdges(v).map(e => GG.node(e.w).rank - GG.edge(e).delta));
    if (rank !== undefined) V.rank = rank;
  }
}
