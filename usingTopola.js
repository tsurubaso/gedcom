const fs = require('fs');
const Topola = require('topola');

async function genererArbreProfond() {
    try {
        const gedcomRaw = fs.readFileSync('./LucasFamilly.ged', 'utf-8');
        const data = Topola.gedcomToJson(gedcomRaw);

        const NODE_W = 180, NODE_H = 50, GAP_X = 40, GAP_Y = 100;
        let nodes = [], links = [], processedIndis = new Set();

        function addNode(indiId, x, y, color = "white") {
            if (processedIndis.has(indiId)) return false; 
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi) return false;
            
            nodes.push({ id: indiId, x, y, name: `${indi.firstName || ''} ${indi.lastName || ''}`.trim(), color });
            processedIndis.add(indiId);
            return true;
        }

        // 1. REMONTER (Ancestors) - Jusqu'à 10 générations
        function buildUp(indiId, x, y, level) {
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi || level > 10) return;
            addNode(indiId, x, y, "#e3f2fd");

            const fam = data.fams.find(f => f.id === indi.famc);
            if (fam) {
                const offset = Math.pow(2, 7 - level) * 20; // Ajustement de l'écartement
                if (fam.husband) {
                    links.push({ x1: x + 90, y1: y, x2: x - offset + 90, y2: y - GAP_Y + 50 });
                    buildUp(fam.husband, x - offset, y - GAP_Y, level + 1);
                }
                if (fam.wife) {
                    links.push({ x1: x + 90, y1: y, x2: x + offset + 90, y2: y - GAP_Y + 50 });
                    buildUp(fam.wife, x + offset, y - GAP_Y, level + 1);
                }
            }
        }

        // 2. DESCENDRE (Descendants) - Récursif pour toutes les générations
        function buildDown(indiId, x, y, level) {
            const indi = data.indis.find(i => i.id === indiId);
            if (!indi || !indi.fams || level > 15) return;

            indi.fams.forEach((famId) => {
                const fam = data.fams.find(f => f.id === famId);
                if (fam && fam.children) {
                    const totalWidth = fam.children.length * (NODE_W + GAP_X);
                    fam.children.forEach((childId, cIndex) => {
                        const childX = x + (cIndex * (NODE_W + GAP_X)) - (totalWidth / 2) + (NODE_W / 2);
                        const childY = y + GAP_Y;
                        
                        if (addNode(childId, childX, childY, "#f1f8e9")) {
                            links.push({ x1: x + 90, y1: y + 50, x2: childX + 90, y2: childY });
                            buildDown(childId, childX, childY, level + 1); // <--- L'APPEL RÉCURSIF EST ICI
                        }
                    });
                }
            });
        }

        const startX = 5000, startY = 2000;
        buildUp('I1', startX, startY, 1);
        buildDown('I1', startX, startY, 1);

        // --- GÉNÉRATION SVG ---
        const minX = Math.min(...nodes.map(n => n.x)) - 500;
        const minY = Math.min(...nodes.map(n => n.y)) - 500;
        const width = Math.max(...nodes.map(n => n.x + NODE_W)) - minX + 500;
        const height = Math.max(...nodes.map(n => n.y + NODE_H)) - minY + 500;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" style="background-color: white;">`;
        links.forEach(l => svg += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#bdc3c7" stroke-width="1" />`);
        nodes.forEach(n => {
            svg += `<g transform="translate(${n.x}, ${n.y})">
                <rect width="${NODE_W}" height="${NODE_H}" rx="3" fill="${n.color}" stroke="#34495e" />
                <text x="10" y="30" font-family="Arial" font-size="9">${n.name}</text>
            </g>`;
        });
        svg += `</svg>`;

        fs.writeFileSync('./arbre_profond.svg', svg);
        console.log(`✅ Arbre généré : ${nodes.length} personnes affichées sur 482.`);

    } catch (err) {
        console.error(err);
    }
}

genererArbreProfond();