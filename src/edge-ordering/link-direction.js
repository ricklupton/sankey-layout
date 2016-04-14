
export default function linkDirection(G, link) {
  if (link.w === null) return 0;
  if (link.v === null) return 0;
  if (link.w === link.v) {
    // pretend self-links go downwards
    return Math.PI / 2;
  } else {
    const source = G.node(link.v),
          target = G.node(link.w);
    return Math.atan2(target.y - source.y,
                      target.x - source.x);
  }
}
