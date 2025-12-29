const fs = require('fs');
const Topola = require('topola');

async function genererArbreComplet() {
    try {
        const gedcomRaw = fs.readFileSync('./LucasFamilly.ged', 'utf-8');
        const data = Topola.gedcomToJson(gedcomRaw);

        const NODE_W = 200, NODE_H = 50, GAP_X = 50, GAP_Y = 100;
        let nodes = [], links = [];
        let processedIndis = new Set();

        function addNode(indiId, x, y, color = "white") {
            if (processedIndis.has(indiId + y)) return; // Éviter les doublons au même niveau
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi) return;
            nodes.push({ id: indiId, x, y, name: `${indi.firstName} ${indi.lastName}`, color });
            processedIndis.add(indiId + y);
        }

        // 1. MONTER : Les Ancêtres (Parents de I1)
        function buildUp(indiId, x, y, level) {
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi || level > 4) return;
            addNode(indiId, x, y, "#e3f2fd"); // Bleu clair pour ancêtres

            const fam = data.fams.find(f => f.id === indi.famc);
            if (fam) {
                const offset = Math.pow(2, 4 - level) * 60;
                if (fam.husband) {
                    links.push({ x1: x + 100, y1: y, x2: x - offset + 100, y2: y - GAP_Y + 50 });
                    buildUp(fam.husband, x - offset, y - GAP_Y, level + 1);
                }
                if (fam.wife) {
                    links.push({ x1: x + 100, y1: y, x2: x + offset + 100, y2: y - GAP_Y + 50 });
                    buildUp(fam.wife, x + offset, y - GAP_Y, level + 1);
                }
            }
        }

        // 2. DESCENDRE : Les Enfants (issus des mariages de I1)
        function buildDown(indiId, x, y) {
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi || !indi.fams) return;

            indi.fams.forEach((famId, fIndex) => {
                const fam = data.fams.find(f => f.id === famId);
                if (fam && fam.children) {
                    fam.children.forEach((childId, cIndex) => {
                        const childX = x + (cIndex - (fam.children.length-1)/2) * (NODE_W + 20);
                        const childY = y + GAP_Y;
                        links.push({ x1: x + 100, y1: y + 50, x2: childX + 100, y2: childY });
                        addNode(childId, childX, childY, "#f1f8e9"); // Vert clair pour descendants
                        // On pourrait appeler buildDown récursivement ici pour les petits-enfants
                    });
                }
            });
        }

        // Initialisation autour de I1
        const startX = 2000, startY = 1000;
        buildUp('I1', startX, startY, 1);
        buildDown('I1', startX, startY);

        // --- GÉNÉRATION SVG ---
        const minX = Math.min(...nodes.map(n => n.x)) - 200;
        const minY = Math.min(...nodes.map(n => n.y)) - 200;
        const width = Math.max(...nodes.map(n => n.x + NODE_W)) - minX + 200;
        const height = Math.max(...nodes.map(n => n.y + NODE_H)) - minY + 200;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" style="background-color: #fafafa;">`;
        links.forEach(l => svg += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#90a4ae" stroke-width="1.5" />`);
        nodes.forEach(n => {
            svg += `<g transform="translate(${n.x}, ${n.y})">
                <rect width="${NODE_W}" height="${NODE_H}" rx="5" fill="${n.color}" stroke="#37474f" stroke-width="1" />
                <text x="10" y="30" font-family="Arial" font-size="10" font-weight="bold">${n.name.toUpperCase()}</text>
            </g>`;
        });
        svg += `</svg>`;

        fs.writeFileSync('./arbre_final.svg', svg);
        console.log("🚀 Arbre complet généré ! (Ancêtres en bleu, Descendants en vert)");

    } catch (err) {
        console.error("❌ Erreur :", err);
    }
}

genererArbreComplet();