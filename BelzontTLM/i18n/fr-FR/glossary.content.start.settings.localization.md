---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Traductions intégrées

XTM charge l'anglais comme langue de base pour chaque paramètre régional de jeu pris en charge. Le package actuel contient également des traductions CSV en portugais (Brésil) et en coréen.

Lorsqu'une clé traduite est manquante ou vide, la valeur CSV anglaise est utilisée.

## Fichiers CSV

Le **i18n.csv** principal contient des colonnes de langue. Un fichier de langue distinct tel que **ko-KR.csv** est utilisé uniquement lorsque cette langue n'a pas de colonne dans le fichier principal.

Les fichiers CSV sont séparés par des tabulations et nécessitent une ligne d'en-tête. Conservez les espaces réservés de formatage tels que les accolades inchangés. Utilisez les séquences littérales \n et \t lorsqu'une valeur CSV nécessite un saut de ligne ou une tabulation.

## Corps du glossaire Markdown

Les entrées de glossaire longues utilisent un fichier Markdown par clé sous **i18n/en-US**. D'autres langues peuvent superposer des entrées individuelles dans leur propre dossier de langue. Un fichier Markdown traduit manquant conserve automatiquement le corps anglais.

Chaque fichier Markdown nécessite un frontmatter contenant **key:** ou **entry:** suivi de la clé de localisation assemblée.

Les corps Markdown se chargent après les entrées CSV, donc un fichier Markdown remplace une valeur CSV avec la même clé.

## Tester les traductions

Utilisez le **dossier Go To Translations** pour ouvrir le répertoire XTM i18n installé. Après avoir modifié un fichier, utilisez **Recharger les traductions** pour supprimer et reconstruire toutes les sources de localisation XTM sans redémarrer le jeu.

![Page d'options avec le dossier des traductions et les boutons de rechargement à côté des raccourcis du forum, du référentiel et du dossier de journaux](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Si le texte déjà ouvert ne s'actualise pas visuellement, fermez et rouvrez ce panneau après le rechargement.
