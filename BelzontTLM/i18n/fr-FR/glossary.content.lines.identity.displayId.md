---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
L'**identifiant d'affichage**, également appelé acronyme de ligne ou identifiant d'itinéraire dans certaines commandes, est un texte facultatif affiché à la place du numéro d'itinéraire interne.

Sélectionnez l'identifiant sur une fiche d'inscription XTM pour modifier ensemble l'acronyme et le numéro interne. L'acronyme peut également être modifié dans la section **Données de ligne** de l'itinéraire sélectionné. Effacez-le pour renvoyer les noms générés et les boucliers XTM au numéro interne.

![Éditeur d'identifiant ouvert sur une linecard, avec les champs sigle et numéro interne](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Priorité

Un nom de route personnalisé reste indépendant et n'est pas remplacé par l'identifiant. Lorsque le jeu génère un nom de route, un identifiant non vide est utilisé comme jeton numérique ; sinon, le numéro interne est utilisé.

XTM utilise la même règle d'identification d'abord pour les boucliers dans la carte linéaire, les rapports d'occupation, les groupes tarifaires, les groupes de modèles de véhicules et les détails des segments. La liste l'affiche à côté du bouclier de transport. La sélection automatique des couleurs et le tri numérique utilisent toujours le numéro d'itinéraire interne.

Gardez les identifiants courts. Le texte du bouclier est réduit pour s'adapter et la valeur stockée a une petite limite d'octets UTF-8.
