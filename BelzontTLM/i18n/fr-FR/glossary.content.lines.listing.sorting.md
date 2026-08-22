---
key: K45::XTM.vuio[glossary.content.lines.listing.sorting]
---
## Trier les clés

Ouvrez **Trier les lignes** pour choisir le numéro de ligne interne, l'acronyme de la ligne, la longueur de la ligne, l'historique d'utilisation, les passagers ou le fret par mois ou l'état de planification.

![Menu des lignes de tri ouvert avec chaque touche de tri et la flèche de direction](coui://xtm.k45/UI/images/xtm-listing-sort-menu.jpg)

La valeur par défaut est le numéro de ligne interne avec les plus petits nombres en premier.

**L'acronyme de ligne** utilise un ordre de texte naturel et insensible à la casse. Si une ligne n'a pas d'acronyme, son numéro interne est utilisé comme identifiant triable.

**L'utilisation de la ligne** utilise l'occupation historique non périmée la plus élevée enregistrée sur l'itinéraire. Son orientation principale donne la priorité aux lignes les plus fréquentées.

**Passagers/Cargo par mois** commence également par la valeur la plus élevée. Les valeurs des passagers et des marchandises restent toujours au sein de leurs groupes de transport distincts.

**L'état de planification** commence par Jour et nuit, puis Jour uniquement, Nuit uniquement et Désactivé.

## Direction et regroupement

La sélection d'une clé différente applique la direction principale de cette clé. Sélectionner à nouveau la même clé l’inverse. La flèche signifie donc la direction actuelle, mais toutes les touches ne partent pas de la plus petite valeur numérique : l'utilisation et le tri des passagers/cargo partent volontairement de la valeur la plus élevée.

Le regroupement de transport est toujours conservé. Trier les cartes de réorganisation à l'intérieur de chaque section de bus, tram, train, bateau ou autre mode ; il ne produit pas un classement mixte à l'échelle de la ville.

Si les données d'itinéraire en direct changent après le tri, sélectionnez à nouveau la clé de tri lorsque vous devez actualiser l'ordre exact.
