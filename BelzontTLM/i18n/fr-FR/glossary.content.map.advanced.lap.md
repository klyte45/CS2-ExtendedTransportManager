---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
**La durée prévue du trajet aller-retour** sous **Statistiques avancées** estime le nombre de minutes de jeu dont un véhicule a besoin pour terminer l'itinéraire une fois.

XTM ajoute la durée de recherche de trajet de chaque segment d'itinéraire contenant des données de trajet, met à l'échelle ce total avec un facteur d'estimation fixe et ajoute une petite allocation fixe par arrêt. Le résultat est converti en minutes de jeu en utilisant la durée du jour de la ville.

Il s'agit d'une estimation de planification à partir des données de trajet, et non d'une mesure des tours réels du véhicule. Les segments sans données de chemin sont ignorés, de sorte que les itinéraires incomplets peuvent sous-estimer le résultat. Associez la valeur au nombre de véhicules lorsque vous raisonnez sur les progrès ; le panneau ne calcule pas les progrès pour vous.

![Statistiques avancées de données de ligne avec temps d'aller-retour prévu visible](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
