const fs = require("fs");
const { JsonParsing, ParsingOptions } = require("gedcom.json");

// 1. Configurer les options
let options = new ParsingOptions();
options.SetFilePath("./LucasFamilly.ged");

// 2. Créer le parser
let parser = new JsonParsing(options);

// 3. Parser le fichier GEDCOM
parser.ParseFile((result) => {
  if (result && result.Object) {
    console.log("✅ Parsing réussi !");

    // Convertir en JSON formaté
    const jsonData = JSON.stringify(result.Object, null, 2);

    // 4. Sauvegarde dans un fichier
    fs.writeFileSync(
      "./LucasFamilly.json",
      jsonData,
      "utf-8"
    );

    console.log("💾 Fichier sauvegardé : LucasFamilly.json");

  } else {
    console.error("❌ Échec : résultat vide. Vérifie le chemin du fichier GEDCOM.");
  }
});
