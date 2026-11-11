# TaskZen

TaskZen est une application de gestion personnelle des tâches et des projets. Elle combine organisation, suivi de progression et outils de concentration dans une interface React + TypeScript.

## Fonctionnalités repérées dans le code

- Authentification avec écrans de connexion et d'inscription.
- Tableau de bord et statistiques de tâches.
- Création, modification, consultation et suppression logique des tâches.
- Gestion de projets, tags, archives et corbeille.
- Filtres et mode concentration.
- Thème sombre.
- Notifications, gamification et badges.
- Export des données en JSON et CSV.
- Outils complémentaires : exercice de respiration et assistant ZenBot.

> Les fonctionnalités sont décrites à partir de la structure du code. Leur comportement complet, la sécurité de l'authentification et la persistance des données doivent être testés avant une mise en production.

## Stack technique

- React 19
- TypeScript
- Vite
- Oxlint

## Prérequis

- Node.js compatible avec la version de Vite utilisée
- npm

## Installation et lancement

```bash
git clone https://github.com/chris-dev47/taskzen.git
cd taskzen
npm install
npm run dev
```

Vite affiche dans le terminal l'adresse locale à ouvrir dans le navigateur.

## Scripts

| Commande | Utilité |
|---|---|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Vérifier les types TypeScript et construire l'application |
| `npm run lint` | Analyser le code avec Oxlint |
| `npm run preview` | Prévisualiser le build de production |

## Organisation du code

```text
src/
├── components/   # Authentification, tâches, projets et interface
├── hooks/        # Logique métier et état applicatif
├── types/        # Types TypeScript
├── utils/        # Helpers, stockage et export
├── App.tsx
└── main.tsx
public/
package.json
vite.config.ts
```

## Qualité et prochaines vérifications

- Exécuter `npm run build` et `npm run lint`.
- Vérifier le parcours d'inscription et de connexion.
- Examiner la stratégie de stockage et la protection des données utilisateur.
- Ajouter des tests automatisés sur les opérations critiques.
- Documenter les limites connues et le déploiement.

## Auteur

[Chris-dev47](https://github.com/chris-dev47)
