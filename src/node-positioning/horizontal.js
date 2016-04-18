
import sumBy from 'lodash.sumby';


export function spanMinWidths(G, order) {
  const widths = [];
  order.forEach((rank, i) => {
    if (i === order.length - 1) return;
    let minWidth = 0;
    rank.forEach(band => {
      band.forEach(v => {
        G.outEdges(v).forEach(e => {
          const w = G.edge(e).dy,
                dy = G.node(e.w).y - G.node(e.v).y,
                ay = Math.abs(dy) - w,  // final sign doesn't matter
                dx2 = w*w - ay*ay,
                dx = dx2 >= 0 ? Math.sqrt(dx2) : w;
          if (dx > minWidth) minWidth = dx;
        });
      });
    });
    widths.push(minWidth);
  });
  return widths;
}


export function positionHorizontally(G, order, width, minWidths) {
  const totalMinWidth = sumBy(minWidths);

  let dx;
  if (totalMinWidth > width) {
    // allocate fairly
    dx = minWidths.map(w => width * w / totalMinWidth);
  } else {
    const spare = width - totalMinWidth;
    dx = minWidths.map(w => w + spare / (order.length - 1));
  }

  let x = 0;
  order.forEach((rank, i) => {
    rank.forEach(band => {
      band.forEach(u => {
        const node = G.node(u);
        node.x = x;
      });
    });
    x += dx[i];
  });
}
