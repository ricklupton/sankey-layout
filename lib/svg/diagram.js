// The reusable SVG component for the sliced Sankey diagram
import ordering from '../node-ordering';
import justified from '../node-positioning/justified';
import orderEdges from '../edge-ordering';
import flowLayout from '../edge-positioning';

// import sankeyNodeSliceLayout from './nodeSliceLayout';
// import sankeyLayout from './layout';

import sankeyLink from './link';
import sankeyNode from './node';

import d3 from 'd3';
import {Graph} from 'graphlib';


export default function sankeyDiagram() {

  var margin = {top: 100, right: 100, bottom: 100, left: 100},
      width = 500,
      height = 500,
      showIds = false,
      ease = 'cubic-in-out';

  var presentation = {},
      index = 0,
      scale = null;

  var selectedNode = null,
      selectedEdge = null;

  var svg;

  var nodeLayout = justified()
        .whitespace(0.5),
        // .separation(nodeSeparation),
      edgeLayout = flowLayout(),
      path = sankeyLink();

  const format = d3.format('.3s');

  var node = sankeyNode()
        .visibility(pprop('nodeStyle', 'visibility'))
        .nodeTitle(d => { console.log('nodeTitle', d); return d.id });
        // .nodeTitle(pprop('nodeMetadata', 'title'));

  /* Layout helper functions */

  // Helper function to access presentation
  function pprop(func, k) {
    if (typeof presentation[func] === 'function') {
      if (k === undefined) {
        return function(d) {
          return presentation[func](d.data);
        };
      } else {
        return function(d) {
          return presentation[func](d.data)[k];
        };
      }
    } else {
      return function() {
        return null;
      };
    }
  }

  /* Main chart */

  var dispatch = d3.dispatch('selectNode', 'selectEdge');
  function exports(_selection, relayout=true) {
    _selection.each(function(datum) {

      /* Setup SVG */
      var chartW = width - margin.left - margin.right,
          chartH = height - margin.top - margin.bottom;

      const svg = d3.select(this).selectAll('svg').data([datum]);

      // Create the skeleton, if it doesn't already exist
      const gEnter = svg.enter().append('svg')
              .append('g')
              .classed('sankey', true);
      gEnter.append('g').classed('links', true);  // Links below nodes
      gEnter.append('g').classed('nodes', true);
      gEnter.append('g').classed('slice-titles', true);  // Slice titles

      // Update dimensions
      svg.attr({width: width, height: height});

      svg.select('.sankey')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.select('.slice-titles')
        .attr('transform', 'translate(' + margin.left + ',0)');

      /* Do Sankey layout */
      if (!datum) return;

      let G;
      if (datum.graph) {
        G = datum.graph;
      } else {
        G = graphFromNodesEdges(datum.nodes || [], datum.edges || []);
      }

      // var getNodeOrder = pprop('nodeLayoutHints', 'order'),
      //     getBandOrder = pprop('bandLayoutHints', 'order'),
      //     getNodeOffstage = pprop('nodeLayoutHints', 'offstage'),
      //     getNodeReversed = pprop('nodeLayoutHints', 'reversed');

      // Calculate ranks (for now, from node attributes) and ordering within
      // ranks, if not supplied.
      let order = datum.order;
      if (!order) {
        order = calculateOrdering(datum.nodes, G);
      }

      // ...?

      // Don't worry about scale: either caller of diagram has calculated in
      // advance and already set it, or else nodeLayout will calculate it for
      // current data now.

      // Position nodes
      nodeLayout
        .size([chartW, chartH]);
      let nodes = nodeLayout(G, order);
      console.log('nodes', nodes);

      // Order and position edges
      orderEdges(G);
      let edges = edgeLayout(G);
      console.log('edges', edges);

      /* Render links */
      updateLinks(edges);
      // updateSlices(layout.slices(nodes));

      /* Update nodes */
      var nodeSel = svg.select('.nodes').selectAll('.node')
            .data(nodes, function(d) { return d.id; });

      var nodeEnter = nodeSel.enter()
            .append('g')
            .classed('node', true)
            // .classed('offstage', getNodeOffstage)
            .on('click', selectNode);

      nodeSel
        .call(node)
        .attr('class', d => `node node-type-${(d.data || {}).style || 'default'}`
              + (d.id === selectedNode ? ' selected' : ''));

      nodeSel.exit().remove();


      function updateLinks(edges) {
        var link = svg.select('.links').selectAll('.link')
              .data(edges, d => d.id);

        var linkEnter = link.enter();
        linkEnter.append('path')
          .attr('class', 'link')
          .attr('d', path)
          .style('fill', pprop('edgeStyle', 'fill'))
          .style('opacity', pprop('edgeStyle', 'opacity'))
          .style('visibility', pprop('edgeStyle', 'visibility'))
          .each(function(d) { this._current = d; }) // store initial values
          .sort(linkOrder)
          .on('click', selectEdge)
          .append('title');

        // Update
        link.transition().ease('linear')
          .style('fill', pprop('edgeStyle', 'fill'))
          .style('opacity', pprop('edgeStyle', 'opacity'))
          .style('visibility', pprop('edgeStyle', 'visibility'))
          .attrTween('d', tweenLink);

        let metaTitle = pprop('nodeMetadata', 'title');
            // edgeValue = layout.edgeValue();
        link.select('title')
          .text(function(d) {
            const parts = [];
            // if (d.title) parts.push(d.title);
            const sourceTitle = d.source ? metaTitle(d.source) : 'elsewhere',
                  targetTitle = d.target ? metaTitle(d.target) : 'elsewhere';
            parts.push(`${sourceTitle} → ${targetTitle}`);
            if (d.title) parts.push(d.title);
            else if (d.material) parts.push(d.material);
            // parts.push(format(d._value !== undefined ? d._value : edgeValue(d)));
            return parts.join('\n');
          });

        link.classed('selected', (d) => d.id === selectedEdge);

        link.sort(linkOrder);

        link.exit()
          .remove();
      }

      // Store the displayed state in _current.
      // Then, interpolate from _current to the new state.
      // During the transition, _current is updated in-place by d3.interpolate.
      function tweenLink(b) {
        var i = d3.interpolate(this._current, {
          x0: b.x0,
          y0: b.y0,
          x1: b.x1,
          y1: b.y1,
          dy: b.dy,
          r0: b.r0,
          r1: b.r1,
        });
        this._current = i(0);
        return function(t) {
          var link = i(t);
          //link.source = {direction: b.source ? b.source.direction : 'r' };
          //link.target = {direction: b.target ? b.target.direction : 'r' };
          return path(i(t));
        };
      }

      function updateSlices(slices) {
        var slice = svg.select('.slice-titles').selectAll('.slice')
            .data(slices, function(d) { return d.id; });

        var textWidth = (slices.length > 1 ?
                         0.9 * (slices[1].x - slices[0].x) :
                         null);

        slice.enter().append('g')
          .attr('class', 'slice')
          .append('foreignObject')
          .attr('requiredFeatures',
                'http://www.w3.org/TR/SVG11/feature#Extensibility')
          .attr('height', margin.top)
          .attr('class', 'title')
          .append('xhtml:div')
          .style('text-align', 'center')
          .style('word-wrap', 'break-word')
          .text(pprop('sliceMetadata', 'title'));

        slice
          .attr('transform', function(d) {
            return 'translate(' + (d.x - textWidth / 2) + ',0)'; })
          .select('foreignObject')
          .attr('width', textWidth)
          .select('div')
          .text(pprop('sliceMetadata', 'title'));

        slice.exit().remove();
      }

      function linkOrder(a, b) {
        // var f = style('edges', 'zIndex');
        // return (f(a) || 0) - (f(b) || 0);
        if (a.id === selectedEdge) return +1;
        if (b.id === selectedEdge) return -1;
        if (!a.source || a.target && a.target.direction === 'd') return -1;
        if (!b.source || b.target && b.target.direction === 'd') return +1;
        if (!a.target || a.source && a.source.direction === 'd') return -1;
        if (!b.target || b.source && b.source.direction === 'd') return +1;
        return a.dy - b.dy;
      }

      /* Events */
      svg.on('click', function() {
        dispatch.selectNode.call(this, null);
        dispatch.selectEdge.call(this, null);
      });

      function selectEdge(d) {
        d3.event.stopPropagation();
        var el = d3.select(this)[0][0];
        dispatch.selectEdge.call(el, d);
      }

      function selectNode(d) {
        d3.event.stopPropagation();
        var el = d3.select(this)[0][0];
        dispatch.selectNode.call(el, d);
      }

    });
  }

  /* Public API */
  exports.width = function(_x) {
    if (!arguments.length) return width;
    width = parseInt(_x);
    return this;
  };

  exports.height = function(_x) {
    if (!arguments.length) return height;
    height = parseInt(_x);
    return this;
  };

  exports.ease = function(_x) {
    if (!arguments.length) return ease;
    ease = _x;
    return this;
  };

  exports.showIds = function(_x) {
    if (!arguments.length) return showIds;
    showIds = _x;
    return this;
  };

  exports.presentation = function(_x) {
    if (!arguments.length) return presentation;
    presentation = _x;
    return this;
  };

  exports.edgeValue = function(_x) {
    if (!arguments.length) return nodeLayout.edgeValue();
    nodeLayout.edgeValue(_x);
    return this;
  };

  exports.index = function(_x) {
    if (!arguments.length) return index;
    index = _x;
    return this;
  };

  exports.margins = function(_x) {
    if (!arguments.length) return margin;
    margin = {
      top: _x.top === undefined ? margin.top : _x.top,
      left: _x.left === undefined ? margin.left : _x.left,
      bottom: _x.bottom === undefined ? margin.bottom : _x.bottom,
      right: _x.right === undefined ? margin.right : _x.right,
    };
    return this;
  };

  exports.scale = function(_x) {
    if (!arguments.length) return scale;
    scale = _x;
    return this;
  };

  exports.selectNode = function(_x) {
    selectedNode = _x;
    return this;
  };

  exports.selectEdge = function(_x) {
    selectedEdge = _x;
    return this;
  };

  d3.rebind(exports, dispatch, 'on');
  return exports;
}

