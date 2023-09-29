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
