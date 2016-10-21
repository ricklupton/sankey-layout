/**
 * Original, full-width node positioning.
 *
 * Uses spacing and whitespace fraction to position nodes within layers.
 *
 * @module node-positioning/justified
 */

import max from 'lodash.max';
import sumBy from 'lodash.sumby';
import isFunction from 'lodash.isfunction';
import isArray from 'lodash.isarray';
import { positionHorizontally, spanMinWidths } from './horizontal';


export default function justifiedPositioning() {
  let size = [1, 1],
      scale = null,
      separation = function(a, b) { return 1; },
      edgeValue = function(e) { return e.data.value; },
      nodeDirection = function(n) { return n.data ? n.data.direction : 'r'; },
      whitespace = 0.5;

  function position(G, order) {
    if (scale === null) position.scaleToFit(G, order);

    // set node and edge sizes
    setNodeValues(G, edgeValue, nodeDirection);
    setNodeEdgeHeights(G, edgeValue, scale);

    const bandVals = bandValues(G, order);

    // input types:
    // [ [r1b1n1, r1b1n2], [r2b1n1] ]
    // [ [ [r1b1n1], [r1b2n1] ], ...
    if (order.length > 0 && order[0].length > 0 && !isArray(order[0][0])) {
      order = order.map(rank => [rank]);
    }

    order.forEach(rank => {

      let y = 0;
      rank.forEach((band, j) => {
        // Height of this band, based on fraction of value
        const bandHeight = bandVals[j] / sumBy(bandVals) * size[1];

        const margin = whitespace * bandHeight / 5;
        const height = bandHeight - 2*margin;
        const total = sumBy(band, u => G.node(u).dy);
        const gaps = band.map((u, i) => {
          const node = G.node(u);
          if (!node.value) return 0;
          return band[i+1] ? separation(band[i], band[i+1], G) : 0;
        });
        const space = Math.max(0, height - total);
        const kg = sumBy(gaps) ? space / sumBy(gaps) : 0;

        const isFirst = true,
              isLast = true;  // XXX bands

        let yy = y + margin;
        if (band.length === 1) {
          // centre vertically
          yy += (height - G.node(band[0]).dy) / 2;
        }

        let prevGap = isFirst ? Number.MAX_VALUE : 0;  // edge of graph
        band.forEach((u, i) => {
          const node = G.node(u);
          node.y = yy;
          node.spaceAbove = prevGap;
          node.spaceBelow = gaps[i] * kg;
          yy += node.dy + node.spaceBelow;
          prevGap = node.spaceBelow;

          // XXX is this a good idea?
          if (node.data && node.data.forceY !== undefined) {
            node.y = margin + node.data.forceY * (height - node.dy);
          }
        });
        if (band.length > 0) {
          G.node(band[band.length - 1]).spaceBelow =
            isLast ? Number.MAX_VALUE : 0;  // edge of graph
        }

        y += bandHeight;
      });
    });

    // position nodes horizontally
    const minWidths = spanMinWidths(G, order);
    positionHorizontally(G, order, size[0], minWidths);

    const nodes = [];
    G.nodes().forEach(u => {
      const node = G.node(u);
      node.id = u;
      nodes.push(node);
    });

    return nodes;
  }

  position.scaleToFit = function(G, order) {
    setNodeValues(G, edgeValue, nodeDirection);

    const maxValue = sumBy(bandValues(G, order));
    if (maxValue <= 0) {
      scale = 1;
      return;
    }

    scale = size[1] / maxValue;
    if (whitespace != 1) scale *= (1 - whitespace);
  };

  position.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return position;
  };

  position.separation = function(x) {
    if (!arguments.length) return separation;
    separation = isFunction(x) ? x : (() => x);
    return position;
  };

  position.whitespace = function(x) {
    if (!arguments.length) return whitespace;
    whitespace = x;
    return position;
  };

  position.scale = function(x) {
    if (!arguments.length) return scale;
    scale = x;
    return position;
  };

  return position;
}


function setNodeValues(G, edgeValue, nodeDirection) {
  G.nodes().forEach(n => {
    const incoming = sumBy(G.inEdges(n), e => edgeValue(G.edge(e))),
          outgoing = sumBy(G.outEdges(n), e => edgeValue(G.edge(e)));
    let node = G.node(n);
    if (!node) G.setNode(n, node = {});
    node.value = Math.max(incoming, outgoing);

    // also set direction
    // if (node.direction === undefined) node.direction = nodeDirection(node) || 'r';
    // XXX this is done when creating graph in the first place?
  });
}


function setNodeEdgeHeights(G, edgeValue, scale) {
  G.nodes().forEach(n => {
    const node = G.node(n);
    node.dy = node.value * scale;
  });

  G.edges().forEach(e => {
    const edge = G.edge(e);
    edge.value = edgeValue(edge);
    edge.dy = edge.value * scale;
  });
}


function bandValues(G, order) {
  if (order.length === 0 || order[0].length === 0) return [];
  if (!isArray(order[0][0])) {
    order = order.map(rank => [rank]);
  }

  const Nr = order.length,
        Nb = order[0].length;

  const values = new Array(Nb);
  for (let i = 0; i < Nb; i++) values[i] = 0;

  order.forEach(rank => {
    rank.forEach((band, j) => {
      const total = sumBy(band, u => G.node(u).value);
      values[j] = Math.max(values[j], total);
    });
  });

  return values;
}
