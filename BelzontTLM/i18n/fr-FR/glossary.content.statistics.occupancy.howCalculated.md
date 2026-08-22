---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM enregistre l'occupation historique lorsqu'un véhicule de tourisme ou de fret termine l'embarquement et commence à se diriger vers son prochain arrêt. L'échantillon appartient au segment dirigé commençant à l'arrêt de départ.

Chaque segment comporte six périodes : **00h00-04h00**, **04h00-08h00**, **08h00-12h00**, **12h00-16h00**, **16h00-20h00** et **20h00-24h00**. **Heure actuelle** sélectionne la période contenant l'heure de simulation actuelle. **La moyenne quotidienne** est la simple moyenne des périodes non périmées.

## Lissage axé sur les pics

Un échantillon au-dessus de la valeur stockée la remplace immédiatement. Un échantillon inférieur mélange 70 % de la valeur précédente avec 30 % du nouvel échantillon. La capacité suit la même règle. Cela révèle rapidement un encombrement soudain tandis que des départs répétés et plus silencieux réduisent progressivement l'historique.

Une période devient obsolète lorsque son dernier échantillon est plus ancien qu’hier. Les périodes périmées apparaissent sous forme de lacunes dans les graphiques et sont exclues des moyennes, des plages de référencement et des classements. Les valeurs de carte manquantes ou obsolètes apparaissent actuellement sous la forme 0 %.

![Historique d'occupation du segment avec six périodes de quatre heures et la moyenne quotidienne non périmée](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
