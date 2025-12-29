const { JsonParsing, ParsingOptions } = require('gedcom.json');

// 1. Configurer les options avec le chemin de votre fichier
let options = new ParsingOptions();
options.SetFilePath('./LucasFamilly.ged'); // Vérifiez que le nom du fichier est correct

// 2. Créer l'instance
let parser = new JsonParsing(options);

// 3. Utiliser la méthode identifiée par le diagnostic
// Puisque c'est un fichier local, ParseFile est la plus appropriée
parser.ParseFile((result) => {
    if (result && result.Object) {
        console.log("✅ Parsing réussi !");
        
        // Affiche un aperçu des données (les premiers éléments)
        console.log("Aperçu du JSON :");
        console.log(JSON.stringify(result.Object, null, 2));
        
        // Affiche les statistiques (nombre d'individus, familles, etc.)
       // console.log("\n📊 Statistiques :");
       // console.table(result.Statistics);
    } else {
      
        console.error("❌ Échec : Le résultat est vide. Vérifiez le chemin du fichier .ged");
    }
});

