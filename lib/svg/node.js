import d3 from 'd3';


export default function() {
  let visibility = (d) => 'visible',
      nodeTitle = (d) => d.id;

  function sankeyNode(selection) {
    selection.each(function(d) {
      const g = d3.select(this);

      const title = g.selectAll('title').data([0]),
            text = g.selectAll('text').data([0]),
            line = g.selectAll('line').data([0]),
            clickTarget = g.selectAll('rect').data([0]);

      // Enter
      title.enter().append('title');
      text.enter().append('text');
      line.enter().append('line');
      clickTarget.enter().append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .style('fill', 'none')
        .style('visibility', 'hidden')
        .style('pointer-events', 'all');

      // Update
      const transition = g.transition().ease('linear');

      transition
        .attr('transform', nodeTransform)
        .style('visibility', function(d) {
          if (d.dy === 0 || d.dummy || visibility(d) == 'hidden') {
            return 'hidden';
          } else return null;
        });

      let {titleAbove, right} = titlePosition(d),
          dy = (d.dy === 0) ? 0 : Math.max(1, d.dy);

      let x, y;

      // if (getNodeOffstage(d)) {
      //   // horizontal line
      //   transition.select('line')
      //     .attr('x1', 0)
      //     .attr('x2', 0)  // don't show
      //     .attr('y1', 0)
      //     .attr('y2', 0);

      //   transition.select('rect')
      //     .attr('height', 10)
      //     .attr('width', dy);

      //   if (dy < 80) {
      //     transition.select('text')
      //       .attr('transform',
      //             'translate(' + (dy/2) + ',' +
      //             (d.incoming.length ? 5 : -5) + ') ' +
      //             'rotate(' + (d.incoming.length ? 90 : -90) + ')')
      //       .attr('text-anchor', 'start')
      //       .attr('dy', '.35em');
      //   } else {
      //     transition.select('text')
      //       .attr('transform', 'translate(0,10)')
      //       .attr('text-anchor', 'start')
      //       .attr('dy', '.35em');
      //   }
      // } else {

      // vertical line
      transition.select('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', titleAbove ? -5 : 0)
        .attr('y2', dy);

      transition.select('rect')
        .attr('width', 10)
        .attr('height', dy + 5);

      y = titleAbove ? -10 : d.dy / 2;
      x = (right ? 1 : -1) * (titleAbove ? 4 : -4);
      transition.select('text')
        .attr('transform', 'translate(' + x + ',' + y + ')')
        .attr('text-anchor', right ? 'end' : 'start')
        .attr('dy', '.35em');

      // }

      let t, tOpacity;
      if (false) {  // }showIds) {
        t = d => nodeTitle(d) || d.id;
        tOpacity = d => nodeTitle(d) ? null : 0.1;
      } else {
        t = nodeTitle;
        tOpacity = 1;
      }

      g.select('title')
        .text(t);

      g.select('text')
        .text(nodeTitle)
        .style('opacity', tOpacity)
        .call(wrap, 100);

      // node
      //   .attr('class', 'node')  // reset
      //   .classed(`node-type-${d.style || 'default'}`, true);
    });
  }

  sankeyNode.visibility = function(x) {
    if (!arguments.length) return visibility;
    visibility = d3.functor(x);
    return sankeyNode;
  };

  sankeyNode.nodeTitle = function(x) {
    if (!arguments.length) return nodeTitle;
    nodeTitle = d3.functor(x);
    return sankeyNode;
  };

  return sankeyNode;
}


function positionTitle(nodeSelection) {
  nodeSelection.each(function(d) {
    var node = d3.select(this),
        transition = d3.transition(node),
        titleAbove = false,
        right = false,
        dy = (d.dy === 0) ? 0 : Math.max(1, d.dy);

    // If thin, and there's enough space, put above
    if (d.spaceAbove > 20 && d.style !== 'material') {
      titleAbove = true;
    } else {
      titleAbove = false;
      if (d.outgoing.length == 1 && d.incoming.length > 1) {
        right = false;
      } else if (d.incoming.length == 1 && d.outgoing.length > 1) {
        right = true;
      }
    }

    // Stick labels outside at edges
    if (d.incoming.length === 0) {
      right = true;
      titleAbove = false;
    } else if (d.outgoing.length === 0) {
      right = false;
      titleAbove = false;
    }

    var x, y;

    if (false) {  // XXX }getNodeOffstage(d)) {
      // horizontal line
      transition.select('line')
        .attr('x1', 0)
        .attr('x2', 0)  // don't show
        .attr('y1', 0)
        .attr('y2', 0);

      transition.select('rect')
        .attr('height', 10)
        .attr('width', dy);

      if (dy < 80) {
        transition.select('text')
          .attr('transform',
                'translate(' + (dy/2) + ',' +
                (d.incoming.length ? 5 : -5) + ') ' +
                'rotate(' + (d.incoming.length ? 90 : -90) + ')')
          .attr('text-anchor', 'start')
          .attr('dy', '.35em');
      } else {
        transition.select('text')
          .attr('transform', 'translate(0,10)')
          .attr('text-anchor', 'start')
          .attr('dy', '.35em');
      }
    } else {
      // vertical line
      transition.select('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', titleAbove ? -5 : 0)
        .attr('y2', dy);

      transition.select('rect')
        .attr('width', 10)
        .attr('height', dy + 5);

      y = titleAbove ? -10 : d.dy / 2;
      x = (right ? 1 : -1) * (titleAbove ? 4 : -4);
      transition.select('text')
        .attr('transform', 'translate(' + x + ',' + y + ')')
        .attr('text-anchor', right ? 'end' : 'start')
        .attr('dy', '.35em');
    }

    let metaTitle = pprop('nodeMetadata', 'title'),
        nodeTitle,
        titleOpacity;

    if (showIds) {
      nodeTitle = d => metaTitle(d) || d.id;
      titleOpacity = d => metaTitle(d) ? null : 0.1;
    } else {
      nodeTitle = metaTitle;
      titleOpacity = 1;
    }

    node.select('title')
      .text(nodeTitle);

    node.select('text')
      .text(nodeTitle)
      .style('opacity', titleOpacity)
      .call(wrap, 100);

    node
      .attr('class', 'node')  // reset
      .classed(`node-type-${d.style || 'default'}`, true);
  });



  return node;
}

function nodeTransform(d) {
  return 'translate(' + d.x + ',' + d.y + ')';
}


function titlePosition(d) {
  let titleAbove = false,
      right = false;

  // If thin, and there's enough space, put above
  if (d.spaceAbove > 20 && d.style !== 'material') {
    titleAbove = true;
  } else {
    titleAbove = false;
    if (d.outgoing.length == 1 && d.incoming.length > 1) {
      right = false;
    } else if (d.incoming.length == 1 && d.outgoing.length > 1) {
      right = true;
    }
  }

  // Stick labels outside at edges
  if (d.incoming.length === 0) {
    right = true;
    titleAbove = false;
  } else if (d.outgoing.length === 0) {
    right = false;
    titleAbove = false;
  }

  return {titleAbove, right};
}


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        lines = text.text().split(/\n/),
        lineHeight = 1.1; // ems
    if (lines.length === 1) { return; }
    text.text(null);
    lines.forEach(function(line, i) {
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", (i === 0 ? -lines.length/2 : 1) * lineHeight + 'em')
        .text(line);
    });
  });
}
