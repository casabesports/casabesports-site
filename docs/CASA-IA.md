# Casa IA — l'assistant du site et de l'application

Casa IA est la bulle BE+ en bas à droite de l'écran. Elle répond aux questions et ouvre les bonnes pages du site.

## 1. Ce qu'elle sait faire tout de suite (gratuit, rien à régler)

| Question | D'où vient la réponse |
|---|---|
| « Qui est Casa Besports ? », « Qui est Kader Allou ? », « C'est quoi BE+ ? » | Page À propos (`contenus/apropos.js`) et abonnements |
| « Les niveaux du football », « C'est quoi la R2 ? » | Pyramide des compétitions (`contenus/casa-ia.js`) |
| « Classement de Tourlaville », « Prochain match de Saint-Lô », « Classement handball Manche » | Classements et calendriers du Terrain : fédérations (mis à jour automatiquement) et onglet Résultats de l'admin |
| « Qui est Antoine Dupont ? », « Qui a gagné la Coupe du monde 2022 ? », « C'est quoi un hors-jeu ? » | Wikipédia en français, avec la source et un bouton « Lire sur Wikipédia » |
| Scores, boutique, Gazette, météo, histoire des lieux, Club House… | Comme avant |

Règle : Casa IA n'invente rien. Si elle ne trouve pas de réponse sûre, elle le dit.

Limite : Wikipédia ne connaît pas les résultats du jour du sport national et international. Pour cela, il faut le mode connecté (partie 3).

## 2. Ajouter vos propres réponses

Ouvrez `contenus/casa-ia.js` sur GitHub (crayon « Edit ») :

- `accueil` : le premier message de Casa IA ;
- `suggestions` : les boutons de questions rapides ;
- `niveaux` : la pyramide des compétitions de chaque discipline (à vérifier en début de saison, les noms changent parfois) ;
- `faq` : vos réponses. Exemple :

```js
{ mots: ['tournoi de noel', 'tournoi de noël'], reponse: 'Le tournoi de Noël a lieu le 20 décembre au gymnase…', lien: 'clubhouse' },
```

Dès qu'une question contient un des mots, Casa IA donne votre réponse.

## 3. Le mode connecté (facultatif, payant à l'usage)

Il ajoute un vrai modèle de langage (Claude, d'Anthropic) qui cherche sur le web les résultats, classements et actualités du sport du monde entier, et cite ses sources. Il ne sert que pour les questions auxquelles le site ne sait pas répondre, et seulement pour les membres connectés.

Coût indicatif : environ 5 à 10 centimes par question (modèle + recherche web). Une limite de 20 questions par membre et par heure est réglée par défaut.

Étapes :

1. Créez un compte sur https://console.anthropic.com, ajoutez un moyen de paiement (Billing) et créez une clé dans « API keys ». Vous pouvez fixer un plafond de dépense mensuel dans « Limits ».
2. Supabase › Edge Functions › Secrets : ajoutez `ANTHROPIC_API_KEY` avec la clé (elle reste secrète, jamais sur le site).
3. Supabase › Edge Functions › « Deploy a new function » › nom `casa-ia` › collez le contenu de `supabase/functions/casa-ia/index.ts` › Deploy. Laissez « Verify JWT » activé.
4. Dans `js/config.js`, remplacez `window.CASA_IA_CONNECTEE = false;` par `window.CASA_IA_CONNECTEE = true;`.

Pour l'arrêter : remettez `false` dans `js/config.js`. Casa IA revient au mode gratuit.

Réglage facultatif : secret `CASA_IA_MAX_HEURE` (nombre de questions par membre et par heure).
