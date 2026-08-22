---
key: K45::XTM.vuio[glossary.content.lines.stopOrder.firstStop]
---
Sélectionnez un arrêt sur la carte linéaire XTM, puis utilisez le bouton **1** dans **Stop Data** pour en faire le premier arrêt de l'itinéraire. Le bouton est désactivé pour l'arrêt qui est déjà le premier.

XTM fait pivoter l'ordre d'arrêt de l'itinéraire sans inverser sa direction. L'arrêt choisi devient le haut de la carte linéaire complète et le terminus de départ utilisé par la vue symétrique demi-trajet.

La modification du premier arrêt modifie également les indices d’arrêt et les limites aveugles de destination Write Everywhere. Le texte de destination configuré pour utiliser la fin de la ligne est résolu par le nouveau premier arrêt.

Un itinéraire symétrique peut ne plus être éligible au mode demi-trajet si vous choisissez une plateforme intermédiaire. Le choix du terminus opposé préserve normalement l'appariement aller-retour tout en échangeant les deux extrémités.

![Non-premier arrêt sélectionné avec les données d'arrêt affichant les actions 1 et flèche circulaire](coui://xtm.k45/UI/images/xtm-sip-first-stop.jpg)
