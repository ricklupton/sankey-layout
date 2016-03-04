import { findSpanningTree, nodeRelationship } from 'lib/rank-assignment/make-acyclic';

import { Graph, alg } from 'graphlib';
import test from 'prova';


test('rank assignment: find spanning tree', t => {
  const G = new Graph({directed: true});
  G.setEdge('a', 'b');
  G.setEdge('b', 'c');
  G.setEdge('a', 'c');
  G.setEdge('b', 'd');
  G.setEdge('d', 'a');

  t.ok(!alg.isAcyclic(G), 'not acyclic to start with');

  const tree = findSpanningTree(G, 'a');

  t.ok(alg.isAcyclic(tree), 'tree should not have cycles');
  t.deepEqual(tree.nodes(), ['a', 'b', 'c', 'd'], 'all nodes in tree');
  t.deepEqual(tree.nodes().map(u => tree.node(u)),
              [
                { depth: 0, thread: 'b' },
                { depth: 1, thread: 'c' },
                { depth: 2, thread: 'd' },
                { depth: 2, thread: 'a' },
              ],
              'depth and thread in tree');
  t.deepEqual(tree.edges(), [
    {v: 'a', w: 'b'},
    {v: 'b', w: 'c'},
    {v: 'b', w: 'd'},
  ], 'tree edges');

  // add same edges in a different order: a-c before b-c
  const G2 = new Graph({directed: true});
  G2.setEdge('a', 'c');
  G2.setEdge('a', 'b');
  G2.setEdge('b', 'c');
  G2.setEdge('b', 'd');
  G2.setEdge('d', 'a');

  const tree2 = findSpanningTree(G2, 'a');

  t.ok(alg.isAcyclic(tree2), 'tree2 should not have cycles');
  t.deepEqual(tree2.nodes(), ['a', 'c', 'b', 'd'], 'all nodes in tree2');
  t.deepEqual(tree2.edges(), [
    {v: 'a', w: 'c'},
    {v: 'a', w: 'b'},
    {v: 'b', w: 'd'},
  ], 'tree2 edges');

  t.end();
});


test('rank assignment: relationship of nodes in tree', t => {
  // Same spanning tree as before:
  //           ,- c
  //  a -- b -<
  //           `- d
  //
  const tree = new Graph({directed: true});
  tree.setNode('a', { depth: 0, thread: 'b' });
  tree.setNode('b', { depth: 1, thread: 'c' });
  tree.setNode('c', { depth: 2, thread: 'd' });
  tree.setNode('d', { depth: 2, thread: 'a' });
  tree.setEdge('a', 'b');
  tree.setEdge('b', 'c');
  tree.setEdge('b', 'd');

  t.equal(nodeRelationship(tree, 'a', 'b'), 1, 'a-b: descendent');
  t.equal(nodeRelationship(tree, 'b', 'd'), 1, 'b-d: descendent');
  t.equal(nodeRelationship(tree, 'c', 'b'), -1, 'c-b: ancestor');
  t.equal(nodeRelationship(tree, 'c', 'd'), 0, 'c-d: unrelated');

  t.end();
});