function nodeSeparation(a, b) {
  var a0 = a.incoming.map(function(link) { return link.source ? link.source.id : null; }),
      b0 = b.incoming.map(function(link) { return link.source ? link.source.id : null; }),
      a1 = a.outgoing.map(function(link) { return link.target ? link.target.id : null; }),
      b1 = b.outgoing.map(function(link) { return link.target ? link.target.id : null; }),
      k = 0, n = 0, i;
  for (i = 0; i < b0.length; ++i) {
    ++n;
    if (a0.indexOf(b0[i]) !== -1) ++k;
  }
  for (i = 0; i < a0.length; ++i) {
    ++n;
    if (b0.indexOf(a0[i]) !== -1) ++k;
  }
  for (i = 0; i < b1.length; ++i) {
    ++n;
    if (a1.indexOf(b1[i]) !== -1) ++k;
  }
  for (i = 0; i < a1.length; ++i) {
    ++n;
    if (b1.indexOf(a1[i]) !== -1) ++k;
  }
  if (n === 0) { return 1; }
  return 1 - 0.6 * k / n;
}


function calculateOrdering(nodes, G) {
  for (let n of nodes) {
    if (!G.node(n)) G.setNode(n, {});
    G.node(n).rank = n.rank;
  }
  let order = ordering(G);
  return order;
}
