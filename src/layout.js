/**
 * Sankey layout
 *
 * @module layout
 */

import { createGraph } from './utils';
import assignRanks from './rank-assignment';
import addDummyNodes from './add-dummy-nodes';
import ordering from './node-ordering';
import justified from './node-positioning/justified';
import orderEdges from './edge-ordering';
import flowLayout from './edge-positioning';


/**
 * Sankey layout
 * @constructor sankeyLayout
 */
export default function sankeyLayout() {

  const nodeLayout = justified(),
        edgeLayout = flowLayout();

  let nodes = [],
      links = [];

  /**
   * Layout the diagram described by the graph G.
   * @method sankeyLayout
   * @param G {Graph} - The input graph. Nodes must have `rank` attributes.
   * Edges must have `value` attributes.
   */
  function layout(flows=[], processes=[],
                  {rankSets=[], order=null, alignMaterials=false} = {}) {

    const G = createGraph(processes, flows);

    if (order == null) {
      // Assign ranks
      assignRanks(G, rankSets);
      addDummyNodes(G);

      // Assign orders within ranks
      order = ordering(G);
    } else {
      // XXX tidy this up - current this is needed for sensible titles later,
      // but source and title are set by addDummyNodes.
      G.edges().forEach(e => {
        const V = G.node(e.v), W = G.node(e.w);
        G.edge(e).source = V;
        G.edge(e).target = W;
      });
    }

    // Position and scale nodes within ranks
    nodes = nodeLayout(G, order);

    // Order incoming and outgoing edges at each node
    orderEdges(G, {alignMaterials});

    // Position edges and calculate curvatures
    links = edgeLayout(G);
  }

  /* **************************************************/
  /* nodeLayout methods *******************************/
  /* **************************************************/

  layout.nodes = function() {
    return nodes;
  };

  layout.links = function() {
    return links;
  };

  /**
   * Set size of layout.
   * @method size
   * @param size {[width, height]} - size
   * @returns {sankeyLayout|Number[]}
   */
  layout.size = function(x) {
    if (!arguments.length) return nodeLayout.size();
    nodeLayout.size(x);
    return layout;
  };

  layout.separation = function(x) {
    if (!arguments.length) return nodeLayout.separation();
    nodeLayout.separation(x);
    return layout;
  };

  layout.whitespace = function(x) {
    if (!arguments.length) return nodeLayout.whitespace();
    nodeLayout.whitespace(x);
    return layout;
  };

  layout.edgeValue = function(_x) {
    if (!arguments.length) return nodeLayout.edgeValue();
    nodeLayout.edgeValue(_x);
    return layout;
  };

  layout.scale = function(x) {
    if (!arguments.length) return nodeLayout.scale();
    nodeLayout.scale(x);
    return layout;
  };

  return layout;
}
