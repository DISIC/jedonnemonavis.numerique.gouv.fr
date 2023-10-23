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
npx prisma db migrate dev
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
| Email | Compte activé | Ancien compte observatoire | Mot de passe |
|---------------------|---------------|---------------------------|--------------|
| user1@example.com | Non | Non | jdma |
| user2@example.com | Non | Oui | jdma |
| user3@example.com | Oui | Oui | jdma |
| user4@example.com | Oui | Non | jdma |

### Webapp Formulaire

Accédez au dossier de l'application NextJS webapp-form :

```bash
cd webapp-form
```

Installez les dépendances nécessaires :

```bash
yarn
```

Lancez l'application, qui sera accessible sur le port 3001 :

```bash
yarn dev
```
