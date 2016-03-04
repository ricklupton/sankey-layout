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
  const ranks = [];
  GG.nodes().forEach(u => {
    const node = GG.node(u);
    while (node.rank >= ranks.length) ranks.push([]);
    if (node.set) {
      node.set.nodes.forEach(v => ranks[node.rank].push(v));
    } else {
      ranks[node.rank].push(u);
    }
  });

  return ranks;
}
