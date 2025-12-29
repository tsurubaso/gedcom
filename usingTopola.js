const fs = require('fs');
const { parseGedcom, buildChart } = require('topola');

async function testerTopola() {
  try {
    // 1. Lire ton fichier GEDCOM
    const gedcomText = fs.readFileSync('./LucasFamilly.ged', 'utf-8');

    // 2. Parser directement avec Topola
    const data = parseGedcom(gedcomText);
    console.log(`✅ Fichier chargé : ${data.indis.length} personnes trouvées.`);

    // 3. Calculer les positions (Layout)
    // C'est ici que la magie opère : Topola calcule où placer chaque personne.
    const chart = buildChart({
      data,
      chartType: 'all', // Affiche ancêtres et descendants
      renderer: {
        // On définit la taille des boîtes pour le calcul du placement
        getPreferredSize: (id) => ({ width: 160, height: 80 })
      }
    });

    // 4. Exporter en JSON pour le visualiseur ou afficher un résumé
    console.log("✅ Arbre calculé avec succès !");
    console.log("Nombre de nœuds à dessiner :", chart.nodes.length);
    
    // Exemple : voir les coordonnées de la première personne
    const premierNoeud = chart.nodes[0];
    console.log(`Position de ${premierNoeud.id}: x=${premierNoeud.x}, y=${premierNoeud.y}`);

  } catch (error) {
    console.error("Erreur avec Topola :", error.message);
  }
}

testerTopola();