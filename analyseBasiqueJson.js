const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./LucasFamilly.json"));

const allKeys = new Set();

const typeMap = {};

function analyze(obj) {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      allKeys.add(key);
      const type = Array.isArray(obj[key]) ? "array" : typeof obj[key];
      typeMap[key] = typeMap[key] || new Set();
      typeMap[key].add(type);
      analyze(obj[key]);
    }
  }
}



// 🔥 si data est un objet → on analyse les valeurs
if (Array.isArray(data)) {
  data.forEach(analyze);
} else {
  Object.values(data).forEach(analyze);
}
const cleanKeys = [...allKeys].filter(k => isNaN(Number(k))); 
console.dir(cleanKeys, { depth: null, maxArrayLength: null });
//console.log("🔑 Clés rencontrées :", [...allKeys]);
//console.log("📌 Types détectés :", Object.fromEntries(
//  Object.entries(typeMap).map(([k, v]) => [k, [...v]])
//));
