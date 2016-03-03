import d3 from 'd3';

export default function sankeyLink() {

  function radiusBounds(d) {
    var Dx = d.x1 - d.x0,
        Dy = d.y1 - d.y0,
        Rmin = d.dy / 2,
        Rmax = (Dx*Dx + Dy*Dy) / Math.abs(4*Dy);
    return [Rmin, Rmax];
  }

  function link(d) {
    var dir = (d.d0 || 'r') + (d.d1 || 'r');
    //console.log(dir, d);
    if (d.source && d.source === d.target) {
      return selfLink(d);
    }
    if (dir === 'rl') {
      return fbLink(d);
    }
    if (dir === 'rd') {
      return fdLink(d);
    }
    if (dir === 'dr') {
      return dfLink(d);
    }
    if (dir === 'lr') {
      return bfLink(d);
    }

    // Minimum thickness 2px
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        x0 = d.x0,
        x1 = d.x1,
        y0 = d.y0,
        y1 = d.y1,
        fx = dir === 'll' ? -1 : 1,
        Dx = fx * (d.x1 - d.x0),
        Dy = fx * (d.y1 - d.y0),
        Rlim = radiusBounds(d),
        defaultRadius = Math.max(Rlim[0], Math.min(Rlim[1], Dx/3)),
        r = Math.max(Rlim[0], Math.min(Rlim[1], (d.r || defaultRadius))),
        l = Math.sqrt(Math.max(0, Dx*Dx + Dy*Dy - 4 * r * Math.abs(Dy))),
        theta = 2 * Math.atan2(Dy, Dx + l),
        f = d.y1 > d.y0 ? 1 : -1,
        hs = h * Math.sin(theta),
        hc = h * Math.cos(theta),
        x2 = d.x0 + fx * r * Math.sin(Math.abs(theta)),
        x3 = d.x1 - fx * r * Math.sin(Math.abs(theta)),
        y2 = d.y0 + r * f * (1 - Math.cos(theta)),
        y3 = d.y1 - r * f * (1 - Math.cos(theta));

    if (isNaN(theta) || Math.abs(theta) < 1e-3) {
      theta = r = 0;
      x2 = d.x0;
      x3 = d.x1;
      y2 = d.y0;
      y3 = d.y1;
      hs = 0;
      hc = h;
    }

    // if (d.source.id === 'ImprovedGrass' &&
    //     d.target.id === 'Domestic bioenergy') {
    //   console.log('link', r, d.r, d.Rmax);
    // }

    function arc(dir) {
      var f = ( dir * theta > 0) ? 1 : 0,
          rr = (fx * dir * theta > 0) ? (r + h) : (r - h);
      // straight line
      if (theta === 0) { rr = r; }
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 0 " + f + " ";
    }

    var path;
    if (fx * (x2 - x3) < 0 || Math.abs(Dy) > 4*h) {
      path =  ("M"     + [x0,    y0-h ] + " " +
              arc(+1) + [x2+hs, y2-hc] + " " +
              "L"     + [x3+hs, y3-hc] + " " +
              arc(-1) + [x1,    y1-h ] + " " +
              "L"     + [x1,    y1+h ] + " " +
              arc(+1) + [x3-hs, y3+hc] + " " +
              "L"     + [x2-hs, y2+hc] + " " +
              arc(-1) + [x0,    y0+h ] + " " +
              "Z");
    } else {
      // keep same number of points
      theta = Math.abs(theta);
      path = ("M"     + [x0,    y0-h ] + " " +
              arc(+1) + [x1,    y1-h ] + " " +
              "L"     + [x1,    y1-h ] + " " +
              arc(-1) + [x1,    y1-h ] + " " +
              "L"     + [x1,    y1+h ] + " " +
              arc(+1) + [x0,    y0+h ] + " " +
              "L"     + [x0,    y0+h ] + " " +
              arc(-1) + [x0,    y0+h ] + " " +
              "Z");
    }
    if (/NaN/.test(path)) {
      console.error('path NaN', d, path);
    }
    return path;
  }

  function selfLink(d) {
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        r = h*1.5,
        theta = 2 * Math.PI,
        x0 = d.x0,
        y0 = d.y0;

    function arc(dir) {
      var f = (dir > 0) ? 1 : 0,
          rr = (dir > 0) ? (r + h) : (r - h);
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 1 " + f + " ";
    }

    return ("M"     + [x0+0.1, y0-h] + " " +
            arc(+1) + [x0-0.1, y0-h] + " " +
            "L"     + [x0-0.1, y0+h] + " " +
            arc(-1) + [x0+0.1, y0+h] + " " +
            "Z");
  }

  function fbLink(d) {
    // Minimum thickness 2px
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        x0 = d.x0,
        x1 = d.x1,
        y0 = d.y0,
        y1 = d.y1,
        Dx = d.x1 - d.x0,
        Dy = d.y1 - d.y0,
        //Rlim = radiusBounds(d),
        defaultRadius = 5 + h, //Math.max(Rlim[0], Math.min(Rlim[1], Dx/3)),
        r = Math.min(Math.abs(y1-y0)/3, defaultRadius), //2*(d.r || defaultRadius),
        theta = Math.atan2(Dy - 2*r, Dx),
        l = Math.sqrt(Math.max(0, Dx*Dx + (Dy-2*r)*(Dy-2*r))),
        f = d.y1 > d.y0 ? 1 : -1,
        hs = h * Math.sin(theta),
        hc = h * Math.cos(theta),
        x2 = d.x0 + r * Math.sin(Math.abs(theta)),
        x3 = d.x1 + r * Math.sin(Math.abs(theta)),
        y2 = d.y0 + r * f * (1 - Math.cos(theta)),
        y3 = d.y1 - r * f * (1 - Math.cos(theta));

    function arc(dir) {
      var f = (dir * theta > 0) ? 1 : 0,
          rr = (dir * theta > 0) ? (r + h) : (r - h);
      // straight line
      if (theta === 0) { rr = r; }
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 0 " + f + " ";
    }

    return ("M"     + [x0,    y0-h ] + " " +
            arc(+1) + [x2+hs, y2-hc] + " " +
            "L"     + [x3+hs, y3-hc] + " " +
            arc(+1) + [x1,    y1+h ] + " " +
            "L"     + [x1,    y1-h ] + " " +
            arc(-1) + [x3-hs, y3+hc] + " " +
            "L"     + [x2-hs, y2+hc] + " " +
            arc(-1) + [x0,    y0+h ] + " " +
            "Z");
  }

  function fdLink(d) {
    // Minimum thickness 2px
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        x0 = d.x0,
        x1 = d.x1,
        y0 = d.y0,
        y1 = d.y1,
        Dx = d.x1 - d.x0,
        Dy = d.y1 - d.y0,
        theta = Math.PI / 2,
        r = Math.max(0, x1 - x0),
        f = d.y1 > d.y0,  // = 1
        y2 = y0 + r;

    function arc(dir) {
      var f = (dir * theta > 0) ? 1 : 0,
          rr = (dir * theta > 0) ? (r + h) : (r - h);
      // straight line
      if (theta === 0) { rr = r; }
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 0 " + f + " ";
    }

    return ("M"     + [x0,    y0-h ] + " " +
            arc(+1) + [x1+h,  y2   ] + " " +
            "L"     + [x1+h,  y1   ] + " " +
            ""      + [x1-h,  y1   ] + " " +
            ""      + [x1-h,  y2   ] + " " +
            arc(-1) + [x0,    y0+h ] + " " +
            "Z");
  }

  function dfLink(d) {
    // Minimum thickness 2px
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        x0 = d.x0,
        x1 = d.x1,
        y0 = d.y0,
        y1 = d.y1,
        Dx = d.x1 - d.x0,
        Dy = d.y1 - d.y0,
        theta = Math.PI / 2,
        r = Math.max(0, x1 - x0),
        f = d.y1 > d.y0,  // = 1
        y2 = y1 - r;

    function arc(dir) {
      var f = (dir * theta > 0) ? 1 : 0,
          rr = (dir * theta > 0) ? (r + h) : (r - h);
      // straight line
      if (theta === 0) { rr = r; }
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 0 " + f + " ";
    }

    return ("M"     + [x0-h,  y0   ] + " " +
            "L"     + [x0+h,  y0   ] + " " +
            ""      + [x0+h,  y2   ] + " " +
            arc(-1) + [x1  ,  y1-h ] + " " +
            "L"     + [x1  ,  y1+h ] + " " +
            arc(+1) + [x0-h,  y2   ] + " " +
            "Z");
  }

  function bfLink(d) {
    // Minimum thickness 2px
    var h = (d.dy === 0) ? 0 : Math.max(1, d.dy / 2),
        x0 = d.x0,
        x1 = d.x1,
        y0 = d.y0,
        y1 = d.y1,
        Dx = d.x1 - d.x0,
        Dy = d.y1 - d.y0,
        //Rlim = radiusBounds(d),
        defaultRadius = 5 + h, //Math.max(Rlim[0], Math.min(Rlim[1], Dx/3)),
        r = defaultRadius, //2*(d.r || defaultRadius),
        theta = Math.atan2(Dy - 2*r, Dx),
        l = Math.sqrt(Math.max(0, Dx*Dx + (Dy-2*r)*(Dy-2*r))),
        f = d.y1 > d.y0 ? 1 : -1,
        hs = h * Math.sin(theta),
        hc = h * Math.cos(theta),
        x2 = d.x0 - r * Math.sin(Math.abs(theta)),
        x3 = d.x1 - r * Math.sin(Math.abs(theta)),
        y2 = d.y0 + r * f * (1 - Math.cos(theta)),
        y3 = d.y1 - r * f * (1 - Math.cos(theta));

    function arc(dir) {
      var f = (dir * theta > 0) ? 1 : 0,
          rr = (-dir * theta > 0) ? (r + h) : (r - h);
      // straight line
      if (theta === 0) { rr = r; }
      return "A" + rr + " " + rr + " " + Math.abs(theta) + " 0 " + f + " ";
    }

    return ("M"     + [x0,    y0-h ] + " " +
            arc(-1) + [x2-hs, y2-hc] + " " +
            "L"     + [x3-hs, y3-hc] + " " +
            arc(-1) + [x1,    y1+h ] + " " +
            "L"     + [x1,    y1-h ] + " " +
            arc(+1) + [x3+hs, y3-hc] + " " +
            "L"     + [x2+hs, y2-hc] + " " +
            arc(+1) + [x0,    y0+h ] + " " +
            "Z");
  }

  return link;
}
