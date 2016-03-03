/**
 * Original, full-width node positioning.
 *
 * Uses spacing and whitespace fraction to position nodes within layers.
 *
 * @module node-positioning/justified
 */

import d3 from 'd3';


export default function justifiedPositioning() {
  // XXX what about bands?

  let size = [1, 1],
      scale = null,
      separation = function(a, b) { return 1; },
      whitespace = 0.5;

  function position(G, order) {
    if (scale === null) position.scaleToFit(G, order);

    // set node and edge sizes
    setNodeEdgeHeights(G, scale);

    // position nodes in each layer
    // XXX bands
    const margin = whitespace * size[1] / 5;
    const dx = size[0] / (order.length - 1);
    let x = 0;
    order.forEach(rank => {
      const height = size[1] - 2*margin;
      const total = d3.sum(rank, u => G.node(u).dy);
      const gaps = rank.map((u, i) => {
        const node = G.node(u);
        if (!node.value) return 0;
        return rank[i+1] ? separation(rank[i], rank[i+1]) : 0;
      });
      const space = Math.max(0, height - total);
      const kg = d3.sum(gaps) ? space / d3.sum(gaps) : 0;

      // if (rank.length === 1) {
      //   y += space / 2;
      // }

      const isFirst = true,
            isLast = true;  // XXX bands

      let y = margin;

      let prevGap = isFirst ? Number.MAX_VALUE : 0;  // edge of graph
      rank.forEach((u, i) => {
        const node = G.node(u);
        node.x = x;
        node.y = y;
        node.spaceAbove = prevGap;
        node.spaceBelow = gaps[i] * kg;
        y += node.dy + node.spaceBelow;
        prevGap = node.spaceBelow;
      });
      G.node(rank[rank.length - 1]).spaceBelow =
        isLast ? Number.MAX_VALUE : 0;  // edge of graph

      x += dx;
    });

    const nodes = [];
    G.nodes().forEach(u => {
      const node = G.node(u);
      node.id = u;
      nodes.push(node);
    });

    return nodes;
  }

  position.scaleToFit = function(G, order) {
    setNodeValues(G);

    const maxValue = d3.max(order, rank => d3.sum(rank, u => G.node(u).value));
    if (maxValue <= 0) throw Error('no value');

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
    separation = d3.functor(x);
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


function setNodeValues(G) {
  G.nodes().forEach(n => {
    const incoming = d3.sum(G.inEdges(n), e => G.edge(e).value),
          outgoing = d3.sum(G.outEdges(n), e => G.edge(e).value);
    if (G.node(n) === undefined) G.setNode(n, {});
    G.node(n).value = Math.max(incoming, outgoing);
  });
}


function setNodeEdgeHeights(G, scale) {
  G.nodes().forEach(n => {
    const node = G.node(n);
    node.dy = node.value * scale;
  });

  G.edges().forEach(e => {
    const edge = G.edge(e);
    edge.dy = edge.value * scale;
  });
}
