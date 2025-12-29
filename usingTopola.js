const fs = require('fs');
const Topola = require('topola');

async function genererArbreSVG() {
    try {
        const gedcomRaw = fs.readFileSync('./LucasFamilly.ged', 'utf-8');
        const data = Topola.gedcomToJson(gedcomRaw);
        
        console.log(`✅ ${data.indis.length} individus chargés.`);

        // 1. Trouver une personne qui a au moins un lien familial pour éviter un arbre vide
        const depart = data.indis.find(i => (i.famc || i.fams)) || data.indis[0];
        console.log(`📍 Départ de l'arbre : ${depart.firstName} ${depart.lastName} (${depart.id})`);

        const dataProvider = new Topola.JsonDataProvider(data);
        const renderer = new Topola.SimpleRenderer();

        // 2. Créer l'arbre
        const chart = Topola.createChart({
            data: dataProvider,
            renderer: renderer,
            chartType: 'relatives',
            startIndi: depart.id
        });

        // Vérification de sécurité
        if (!chart.nodes || chart.nodes.length === 0) {
            throw new Error("Aucun nœud généré pour cet individu.");
        }

        // 3. Calculer les dimensions (ViewBox)
        const info = Topola.getChartInfo(chart);
        
        // Construction du SVG
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${info.originX - 50} ${info.originY - 50} ${info.width + 100} ${info.height + 100}" style="background-color: white;">`;
        
        // Style pour les lignes
        svgContent += `<style>.link { fill: none; stroke: #888; stroke-width: 2px; } .node-rect { fill: #fff; stroke: #333; stroke-width: 1.5px; } .node-text { font-family: sans-serif; font-size: 12px; }</style>`;

        // Dessiner les liens
        chart.links.forEach(link => {
            svgContent += `<path class="link" d="${link.path}" />`;
        });

        // Dessiner les individus
        chart.nodes.forEach(node => {
            const indi = data.indis.find(i => i.id === node.id);
            const nom = indi ? `${indi.firstName || ''} ${indi.lastName || ''}`.trim() : node.id;
            
            svgContent += `
                <g transform="translate(${node.x}, ${node.y})">
                    <rect class="node-rect" width="${node.width}" height="${node.height}" rx="4" />
                    <text class="node-text" x="10" y="30">${nom}</text>
                </g>`;
        });

        svgContent += `</svg>`;

        fs.writeFileSync('./arbre.svg', svgContent);
        console.log("🚀 Succès ! Ouvrez 'arbre.svg' dans votre navigateur.");

    } catch (err) {
        console.error("❌ Erreur :", err.message);
    }
}

genererArbreSVG();