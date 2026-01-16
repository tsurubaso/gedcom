const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();


fetch("./LucasFamilly2.json")
  .then(res => res.json())
  .then(drawGraph);


  function prepareNodes(data) {
  const nodes = new Map();

  for (const n of data.nodes) {
    nodes.set(n.id, {
      id: n.id,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    });
  }

  return nodes;
}

function drawGraph(data) {
  const nodes = prepareNodes(data);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessin des liens
  ctx.strokeStyle = "#555";
  for (const edge of data.edges) {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from || !to) continue;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // Dessin des nodes
  for (const node of nodes.values()) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#4ea1ff";
    ctx.fill();
  }
}
