/**
 * Sankey layout
 *
 * @module layout
 */

import d3 from 'd3';

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

  /**
   * Layout the diagram described by the graph G.
   * @method sankeyLayout
   * @param G {Graph} - The input graph. Nodes must have `rank` attributes.
   * Edges must have `value` attributes.
   */
  function layout(G, ranks) {
    // Assign orders within ranks
    const order = ordering(G, ranks);

    // Position and scale nodes within ranks
    nodeLayout(G, order);

    // Order incoming and outgoing edges at each node
    orderEdges(G);

    // Position edges and calculate curvatures
    edgeLayout(G);
  }

  /* **************************************************/
  /* nodeLayout methods *******************************/
  /* **************************************************/

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

  layout.scale = function(x) {
    if (!arguments.length) return nodeLayout.scale();
    nodeLayout.scale(x);
    return layout;
  };

  return layout;
}
