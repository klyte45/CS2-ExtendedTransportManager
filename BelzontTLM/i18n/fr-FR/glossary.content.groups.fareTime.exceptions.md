---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Utilisez **Exceptions horaires** lorsqu'un tarif doit différer du tarif par défaut pendant une partie de la journée. **Ajouter une exception** crée une plage d'une heure dans la première heure non couverte et copie le tarif par défaut arrondi.

Définissez le début, la fin et le tarif. Les heures s'étendent de 0 à 23 et les deux points de terminaison sont inclus : 7 à 9 s'applique de 07h00 à 09h59.

Le début ne peut pas être postérieur à la fin et les plages ne peuvent pas s'étendre sur minuit. Utilisez deux exceptions pour une période de nuit. Les exceptions ne peuvent pas se chevaucher ; étant donné que les points de terminaison sont inclusifs, les plages partageant une heure sont également en conflit.

XTM prend en charge au maximum 20 exceptions. Les plages non valides affichent un avertissement et empêchent l'enregistrement de toutes les modifications de groupe actuelles jusqu'à ce qu'elles soient corrigées ou supprimées.

Définissez un tarif d'exception sur **0** pour voyager gratuitement pendant cette plage.

![Exceptions horaires avec plages payantes et gratuites](coui://xtm.k45/UI/images/xtm-fare-group-hour-exceptions.jpg)
