# Je donne mon avis

## Developpement

### Containers Elastic, Kibana et MongoDB

Copiez le fichier `.env.example` en utilisant la commande suivante :

```bash
cp .env.example .env
```

Démarrez les conteneurs Docker pour Elastic, Kibana et MongoDB avec la commande :

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
| NODEMAILER_BASEURL  | URL de base du service de messagerie.                           |

Installez les dépendances nécessaires :

```bash
yarn
```

Effectuez un seeding de la base de données MongoDB :

```bash
npx prisma db seed
```

Lancez l'application, qui sera accessible sur le port 3000 :

```bash
yarn dev
```

Voici les informations des utilisateurs prêts à être utilisés en développement grâce aux données de test :
| Email | Compte Activé | Ancien Compte Observatoire | Mot de Passe |
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
