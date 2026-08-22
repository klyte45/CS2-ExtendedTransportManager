---
key: K45::XTM.vuio[glossary.content.lines.stopOrder.symmetric]
---
XTM détecte un itinéraire aller-retour lorsque les arrêts aux positions en miroir partagent la même gare ou bâtiment parent. La détection utilise l'ordre de routage et l'identité du parent ; il ne compare pas les noms, la distance ou la direction de la plate-forme.

Lorsque **Demi-trajet** est activé et que les véhicules sont masqués, la carte linéaire affiche l'itinéraire depuis son premier arrêt jusqu'au terminus médian. Les plates-formes intermédiaires aller et retour partagent un marqueur d'arrêt partagé. Passez la souris dessus pour inspecter les passagers ou les marchandises en attente dans chaque direction.

Un triangle à côté d'un arrêt sélectionné indique si son quai appartient au sens aller ou retour. Les valeurs d'occupation des segments utilisent des flèches vers le bas et vers le haut pour les deux directions.

Activez les véhicules ou désactivez **Demi-trajet** pour voir la boucle complète. La modification du premier arrêt peut modifier ou désactiver la détection de symétrie car elle fait pivoter les positions utilisées pour l'appairage.

![Mode d'affichage demi-tour et aller-retour d'une même ligne](coui://xtm.k45/UI/images/xtm-linear-map-switch.jpg)
