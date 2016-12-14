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
import linkLayout from './edge-positioning';

import isArray from 'lodash.isarray';

/**
 * Sankey layout
 * @constructor sankeyLayout
 */
export default function sankeyLayout() {

  const nodeLayout = justified(),
        edgeLayout = linkLayout();

  let nodes = [],
      links = [],
      order = null;

  /**
   * Layout the diagram described by the graph G.
   * @method sankeyLayout
   * @param G {Graph} - The input graph. Nodes must have `rank` attributes.
   * Edges must have `value` attributes.
   */
  function layout(linksIn=[], nodesIn=[], data={}) {

    const G = createGraph(nodesIn, linksIn);

    if (!data.order) {
      // Assign ranks
      assignRanks(G, data.rankSets || []);
      addDummyNodes(G);

      // Assign orders within ranks
      order = ordering(G);
    } else {
      order = data.order;

      // Add a single band, if there are none specified
      console.log('order', order, data.order);
      if (order.length > 0 && order[0].length > 0 && !isArray(order[0][0])) {
        order = order.map(rank => [rank]);
      }

      // filter order to only include known nodes
      order = order.map(
        bands => bands.map(
          nodes => nodes.filter(
            n => G.node(n) !== undefined)));
    }

    // Position and scale nodes within ranks
    nodes = nodeLayout(G, order);

    // Order incoming and outgoing edges at each node
    orderEdges(G, {alignLinkTypes: data.alignLinkTypes || false});

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

  layout.order = function() {
    return order;
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
