/**
 * Edge positioning.
 *
 * @module edge-positioning
 */


export default function flowLayout() {

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

    setEdgeEndCurvatures(outgoing, 'r0');
    setEdgeEndCurvatures(incoming, 'r1');
  });
}


function maximumRadiusOfCurvature(link) {
  var Dx = link.x1 - link.x0,
      Dy = link.y1 - link.y0;
  return (Dy !== 0) ? (Dx*Dx + Dy*Dy) / Math.abs(4*Dy) : Infinity;
}


function setEdgeEndCurvatures(edges, rr) {
  let jmid = null;

  // initialise edges, find reversal of curvature
  edges.forEach((edge, j) => {
    edge.Rmax = maximumRadiusOfCurvature(edge);
    edge[rr] = Math.max(edge.dy / 2, edge.Rmax * 0.6);
    if (edge.y0 < edge.y1) { jmid = j; }
  });

  if (jmid !== null) {
    // Set maximum radius down from middle
    sweepEdgeCurvature(edges, rr, jmid, -1);

    // Set maximum radius up from middle
    sweepEdgeCurvature(edges, rr, jmid + 1, +1);
  }
}


function sweepEdgeCurvature(allEdges, rr, j0, direction) {
  let edges = [];
  if (direction > 0) {
    let j = j0;
    while (j < allEdges.length) edges.push(allEdges[j++]);
  } else {
    let j = j0;
    while (j >= 0) edges.push(allEdges[j--]);
  }

  if (edges.length === 0) return;

  // sweep from middle out
  let Rmax = edges[0].Rmax + edges[0].dy / 2;
  edges.forEach(edge => {
    if (edge[rr] > Rmax - edge.dy/2) {
      edge[rr] = Math.max(edge.dy / 2, Rmax - edge.dy/2);
    }
    Rmax = edge[rr] - edge.dy/2;
  });

  let Rmin = 0;
  edges.reverse();
  edges.forEach(edge => {
    if (edge[rr] < Rmin + edge.dy/2) {
      edge[rr] = Math.min(edge.Rmax, Rmin + edge.dy/2);
    }
    Rmin = edge[rr] + edge.dy/2;
  });
}
