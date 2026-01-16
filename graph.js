const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

/* =======================
   CANVAS
======================= */

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =======================
   LOAD GRAPH
======================= */

fetch("./graph.json")
  .then(res => res.json())
  .then(init);

/* =======================
   GRAPH HELPERS
======================= */

function buildGraph(data) {
  const nodes = new Map();

  // create nodes
  for (const n of data.nodes) {
    nodes.set(n.id, {
      id: n.id,
      links: []
    });
  }

  // create links
  for (const e of data.edges) {
    const from = nodes.get(e.from);
    const to = nodes.get(e.to);
    if (!from || !to) continue;

    from.links.push({
      type: e.type,
      target: to
    });
  }

  return nodes;
}

function getSpouses(node) {
  return node.links
    .filter(l => l.type === "spouse")
    .map(l => l.target);
}

function getChildren(node) {
  return node.links
    .filter(l => l.type === "parent")
    .map(l => l.target);
}

/* =======================
   TREE LAYOUT
======================= */

function layoutTree(node, depth, state) {
  if (state.placed.has(node.id)) {
    return state.positions.get(node.id).x;
  }

  const spouses = getSpouses(node);
  const children = getChildren(node);

  const startX = state.currentX;

  // place main person
  state.positions.set(node.id, { x: startX, y: depth });
  state.placed.add(node.id);

  // place spouses on same line
  spouses.forEach((s, i) => {
    state.positions.set(s.id, {
      x: startX + i + 1,
      y: depth
    });
    state.placed.add(s.id);
  });

  state.currentX += 1 + spouses.length;

  // recurse on children
  const childXs = [];
  for (const child of children) {
    const cx = layoutTree(child, depth + 1, state);
    childXs.push(cx);
  }

  // center parents over children
  if (childXs.length > 0) {
    const min = Math.min(...childXs);
    const max = Math.max(...childXs);
    const center = (min + max) / 2;

    state.positions.get(node.id).x = center;
    spouses.forEach((s, i) => {
      state.positions.get(s.id).x = center + i + 1;
    });

    return center;
  }

  return startX;
}

function buildTreeLayout(root) {
  const state = {
    currentX: 0,
    positions: new Map(),
    placed: new Set()
  };

  layoutTree(root, 0, state);
  return state.positions;
}

/* =======================
   DRAW
======================= */

function draw(graph, positions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const SCALE_X = 140;
  const SCALE_Y = 120;
  const OFFSET_X = 50;
  const OFFSET_Y = 50;

function pos(node) {
  const p = positions.get(node.id);
  if (!p) return null;

  return {
    x: OFFSET_X + p.x * SCALE_X,
    y: OFFSET_Y + p.y * SCALE_Y
  };
}


  // edges
  ctx.strokeStyle = "#666";
for (const node of graph.values()) {
  const a = pos(node);
  if (!a) continue;

  for (const link of node.links) {
    if (link.type !== "parent") continue;

    const b = pos(link.target);
    if (!b) continue;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}


  // nodes
for (const node of graph.values()) {
  const p = pos(node);
  if (!p) continue;

  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#4ea1ff";
  ctx.fill();
}

}


function findRoots(graph) {
  const hasParent = new Set();

  for (const node of graph.values()) {
    for (const link of node.links) {
      if (link.type === "parent") {
        hasParent.add(link.target.id);
      }
    }
  }

  const roots = [];
  for (const node of graph.values()) {
    if (!hasParent.has(node.id)) {
      roots.push(node);
    }
  }

  return roots;
}

function getTreeWidth(treePositions) {
  let maxX = 0;
  for (const p of treePositions.values()) {
    if (p.x > maxX) maxX = p.x;
  }
  return maxX + 1;
}

function buildForestLayout(roots) {
  const state = {
    currentX: 0,
    positions: new Map(),
    placed: new Set()
  };

  for (const root of roots) {
    if (state.placed.has(root.id)) continue;

    layoutTree(root, 0, state);

    // espace entre arbres
    state.currentX += 2;
  }

  return state.positions;
}


/* =======================
   INIT
======================= */

function init(data) {
  const graph = buildGraph(data);
  const roots = findRoots(graph);

  const positions = buildForestLayout(roots);
  draw(graph, positions);
}



