const fs = require("fs");






function isGedcomId(value) {
  return (
    typeof value === "string" &&
    /^@[A-Z][0-9]+@$/.test(value)
  );
}

function collectItemsWithId(obj, result = []) {
  if (!obj || typeof obj !== "object") return result;

  if (isGedcomId(obj.Id)) {
    result.push(obj);
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectItemsWithId(item, result);
    }
  } else {
    for (const value of Object.values(obj)) {
      collectItemsWithId(value, result);
    }
  }

  return result;
}



function loadGedcomJson(path) {
  const raw = fs.readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

function buildNodes(rawJson) {
  const nodes = new Map();
  const items = collectItemsWithId(rawJson);

  for (const item of items) {
    if (!nodes.has(item.Id)) {
      nodes.set(item.Id, {
        id: item.Id,
        links: [],
        backLinks: [],
      });
    }
  }

  return nodes;
}


function extractRelations(item) {
  const relations = [];

  const pushRel = (from, to, type) => {
    if (from && to) {
      relations.push({ from, to, type });
    }
  };

  const id = item.Id;
  if (!id) return relations;

  // Couple
  if (item.Husband) {
    pushRel(item.Husband, id, "spouse");
    pushRel(id, item.Husband, "spouse");
  }

  if (item.Wife) {
    pushRel(item.Wife, id, "spouse");
    pushRel(id, item.Wife, "spouse");
  }

  // Enfants
  if (item.Children) {
    const children = Array.isArray(item.Children)
      ? item.Children
      : [item.Children];

    for (const child of children) {
      pushRel(id, child, "parent");
      pushRel(child, id, "child");
    }
  }

  // Relations génériques (familles, etc.)
  if (item.Relations) {
    const rels = Array.isArray(item.Relations)
      ? item.Relations
      : [item.Relations];

    for (const rel of rels) {
      pushRel(id, rel, "relation");
    }
  }

  return relations;
}

function linkNodes(nodes, relations) {
  for (const rel of relations) {
    const fromNode = nodes.get(rel.from);
    const toNode = nodes.get(rel.to);

    if (!fromNode || !toNode) continue;

    fromNode.links.push({
      type: rel.type,
      target: toNode,
    });

    toNode.backLinks.push({
      type: rel.type,
      source: fromNode,
    });
  }
}

function buildGraph(rawJson) {
  const nodes = buildNodes(rawJson);
  const allRelations = [];

  const items = collectItemsWithId(rawJson);

  for (const item of items) {
    allRelations.push(...extractRelations(item));
  }

  linkNodes(nodes, allRelations);

  return nodes;
}


function serializeGraph(nodes) {
  const result = {
    nodes: [],
    edges: [],
  };

  for (const node of nodes.values()) {
    result.nodes.push({
      id: node.id,
    });

    for (const link of node.links) {
      result.edges.push({
        from: node.id,
        to: link.target.id,
        type: link.type,
      });
    }
  }

  return result;
}

function saveGraphToFile(graph, path) {
  const json = JSON.stringify(graph, null, 2);
  fs.writeFileSync(path, json, "utf-8");
}


const raw = loadGedcomJson("./viteGedcom/LucasFamilly.json");
const graph = buildGraph(raw);

const serialized = serializeGraph(graph);
saveGraphToFile(serialized, "./LucasFamilly2.json");

console.log("Graph saved to graph.json");