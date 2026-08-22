---
key: K45::XTM.vuio[glossary.content.lines.identity.color]
---
Chaque itinéraire a une couleur actuelle. XTM peut soit conserver une **couleur fixe** choisie pour cet itinéraire, soit laisser une palette de ville attribuée le contrôler.

Dans le panneau d'informations sélectionnées de l'itinéraire, activez **Utiliser la couleur fixe** pour afficher le sélecteur de couleurs. Dans la liste XTM, la sélection d'une nouvelle couleur sur le bouclier de la carte corrige automatiquement cet itinéraire. Un itinéraire fixe conserve sa couleur lorsque son numéro interne, la palette qui lui est attribuée ou le contenu de la palette changent.

## Couleur contrôlée par palette

Les palettes sont attribuées par type de transport, séparément pour les lignes de passagers et les itinéraires de fret, sur l'écran **Palettes disponibles**. Les types de bus de passagers, de tramway, de métro, de train, de bateau, d'avion et de ferry prennent en charge les missions. Les affectations de fret sont disponibles pour les itinéraires de train, de bateau et d'avion.

Seules les palettes enregistrées dans la bibliothèque de palettes de la ville actuelle peuvent être attribuées. Les palettes de bibliothèque importées ou regroupées doivent d'abord être ajoutées à la ville.

Pour une affectation valide non vide, le numéro de route interne sélectionne une entrée de palette et parcourt la palette si nécessaire. L'identifiant d'affichage n'affecte pas cette sélection.

Désactivez **Utiliser la couleur fixe** ou sélectionnez **Restaurer la couleur de la palette** sur une fiche de listing lorsque cela est proposé, pour renvoyer l'itinéraire vers le contrôle de la palette. Si la coloration automatique est désactivée pour ce type de transport, ou si sa palette est manquante ou vide, la suppression du remplacement fixe ne sélectionne pas de nouvelle couleur ; la couleur actuelle peut rester.
