---
key: K45::XTM.vuio[glossary.content.appearance.autoColor.indexing]
---
Pour une affectation valide non vide, XTM sélectionne une couleur de palette à partir du **numéro de route interne**. La route 1 utilise la première couleur, la route 2 la seconde et la séquence s'enroule après la dernière couleur.

La route 0 revient à la couleur finale et les numéros de route négatifs continuent à reculer dans la séquence. L’identifiant d’affichage, l’acronyme et le nom n’affectent pas l’indexation.

La modification du numéro interne peut modifier la couleur de l'itinéraire. La modification ou la réorganisation d'une palette modifie la couleur représentée par chaque position.

Un itinéraire avec **Utiliser une couleur fixe** ignore les modifications d'affectation, de numéro et de palette jusqu'à ce que le remplacement soit supprimé. Si une affectation est désactivée, manquante ou vide, le retour au contrôle de la palette peut laisser la couleur actuelle inchangée.

![Positions de la palette correspondant aux numéros de route](coui://xtm.k45/UI/images/xtm-palette-indexing.jpg)
