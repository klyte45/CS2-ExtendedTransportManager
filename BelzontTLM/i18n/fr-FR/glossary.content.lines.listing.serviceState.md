---
key: K45::XTM.vuio[glossary.content.lines.listing.serviceState]
---
## Quatre états de service

La liste reconnaît **Jour et nuit**, **Jour uniquement**, **Nuit uniquement** et **Désactivé**.

Une ligne marquée comme inactive est toujours classée comme désactivée, même si elle stocke toujours un horaire de jour ou de nuit précédent. Les lignes actives utilisent leur horaire pour déterminer l'un des trois autres états.

## Filtrage par état du service

Chaque bouton d'état fonctionne comme une bascule d'inclusion. Les états sélectionnés restent visibles ; les états désélectionnés sont masqués. Les filtres d'état de service se combinent avec les filtres de mode de transport, de sorte qu'une carte doit passer les deux ensembles de choix.

Les préréglages **Lignes de passagers** et **Itinéraires de fret** conservent la sélection actuelle de l'état de service. **Afficher tout** et **Masquer tout** réinitialisent les deux familles de filtres.

## Changer de service à partir d'une carte

Chaque carte comporte quatre boutons de programmation dans cet ordre : Jour et nuit, Jour uniquement, Nuit uniquement et Désactivé. La sélection d'un horaire active la ligne et applique cet horaire. La sélection de Désactivé arrête le service sans supprimer l'itinéraire ni modifier son trajet.

Les cartes désactivées sont grises, indiquent leur longueur et remplacent les informations normales sur le véhicule et l'occupation par **Ligne désactivée**. Les cartes de jour uniquement utilisent une teinte jaune pâle, les cartes de nuit uniquement utilisent du violet et les cartes de jour et de nuit utilisent le texte clair normal.

![Cartes dans les états jour et nuit, jour uniquement, nuit uniquement et désactivé](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)
