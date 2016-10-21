/**
 * Edge positioning.
 *
 * @module edge-positioning
 */

import { findFirst, sweepCurvatureInwards } from './utils';


export default function linkLayout() {

  function layout(G) {
    setEdgeEndpoints(G);
    setEdgeCurvatures(G);

    const edges = [];
    G.edges().forEach(e => {
      const edge = G.edge(e);
      edge.id = `${e.v}-${e.w}-${e.name}`;
      edges.push(edge);
    });

    return edges;
  }

  return layout;
}


function setEdgeEndpoints(G) {
  G.nodes().forEach(u => {
    const node = G.node(u);
    let sy = 0, ty = 0;

    node.outgoing.forEach(e => {
      const edge = G.edge(e);
      edge.x0 = node.x;
      edge.y0 = node.y + sy + edge.dy / 2;
      edge.d0 = node.direction || 'r';
      sy += edge.dy;
    });

    node.incoming.forEach(e => {
      const edge = G.edge(e);
      edge.x1 = node.x;
      edge.y1 = node.y + ty + edge.dy / 2;
      edge.d1 = node.direction || 'r';
      ty += edge.dy;
    });
  });
}


function setEdgeCurvatures(G) {
  G.nodes().forEach(u => {
    const node = G.node(u);

    const outgoing = node.outgoing.map(e => G.edge(e)),
          incoming = node.incoming.map(e => G.edge(e));

    outgoing.sort((a, b) => a.y0 - b.y0);
    incoming.sort((a, b) => a.y1 - b.y1);

    setEdgeEndCurvatures(outgoing, 'r0');
    setEdgeEndCurvatures(incoming, 'r1');
  });
}


function maximumRadiusOfCurvature(link) {
  var Dx = link.x1 - link.x0,
      Dy = link.y1 - link.y0;
  if (link.d0 !== link.d1) {
    return Math.abs(Dy) / 2.1;
  } else {
    return (Dy !== 0) ? (Dx*Dx + Dy*Dy) / Math.abs(4*Dy) : Infinity;
  }
}


function setEdgeEndCurvatures(edges, rr) {
  // initialise edges, find reversal of curvature
  edges.forEach((edge, j) => {
    edge.Rmax = maximumRadiusOfCurvature(edge);
    edge[rr] = Math.max(edge.dy / 2, (edge.d0 === edge.d1 ? edge.Rmax * 0.6 : (5 + edge.dy / 2)));
  });

  let jmid = (rr === 'r0'
              ? findFirst(edges, (f => f.y1 > f.y0))
              : findFirst(edges, (f => f.y0 > f.y1)));
  if (jmid === null) jmid = edges.length;

  // Set maximum radius down from middle
  sweepCurvatureInwards(edges.slice(jmid), rr);

  // Set maximum radius up from middle
  if (jmid > 0) {
    let edges2 = [];
    for (let j = jmid - 1; j >= 0; j--) edges2.push(edges[j]);
    sweepCurvatureInwards(edges2, rr);
  }
}
