import groupedGraph from './grouped-graph';
import makeAcyclic from './make-acyclic';
import assignInitialRanks from './initial-rank';


/**
 * Assign ranks to the nodes in G, according to rankSets.
 */
export default function assignRanks(G, rankSets) {
  // Group nodes together, and add additional edges from Smin to sources
  const GG = groupedGraph(G, rankSets);

  // Make the graph acyclic
  makeAcyclic(GG, '__S0');

  // Assign the initial ranks
  assignInitialRanks(GG);

  // XXX improve initial ranking...

  // Apply calculated ranks to original graph
  G.nodes().forEach(u => {
    if (!G.node(u)) G.setNode(u, {});
  });

  GG.nodes().forEach(u => {
    const node = GG.node(u);
    if (node.set) {
      node.set.nodes.forEach(v => {
        G.node(v).rank = node.rank;
      });
    } else {
      G.node(u).rank = node.rank;
    }
  });
}
