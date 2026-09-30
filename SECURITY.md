# Politique de sécurité

« Je donne mon avis » est un service de la Direction interministérielle du numérique (DINUM). Il recueille les avis des usagers sur les démarches administratives en ligne : les données traitées comprennent des commentaires libres et, parfois, des adresses e-mail laissées par les usagers. Nous prenons au sérieux tout signalement qui permettrait de mieux les protéger.

## Versions concernées

Seule la version en production, construite à partir de la branche `main`, est maintenue. Les correctifs de sécurité ne sont pas rétroportés sur d'anciennes versions.

## Signaler une vulnérabilité

**Ne créez pas d'issue publique, de pull request ni de discussion** pour une vulnérabilité : ce dépôt est public.

Écrivez à **contact.jdma@design.numerique.gouv.fr** en commençant l'objet par `[SÉCURITÉ]`, en indiquant autant que possible :

- le composant concerné (backoffice, formulaire public, API partenaires, script d'intégration) et l'URL ou l'endpoint ;
- une description de la vulnérabilité et de son impact ;
- les étapes pour la reproduire (requêtes, captures, preuve de concept minimale) ;
- la version ou la date du test ;
- vos coordonnées, si vous souhaitez être tenu informé ou cité.

Vous pouvez aussi transmettre votre signalement au CERT-FR de l'ANSSI : <https://www.cert.ssi.gouv.fr/contact/>. L'ANSSI préserve la confidentialité de l'identité de la personne à l'origine de la transmission (article L. 2321-4 du code de la défense).

## Ce à quoi vous pouvez vous attendre

- un accusé de réception sous **5 jours ouvrés** ;
- une première évaluation (confirmation, sévérité, suite envisagée) sous **15 jours ouvrés** ;
- des nouvelles jusqu'à la correction, et une information lorsqu'elle est déployée.

Nous vous demandons de ne pas divulguer publiquement la vulnérabilité avant sa correction, ou avant un délai de **90 jours** à compter de l'accusé de réception si aucun accord n'a été trouvé. Nous pouvons convenir ensemble d'un autre calendrier.

Ce service ne propose pas de programme de récompense (_bug bounty_).

## Périmètre

Sont concernés :

- le backoffice et le formulaire public servis sous `jedonnemonavis.numerique.gouv.fr` ;
- l'API partenaires (`/api/open-api/*`) ;
- le script d'intégration du bouton et du widget ;
- le code de ce dépôt.

Sont hors périmètre :

- les attaques par déni de service ou par volumétrie ;
- l'ingénierie sociale, l'hameçonnage des équipes et les attaques physiques ;
- les services tiers (Clever Cloud, ProConnect, Matomo…), à signaler directement à leurs éditeurs ;
- les constats sans impact démontré : en-têtes manquants, bannières de version, _self-XSS_, absence de limitation sur des actions sans conséquence ;
- les vulnérabilités des dépendances sans scénario d'exploitation dans ce service.

## Règles de test

Pour un test mené de bonne foi :

- utilisez vos propres comptes et, pour le formulaire public, des données fictives ;
- n'accédez pas aux données d'autres utilisateurs ou usagers au-delà du strict nécessaire pour démontrer la vulnérabilité, ne les modifiez pas, ne les supprimez pas et ne les conservez pas ; si vous y accédez par inadvertance, arrêtez-vous et signalez-le ;
- n'altérez pas le fonctionnement du service et ne dégradez pas sa disponibilité ;
- ne créez pas de clé d'API, de compte ou de droit qui persisterait après le test sans nous l'indiquer.

---

## English summary

Please do not report security issues through public GitHub issues or pull requests. Email **contact.jdma@design.numerique.gouv.fr** with a subject starting with `[SECURITY]`, describing the affected component, impact and reproduction steps. We aim to acknowledge reports within 5 business days and ask that you keep them confidential until fixed, or for 90 days. Only the production version built from `main` is supported. There is no bug bounty.
