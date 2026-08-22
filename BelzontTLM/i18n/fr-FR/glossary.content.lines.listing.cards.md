---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identité et apparence

La bande diagonale colorée indique l'**identifiant d'affichage** de l'itinéraire. Un acronyme non vide est prioritaire ; sinon, le numéro de route interne est affiché. Sélectionnez l'identifiant pour modifier les deux valeurs.

![Carte de ligne avec la bande d'identification, le bouclier, le nom, le type, les statistiques et la bande de planification](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

Le petit bouclier en dessous montre l'icône de transport. Sa forme suit le mode de transport, les itinéraires de fret reçoivent un badge de fret et les services de jour, de nuit ou handicapés reçoivent un badge d'État coloré.

Sélectionnez le bouclier pour ouvrir le sélecteur de couleurs. Le choix d'une couleur crée un remplacement de couleur fixe. Lorsqu'une palette est attribuée à l'itinéraire et que la carte reconnaît un remplacement fixe, **Restaurer la couleur de la palette** redonne le contrôle à la coloration automatique.

Sélectionnez le nom de l'itinéraire pour le renommer. Quitter l'éditeur valide un nom modifié et non vide ; Escape annule la modification.

![Contrôles d'édition de carte avec l'éditeur d'identifiant, le champ de nom et le sélecteur de couleur](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Type et détails

Sous le nom, la carte identifie la ligne de passagers ou le type d'itinéraire de fret localisé. Sélectionnez **Détails** pour cibler cet itinéraire et ouvrir son panneau d'informations sélectionnées.

## Longueur, demande et véhicules

Une carte activée affiche la longueur de l'itinéraire suivie de ses statistiques mensuelles sur les passagers ou le fret. Les valeurs des passagers sont formatées sous forme de nombre avec l'étiquette du passager du mode. Les valeurs de fret sont formatées sous forme de poids localisé.

La ligne suivante montre le nombre de véhicules actifs sur l'itinéraire et une plage d'occupation historique. La plage correspond à l'occupation effective minimale et maximale trouvée sur les arrêts de l'itinéraire et sur six tranches horaires de quatre heures. Les buckets plus anciens qu’hier sont ignorés.

La plage utilise des pourcentages à une décimale. Sa couleur de fond suit la valeur maximale, ce qui permet de repérer plus facilement les itinéraires très fréquentés. Un nouvel itinéraire ou un itinéraire sans historique utilisable peut afficher **0,0 % ~ 0,0 %**.

Les cartes désactivées affichent toujours la longueur de l'itinéraire, mais masquent les statistiques sur les passagers ou le fret et remplacent les données sur le véhicule et l'occupation par **Ligne désactivée**.

## Contrôles des services

La bande en bas modifie l'itinéraire directement entre Jour et nuit, Jour uniquement, Nuit uniquement et Désactivé. Le bouton en surbrillance correspond à l'état actuel. La modification de ces contrôles met également à jour le filtre d’état de service qui inclut la carte.
