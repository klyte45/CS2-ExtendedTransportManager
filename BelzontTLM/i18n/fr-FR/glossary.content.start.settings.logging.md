---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Niveaux de journalisation

**Normal** enregistre les informations ordinaires, les avertissements et les erreurs et est recommandé pour une lecture régulière.

**Debug** ajoute des messages de diagnostic à partir des fonctionnalités XTM. **Trace** ajoute des activités détaillées d'événement, de localisation, de sérialisation et de traitement. **Verbeux** est extrêmement bruyant et ne doit être utilisé que brièvement sur demande.

Chaque entrée du journal XTM comprend l'identifiant XTM, la version complète du module et le niveau du message.

## Traces de pile et fenêtres contextuelles d'erreur

Les contrôles Stack-Trace et Error-popup sont disponibles lorsque la journalisation Debug, Trace ou Verbose est sélectionnée. Les traces de pile ajoutent des détails sur l'emplacement du code aux exceptions enregistrées. Les fenêtres contextuelles d'erreur permettent aux erreurs de l'enregistreur XTM d'apparaître dans l'interface utilisateur du jeu.

Le retour à la journalisation normale désactive les deux effets.

![Section de journalisation des options XTM avec le sélecteur de niveau, les traces de pile et les popups d'erreur](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Signaler un problème

Enregistrez la version du mod, sélectionnez Déboguer, reproduisez le problème une fois et utilisez **Aller au dossier de journal**. Envoyez le journal XTM avec les étapes qui ont déclenché le problème et les versions de jeu et de mod pertinentes.

Utilisez Trace uniquement lorsque le débogage est insuffisant. Évitez de laisser Verbose activé. Remettez la journalisation à Normal après avoir collecté le rapport.
