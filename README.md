# Je donne mon avis

![CI Workflow](https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr/actions/workflows/ci.yml/badge.svg)

## Developpement

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

Au premier run ELK, lancez cette suite de commande

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

Voici les informations des utilisateurs prêts à être utilisés en développement grâce aux données de test :
| Email | Rôle | Compte activé | Ancien compte observatoire | Mot de passe |
|---------------------|---------------------|---------------|---------------------------|--------------|
| user1@example.com | Porteur | Non | Non | jdma |
| user2@example.com | Porteur | Non | Oui | jdma |
| user3@example.com | Porteur | Oui | Oui | jdma |
| user4@example.com | Porteur | Oui | Non | jdma |
| admin@example.com | Administrateur | Oui | Non | jdma |

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

Ce dépôt est configuré pour éxécuter des tests via Cypress avant chaque merge sur les branches /clevercloud et /main.
Un fichier docker-compose est disponible afin de fournir un environnement propice à l'éxécution des tests en local.

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
