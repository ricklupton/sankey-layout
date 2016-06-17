import { Graph } from 'graphlib';


export function exampleTwoLevel() {
  let G = new Graph({ directed: true });

  // Example from Barth2004
  G.setEdge('n0', 's0', {});
  G.setEdge('n1', 's1', {});
  G.setEdge('n1', 's2', {});
  G.setEdge('n2', 's0', {});
  G.setEdge('n2', 's3', {});
  G.setEdge('n2', 's4', {});
  G.setEdge('n3', 's0', {});
  G.setEdge('n3', 's2', {});
  G.setEdge('n4', 's3', {});
  G.setEdge('n5', 's2', {});
  G.setEdge('n5', 's4', {});

  let order = [
    ['n0', 'n1', 'n2', 'n3', 'n4', 'n5'],
    ['s0', 's1', 's2', 's3', 's4'],
  ];

  return {G, order};
}


export function exampleTwoLevelMultigraph() {
  let G = new Graph({ directed: true, multigraph: true });

  G.setEdge('a', '1', {}, 'm1');
  G.setEdge('a', '3', {}, 'm1');
  G.setEdge('a', '3', {}, 'm2');
  G.setEdge('b', '2', {}, 'm1');
  G.setEdge('b', '3', {}, 'm1');
  G.setNode('4', {});

  let order = [
    ['a', 'b'],
    ['1', '2', '3', '4'],
  ];

  return {G, order};
}


export function exampleTwoLevelWithLoops(type=undefined) {
  let G = new Graph({ directed: true, multigraph: type !== undefined });

  G.setEdge('n0', 's0', {}, type);
  G.setEdge('n0', 'n2', {}, type);  // loop
  G.setEdge('n1', 's0', {}, type);
  G.setEdge('n2', 's1', {}, type);

  let order = [
    ['n0', 'n1', 'n2'],
    ['s0', 's1'],
  ];

  return {G, order};
}


export function exampleBlastFurnaceWithDummy() {
  let G = new Graph({ directed: true });

  // Simplified example of links through coke oven and blast furnace
  // Padded to have dummy nodes

  let ranks = [
    ['_bf_input_5', 'input', '_oven_input_2'],
    ['_bf_input_4', 'oven', '_oven_input_1', '_input_sinter_1'],
    ['_bf_input_3', 'coke', '_input_sinter_2', '_oven_export_1'],
    ['_bf_input_2', '_coke_bf', 'sinter', '_oven_export_2'],
    ['_bf_input_1', 'bf', '_sinter_export', '_oven_export_3'],
    ['output', 'export'],
  ];

  ranks.forEach((rank, i) => {
    rank.forEach(u => {
      G.setNode(u, { rank: i });
    });
  });

  // main flow
  G.setEdge('input', 'oven', {});
  G.setEdge('oven', 'coke', {});
  G.setEdge('coke', 'sinter', {});
  G.setEdge('coke', '_coke_bf', {});
  G.setEdge('_coke_bf', 'bf', {});
  G.setEdge('sinter', 'bf', {});
  G.setEdge('bf', 'output', {});
  G.setEdge('bf', 'export', {});

  // additional export links, and input-sinter
  G.setEdge('sinter', '_sinter_export', {});
  G.setEdge('_sinter_export', 'export', {});
  G.setEdge('oven', '_oven_export_1', {});
  G.setEdge('_oven_export_1', '_oven_export_2', {});
  G.setEdge('_oven_export_2', '_oven_export_3', {});
  G.setEdge('_oven_export_3', 'export', {});
  G.setEdge('input', '_input_sinter_1', {});
  G.setEdge('_input_sinter_1', '_input_sinter_2', {});
  G.setEdge('_input_sinter_2', 'sinter', {});

  // return loops
  G.setEdge('oven', '_oven_input_1', {});
  G.setEdge('_oven_input_1', '_oven_input_2', {});
  G.setEdge('_oven_input_2', 'input', {});
  G.setEdge('bf', '_bf_input_1', {});
  G.setEdge('_bf_input_1', '_bf_input_2', {});
  G.setEdge('_bf_input_2', '_bf_input_3', {});
  G.setEdge('_bf_input_3', '_bf_input_4', {});
  G.setEdge('_bf_input_4', '_bf_input_5', {});
  G.setEdge('_bf_input_5', 'input', {});

  let initialOrder = [
    ['input', '_oven_input_2', '_bf_input_5'],
    ['_bf_input_4', '_oven_input_1', '_input_sinter_1', 'oven'],
    ['coke', '_oven_input_2', '_bf_input_3', '_oven_export_1'],
    ['_bf_input_2', '_oven_export_2', '_coke_bf', 'sinter'],
    ['_bf_input_1', 'bf', '_sinter_export', '_oven_export_3'],
    ['export', 'output'],
  ];

  return {G, ranks, initialOrder};
}


// function exampleTwoLevel() {
//   let G = new Graph({ directed: true });

//   G.setEdge('1', 'a');
//   G.setEdge('2', 'b');
//   G.setEdge('2', 'd');
//   G.setEdge('3', 'c');
//   G.setEdge('3', 'd');
//   G.setEdge('4', 'c');
//   G.setEdge('4', 'd');

//   let nodes = [
//     ['1', '2', '3', '4'],
//     ['a', 'b', 'c', 'd'],
//   ];

//   return {G, nodes};
// }
