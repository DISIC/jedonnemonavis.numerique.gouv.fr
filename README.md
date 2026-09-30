# Je donne mon avis

![CI Workflow](https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr/actions/workflows/ci.yml/badge.svg)

## Développement

### Containers Elastic, Kibana et Postgres

Copiez le fichier `.env.example` en utilisant la commande suivante :

```bash
cp .env.example .env
```

Démarrez les conteneurs Docker pour Elastic, Kibana et Postgres avec la commande :

```bash
docker compose up -d
```

Au premier run ELK, lancez cette commande pour initialiser le mot de passe du user "kibana_system" (remplacer {ES_ADDON_PASSWORD} et {KIBANA_PASSWORD} par les mots de passe de votre environnement) :

```bash
docker exec elasticsearch curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:{ES_ADDON_PASSWORD}" -H "Content-Type: application/json" https://elasticsearch:9200/_security/user/kibana_system/_password -d "{\"password\":\"{KIBANA_PASSWORD}\"}"
```

Au premier run ELK, lancez cette suite de commandes

```bash
cd webapp-form
mkdir -p certs/ca
docker cp elasticsearch:/usr/share/elasticsearch/config/certs/ca/ca.crt ./certs/ca/ca.crt
```

### Webapp Administration

Accédez au dossier de l'application NextJS webapp-backoffice :

```bash
cd webapp-backoffice
```

Copiez le fichier .env.example :

```bash
cp .env.example .env
```

Afin que l'application puisse envoyer des e-mails, veuillez configurer le service de messagerie dans votre fichier .env :

| Variable            | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| NODEMAILER_HOST     | Adresse hôte du service de messagerie.                          |
| NODEMAILER_PORT     | Numéro de port du service de messagerie.                        |
| NODEMAILER_USER     | Identifiants utilisateur pour accéder au service de messagerie. |
| NODEMAILER_PASSWORD | Mot de passe associé à l'utilisateur du service de messagerie.  |
| NODEMAILER_FROM     | Adresse e-mail utilisée comme adresse de l'expéditeur.          |

Installez les dépendances nécessaires :

```bash
yarn
```

Initialisez la base de données Postgres :

```bash
npx prisma migrate dev
```

Effectuez un seeding de la base de données Postgres :

```bash
npx prisma db seed
```

Lancez l'application, qui sera accessible sur le port 3000 :

```bash
yarn dev
```

#### Connexion en local

La connexion au backoffice se fait uniquement avec ProConnect et une double authentification, sur l'environnement d'intégration ProConnect :

1. Créez un fournisseur de service de test sur l'[espace partenaires ProConnect](https://partenaires.proconnect.gouv.fr) avec :
   - l'URL de redirection `http://localhost:3000/api/auth/callback/openid` ;
   - l'URL de déconnexion `http://localhost:3000/login`.
2. Renseignez `PROCONNECT_CLIENT_ID` et `PROCONNECT_CLIENT_SECRET` dans `.env`. `PROCONNECT_DOMAIN` pointe déjà sur l'intégration (`fca.integ01.dev-agentconnect.fr`).
   L'encart d'information sécurité de `/login` s'affiche jusqu'à la date `PROCONNECT_NOTICE_UNTIL` (dernier jour inclus, au format `AAAA-MM-JJ`). Sans cette variable, il reste affiché.
3. Sur `/login`, cliquez sur « S'identifier avec ProConnect » et choisissez le fournisseur d'identité de test. Ses [identifiants de test](https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/identifiants-fi-test) permettent de choisir librement l'email, le SIRET et le niveau `acr` :

| Cas à tester                                                                                | Email                        | `acr`                |
| ------------------------------------------------------------------------------------------- | ---------------------------- | -------------------- |
| Connexion à un compte de seed                                                               | `admin@example.com`          | `eidas2` ou `eidas3` |
| Création d'un compte à la première connexion                                                | une adresse inconnue en base | `eidas2` ou `eidas3` |
| Refus sans double authentification (par ProConnect ou par JDMA, avec `?error=MFA_REQUIRED`) | n'importe laquelle           | `eidas1`             |

Les données de test créent les comptes suivants, utilisables avec le fournisseur d'identité de test :

| Email             | Rôle           |
| ----------------- | -------------- |
| user1@example.com | Porteur        |
| user2@example.com | Porteur        |
| user3@example.com | Porteur        |
| user4@example.com | Porteur        |
| admin@example.com | Administrateur |

#### Création/Édition des templates d'e-mails

Dans le dossier `webapp-backoffice/react-email`, vous trouverez les templates d'e-mails utilisant la bibliothèque [react-email](https://react.email/).

Pour prévisualiser les templates d'e-mails depuis ce dossier, vous pouvez utiliser la commande suivante :

Premièrement, assurez-vous d'être dans le dossier `webapp-backoffice/react-email` puis d'installer les dépendances :

```bash
yarn
```

Ensuite, lancez le serveur de prévisualisation :

```bash
yarn dev
```

### Webapp Formulaire

Accédez au dossier de l'application NextJS webapp-form :

```bash
cd webapp-form
```

Copiez le fichier .env.example :

```bash
cp .env.example .env
```

Installez les dépendances nécessaires :

```bash
yarn
```

Lancez l'application, qui sera accessible sur le port 3001 :

```bash
yarn dev
```

## Tests Cypress

Ce dépôt est configuré pour exécuter des tests via Cypress avant chaque merge sur les branches /clevercloud et /main.
Un fichier docker-compose est disponible afin de fournir un environnement propice à l'exécution des tests en local.

### Prérequis

Avant de commencer, assurez-vous que les éléments suivants sont installés :

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Containers

Afin de monter l'environnement propice aux tests en local, utilisez la commande suivante :

```bash
docker compose -f docker-compose.tests.yaml up -d
```

Afin de supprimer les différents containers, utilisez la commande :

```bash
docker compose -f docker-compose.tests.yaml down
```

### Cypress

Pour run les tests cypress en mode headless, tapez :

```bash
npx cypress run --browser firefox
```

Pour ouvrir l'utilitaire cypress et run les tests avec l'interface, tapez

```bash
npx cypress open
```
