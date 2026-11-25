/*!
 * Casa Besports — Manuels et exemples de l’espace rédaction.
 * Un manuel par outil (« produit ») de la rubrique Rédaction : à quoi il sert, pas à pas, un exemple concret, les bons réflexes.
 * Chacun ne voit que les outils de son rôle (administrateur, chef d’édition, rédacteur, correspondant de club).
 * Les exemples sont fictifs (clubs « US Exemple », « FC Démo »…) et signalés comme tels : rien n’est publié depuis ici.
 * Fiche = { id, nom, onglet, roles, pitch, pour, etapes[], exemple{}, astuces[], aide[] }
 *   exemple.type : 'article' (aperçu d’article) ou 'tableau' (colonnes + lignes) ; exemple.copier : 'article' | 'club' (copie dans un brouillon).
 */
var CasaManuels = (function () {
  'use strict';

  var TOUS = ['admin', 'chef', 'redacteur'];

  var ARTICLE_EXEMPLE = {
    type: 'compte-rendu', sport: 'Football', tag: 'Compte rendu',
    titre: 'US Exemple 2-1 FC Démo : la remontée au courage',
    chapeau: 'Menés à la pause, les Seniors A de l’US Exemple ont renversé le FC Démo en seconde période et signent leur troisième victoire de suite.',
    corps: '## Le match\n\nLe FC Démo ouvre le score sur corner juste avant la pause. Au retour des vestiaires, l’US Exemple presse plus haut et égalise à l’heure de jeu, avant de prendre l’avantage à dix minutes de la fin sur une frappe lointaine.\n\n## Les buteurs\n\n- Léo M. (61e)\n- Hugo B. (80e)\n\n> On n’a rien lâché, c’est la victoire du groupe. — Le coach de l’US Exemple\n\n## Prochain rendez-vous\n\nDéplacement chez l’AS Fictive, dimanche à 15 h.',
    alt: 'Les joueurs de l’US Exemple célèbrent le but de la victoire devant leurs supporters.'
  };

  var CLUB_EXEMPLE = { equipe: 'Seniors A', competition: 'Championnat', journee: '8e journée', lieu: 'dom', adversaire: 'FC Démo', scoreNous: '2', scoreEux: '1',
    buteurs: 'Léo M. (61e)\nHugo B. (80e)', resume: 'Menés à la pause, nos Seniors A ont renversé le match en seconde période grâce à un pressing plus haut.',
    citation: 'On n’a rien lâché, c’est la victoire du groupe.', citationAuteur: 'Le coach des Seniors A', prochain: 'Dimanche 15 h, chez l’AS Fictive' };

  var FICHES = [
    /* ----- rédaction (administrateur, chef d’édition, rédacteur) ----- */
    { id: 'dash', nom: 'Tableau de bord', onglet: 'dash', roles: TOUS,
      pitch: 'Votre point de départ : ce qui attend une action de votre part et l’activité récente de la rédaction.',
      pour: 'Toute l’équipe de rédaction.',
      etapes: ['Ouvrez l’espace rédaction : le tableau de bord s’affiche en premier.', 'Regardez les compteurs en haut (À relire, Corrections, Brouillons, Programmés, Publiés) : un clic sur un compteur ouvre la liste filtrée.', 'La liste du milieu montre « À relire en priorité » (administrateur) ou « Mes articles en cours » (rédacteurs) : cliquez sur un titre pour l’ouvrir.', 'Le bloc « Activité récente » dit qui a fait quoi, et quand.'],
      exemple: { type: 'tableau', titre: 'Exemple : un lundi matin', colonnes: ['Compteur', 'Chiffre', 'Ce que vous faites'],
        lignes: [['À relire', '2', 'L’administrateur ouvre les deux articles et décide.'], ['Corrections', '1', 'Le rédacteur lit la note et corrige son article.'], ['Brouillons', '4', 'Chacun reprend ses brouillons quand il le souhaite.'], ['Programmés', '1', 'Rien à faire : l’article sortira à l’heure prévue.']] },
      astuces: ['Commencez toujours par « Corrections » : un article en attente de vos corrections bloque sa publication.'],
      aide: ['prise-en-main'] },

    { id: 'list', nom: 'Articles : écrire un article', onglet: 'list', roles: TOUS,
      pitch: 'L’éditeur pour écrire, mettre en forme, contrôler et soumettre un article.',
      pour: 'Toute l’équipe de rédaction. Le rédacteur soumet, l’administrateur publie.',
      etapes: ['Cliquez sur « Nouvel article » (en bas du menu de gauche).', 'Remplissez le titre (80 caractères au plus), le chapeau (2 ou 3 phrases qui résument), la discipline et la rubrique.', 'Écrivez le texte. Les boutons Intertitre, Citation, Liste et Gras ajoutent la mise en forme ; vous pouvez aussi coller depuis un traitement de texte.', 'Choisissez une image dans la médiathèque et décrivez-la en une phrase (texte alternatif).', 'Liez au moins un club : l’article remontera sur sa page.', 'Regardez le score qualité à droite : visez 75/100 ou plus. Les outils IA proposent un titre, un chapeau, une relecture et le référencement.', 'Passez en « Aperçu » pour voir l’article comme le lecteur, puis cliquez sur « Soumettre à la relecture ».'],
      exemple: { type: 'article', titre: 'Exemple : un compte rendu de match', article: ARTICLE_EXEMPLE, copier: 'article' },
      astuces: ['Un intertitre tous les 3 ou 4 paragraphes rend la lecture facile sur téléphone.', 'Pour un mineur : prénom et initiale du nom seulement.', '« Enregistrer le brouillon » garde votre travail ; rien ne part tant que vous n’avez pas soumis.'],
      aide: ['workflow', 'collage', 'versions', 'recherche'] },

    { id: 'queue', nom: 'Relecture', onglet: 'queue', roles: TOUS,
      pitch: 'La file des articles soumis. L’administrateur relit et décide ; les rédacteurs y suivent leurs articles en attente.',
      pour: 'Administrateur (décision) ; rédacteurs et chef d’édition (suivi).',
      etapes: ['Ouvrez « Relecture » : chaque article indique son auteur, son nombre de mots et son score qualité.', 'Cliquez sur « Relire » : l’article s’ouvre en aperçu, avec ses contrôles à droite.', 'L’administrateur choisit : « Approuver et publier », « Approuver et programmer » (date et heure), « Demander des corrections » (avec une note) ou « Refuser » (avec le motif).', 'L’auteur voit la décision et la note dans son tableau de bord.'],
      exemple: { type: 'tableau', titre: 'Exemple : trois articles, trois décisions', colonnes: ['Article', 'Score', 'Décision'],
        lignes: [['US Exemple 2-1 FC Démo', '86/100', 'Approuver et publier'], ['Le tournoi de Noël des U11', '58/100', 'Demander des corrections : « Ajoutez l’heure et le lieu. »'], ['Portrait de la trésorière', '91/100', 'Approuver et programmer : samedi 9 h']] },
      astuces: ['Une note de correction précise (« ajoutez l’heure et le lieu ») fait gagner un aller-retour.'],
      aide: ['workflow', 'regles'] },

    { id: 'une', nom: 'La une', onglet: 'une', roles: TOUS,
      pitch: 'L’ordre des articles de l’accueil du site et de l’application.',
      pour: 'Administrateur et chef d’édition.',
      etapes: ['Ouvrez « La une » : six positions, la première est l’ouverture de l’accueil.', 'Cherchez un article en ligne dans la barre de recherche.', 'Choisissez la position, puis « Positionner et ajouter » (les suivants descendent) ou « Positionner et remplacer ».', 'Les flèches montent ou descendent un article ; l’épingle le bloque à sa place ; la croix le retire de la une.'],
      exemple: { type: 'tableau', titre: 'Exemple : une une du dimanche soir', colonnes: ['Position', 'Article', 'Épinglé'],
        lignes: [['1 · Ouverture', 'US Exemple 2-1 FC Démo', 'Non'], ['2', 'Les résultats du week-end', 'Non'], ['3', 'Le tournoi de Noël des U11', 'Oui (jusqu’au tournoi)'], ['4', 'Portrait de la trésorière', 'Non'], ['5', 'Natation : le meeting de décembre', 'Non'], ['6', 'Le club cherche des bénévoles', 'Non']] },
      astuces: ['Seul un article en ligne peut aller à la une.', 'Depuis un article publié, « Mettre en ouverture de la une » le place directement en position 1.'],
      aide: ['une'] },

    { id: 'prod', nom: 'Éditions · Gazette', onglet: 'prod', roles: TOUS,
      pitch: 'Fabriquer la Gazette : titres, éditions, chemin de fer, pages et suivi de production.',
      pour: 'Administrateur et chef d’édition ; les rédacteurs y voient où leurs articles sont placés.',
      etapes: ['Choisissez le titre (la Gazette) et l’édition du mois, ou « Nouvelle édition ».', '« Chemin de fer » montre toutes les pages en vignettes : cliquez sur une page pour l’ouvrir.', 'Dans « Page », placez un article, une photo, une publicité ou un élément fixe ; « Ajuster les textes » calibre la longueur.', '« Organiser automatiquement » répartit les articles prêts dans les pages libres.', '« Suivi de production » liste ce qui manque (réserves) ; quand tout est prêt, « Boucler l’édition ».'],
      exemple: { type: 'tableau', titre: 'Exemple : le début d’un chemin de fer (31 pages)', colonnes: ['Page', 'Contenu', 'État'],
        lignes: [['1', 'Une : US Exemple 2-1 FC Démo', 'Prête'], ['2-3', 'Les résultats du mois + classement (élément fixe)', 'Prête'], ['4', 'Portrait de la trésorière', 'Texte à ajuster'], ['5', 'Publicité partenaire', 'Réservée'], ['6-7', 'Le tournoi de Noël des U11', 'Photo manquante']] },
      astuces: ['La Gazette compte toujours 31 pages.', 'Une page héritée d’une édition bouclée est verrouillée : « Dissocier pour modifier » la libère.'],
      aide: ['editions', 'gazette-rubriques', 'heritage', 'cartons', 'organisation', 'fixes', 'suivi'] },

    { id: 'media', nom: 'Médiathèque', onglet: 'media', roles: TOUS,
      pitch: 'Les photos et vidéos de la rédaction, avec légende, crédit et droits d’utilisation par canal.',
      pour: 'Toute l’équipe de rédaction.',
      etapes: ['Cliquez sur « Importer » et choisissez vos photos ou vidéos.', 'Ouvrez la fiche du média : écrivez la légende et le crédit (l’auteur de la photo).', 'Réglez les droits canal par canal : site, application, Gazette papier, réseaux sociaux, partenaires. « Libre de droit partout » remplit tout d’un coup si c’est vrai.', 'Recherchez un média par mot (légende, crédit, club) pour le réutiliser.'],
      exemple: { type: 'tableau', titre: 'Exemple : la fiche d’une photo de match', colonnes: ['Champ', 'Valeur'],
        lignes: [['Légende', 'La joie des Seniors A de l’US Exemple après le but de la victoire.'], ['Crédit', 'Photo : Marie D. / US Exemple'], ['Site et application', 'Autorisé avec crédit'], ['Gazette papier', 'Autorisé avec crédit'], ['Réseaux sociaux', 'À vérifier'], ['Partenaires (Fil)', 'Non autorisé']] },
      astuces: ['Une photo « Non autorisé » ou « À vérifier » pour le site bloque la publication : c’est voulu.', 'Pour les mineurs reconnaissables, il faut l’accord écrit des parents.'],
      aide: ['medias', 'afp'] },

    { id: 'fil', nom: 'Le Fil', onglet: 'fil', roles: TOUS,
      pitch: 'Échanger des contenus bruts avec les rédactions partenaires, sans rien publier automatiquement.',
      pour: 'Toute l’équipe de rédaction (réception) ; l’administrateur active les partenaires.',
      etapes: ['« Reçus » liste les contenus envoyés par les partenaires ; « Envoyés » ceux que vous avez partagés.', 'Ouvrez un contenu reçu : « Reprendre en brouillon » le copie dans vos articles pour le relire et l’adapter, « Ignorer » le classe.', 'Pour envoyer un de vos articles : dans l’éditeur, « Envoyer sur le Fil », choisissez le partenaire et ajoutez un mot.'],
      exemple: { type: 'tableau', titre: 'Exemple : la boîte « Reçus »', colonnes: ['Contenu', 'De', 'Action'],
        lignes: [['Le derby de handball en photos', 'Rédaction partenaire A', 'Reprendre en brouillon'], ['Agenda des courses de décembre', 'Rédaction partenaire B', 'Reprendre en brouillon'], ['Communiqué déjà publié chez nous', 'Rédaction partenaire A', 'Ignorer']] },
      astuces: ['Un contenu repris reste un brouillon : il passe par la relecture comme les autres.'],
      aide: ['fil'] },

    { id: 'ia', nom: 'IA de la rédaction', onglet: 'ia', roles: TOUS,
      pitch: 'Les consignes (prompts) de l’assistant d’écriture et le suivi de son utilisation.',
      pour: 'Administrateur (réglages) ; toute l’équipe (utilisation dans l’éditeur).',
      etapes: ['Dans l’éditeur, le panneau de droite propose : Titres, Chapeau, Relecture, Référencement. Cliquez, lisez la proposition, puis « Appliquer » si elle vous convient.', 'Dans l’onglet « IA », « Prompts » montre les consignes par rôle ; l’administrateur peut en ajouter (« Ajouter le prompt »).', '« Suivi de l’utilisation » garde l’historique ; « Fournisseurs » indique le service utilisé.'],
      exemple: { type: 'tableau', titre: 'Exemple : ce que propose l’outil « Titres »', colonnes: ['Proposition', 'Votre choix'],
        lignes: [['US Exemple 2-1 FC Démo : la remontée au courage', 'Appliquer'], ['Football · US Exemple, la seconde période qui change tout', 'Ignorer'], ['Seniors A : troisième victoire de suite', 'Ignorer']] },
      astuces: ['L’IA propose, vous décidez : relisez toujours les noms, les scores et les dates.'],
      aide: ['ia', 'ia-suivi'] },

    { id: 'team', nom: 'Équipe et règles', onglet: 'team', roles: TOUS,
      pitch: 'Qui fait partie de la rédaction, ce que chacun peut faire, et les règles de publication.',
      pour: 'Administrateur (réglages) ; chacun peut consulter.',
      etapes: ['La liste montre chaque membre, son rôle et ses droits.', '« Inviter un rédacteur » envoie une invitation par e-mail.', 'Les règles de publication se règlent par rôle : bloquante, non bloquante (alerte) ou désactivée.'],
      exemple: { type: 'tableau', titre: 'Exemple : réglage d’une règle', colonnes: ['Règle', 'Rédacteur', 'Chef d’édition'],
        lignes: [['Score qualité d’au moins 50/100', 'Bloquante', 'Alerte'], ['Texte alternatif de l’image', 'Alerte', 'Alerte'], ['Photo autorisée sur le site', 'Bloquante', 'Bloquante'], ['Titre de 80 caractères maximum', 'Alerte', 'Alerte']] },
      astuces: ['Avec une règle en « Alerte », le membre peut passer outre ; l’historique de l’article le note.'],
      aide: ['regles', 'roles', 'comptes'] },

    { id: 'reseau', nom: 'Réseau', onglet: 'reseau', roles: ['admin', 'chef'],
      pitch: 'Les mises en relation avec les commerces, l’annuaire, les certifications de CV et les fiches des clubs à valider.',
      pour: 'Administrateur et chef d’édition.',
      etapes: ['« Mises en relation » : une demande arrive (club ou membre vers un commerce). « Valider et transmettre » l’envoie au commerce, « Ne pas transmettre » la classe.', 'Suivez la réponse : « en discussion », « Partenariat conclu » ou « Sans suite » ; la traçabilité garde chaque étape.', '« Annuaire des commerces » se met à jour depuis SIRENE et OpenStreetMap.', '« Certifications » : vérifiez un CV, puis « Certifier », « Demander un complément » ou « Refuser ».', '« Fiches clubs » : les fiches envoyées par les correspondants, à « Valider et mettre en ligne ».'],
      exemple: { type: 'tableau', titre: 'Exemple : le parcours d’une mise en relation', colonnes: ['Étape', 'Ce qui se passe'],
        lignes: [['Demande', 'L’US Exemple veut remercier une boulangerie qui offre le goûter des U9.'], ['Validée et transmise', 'Le commerce reçoit le message de Casa Besports.'], ['En discussion', 'Le commerce a répondu.'], ['Partenariat conclu', 'Le montant et la commission sont enregistrés.']] },
      astuces: ['Ne transmettez jamais un message sans avoir vérifié qui l’envoie.'],
      aide: ['reseau-mr', 'reseau-annuaire', 'reseau-cv', 'carte-hors-connexion'] },

    { id: 'exports', nom: 'Exports', onglet: 'exports', roles: ['admin'],
      pitch: 'Récupérer les données éditoriales (articles, auteurs, canaux) dans un tableur.',
      pour: 'Administrateur.',
      etapes: ['Choisissez les données, le canal et la période.', 'Cliquez sur « Préparer l’export », vérifiez l’aperçu, puis « Télécharger ».', '« Exporter l’année en cours (CSV) » donne tout d’un coup.'],
      exemple: { type: 'tableau', titre: 'Exemple : un export « articles publiés en novembre »', colonnes: ['Titre', 'Auteur', 'Discipline', 'Publié le'],
        lignes: [['US Exemple 2-1 FC Démo', 'Rédacteur A', 'Football', '9 nov.'], ['Le tournoi de Noël des U11', 'Correspondant US Exemple', 'Football', '14 nov.'], ['Natation : le meeting de décembre', 'Rédacteur B', 'Natation', '21 nov.']] },
      astuces: ['Le fichier CSV s’ouvre dans Excel, Numbers ou Google Sheets.'],
      aide: ['exports'] },

    { id: 'crm', nom: 'CRM et agents', onglet: 'crm', roles: ['admin'],
      pitch: 'La relation avec les supporters, les clubs et les partenaires : contacts, pipeline, tâches et agents automatiques.',
      pour: 'Administrateur.',
      etapes: ['« Vue d’ensemble » résume ce qui demande votre attention.', '« Contacts » : chaque personne ou structure, avec son type (club, partenaire, abonné…).', '« Pipeline » : où en est chaque partenariat, étape par étape.', '« Tâches » : vos rappels ; « Agents » : les automatismes, à lancer ou mettre en pause.'],
      exemple: { type: 'tableau', titre: 'Exemple : un partenaire dans le pipeline', colonnes: ['Étape', 'Partenaire', 'Prochaine action'],
        lignes: [['Premier contact', 'Commerce A', 'Envoyer la grille des offres'], ['Proposition', 'Commerce B', 'Relancer vendredi'], ['Signé', 'Commerce C', 'Ajouter son logo sur le site']] },
      astuces: ['Les agents ne tournent que si l’espace rédaction est ouvert ; ils ne publient rien sans validation.'],
      aide: ['crm', 'crm-contacts', 'crm-validations', 'crm-agents'] },

    /* ----- correspondant de club ----- */
    { id: 'club', nom: 'Mon club : raconter la vie du club', onglet: 'club', roles: ['club'],
      pitch: 'Des modèles tout prêts pour envoyer un contenu à la rédaction : compte rendu, annonce, bénévoles, résultats, portrait.',
      pour: 'Correspondants de club.',
      etapes: ['Dans « Mon club », choisissez un modèle (par exemple « Compte rendu de match »).', 'Remplissez les champs : l’aperçu à droite se construit tout seul, titre compris.', 'Ajoutez une photo dont vous avez les droits, sa description et son crédit, puis cochez l’autorisation.', '« Enregistrer le brouillon » pour finir plus tard, ou « Envoyer à la rédaction ».', 'Suivez la réponse dans « Mes contenus ».'],
      exemple: { type: 'article', titre: 'Exemple : un compte rendu rempli avec le modèle', article: ARTICLE_EXEMPLE, copier: 'club' },
      astuces: ['Vérifiez scores, noms et dates avant l’envoi.', 'Pas d’attaque contre un arbitre ou un adversaire : la passion, oui ; la polémique, non.'],
      aide: ['espace-club'] },

    { id: 'clist', nom: 'Mes contenus', onglet: 'clist', roles: ['club'],
      pitch: 'Tout ce que vous avez écrit, avec la réponse de la rédaction.',
      pour: 'Correspondants de club.',
      etapes: ['Ouvrez « Mes contenus » : chaque contenu affiche son état.', 'Si l’état est « Corrections demandées », ouvrez-le : la note de la rédaction est en haut. Corrigez, puis renvoyez.', 'Un contenu publié peut être partagé sur vos réseaux.'],
      exemple: { type: 'tableau', titre: 'Exemple : les états possibles', colonnes: ['État', 'Ce que ça veut dire'],
        lignes: [['Brouillon', 'Seul vous le voyez ; finissez-le quand vous voulez.'], ['Envoyé à la rédaction', 'En cours de relecture.'], ['Corrections demandées', 'Lisez la note, corrigez et renvoyez.'], ['Publié', 'En ligne sur le site et l’application.'], ['Non retenu', 'La rédaction explique pourquoi dans la note.']] },
      astuces: ['Un brouillon peut être supprimé ; un contenu envoyé, non.'],
      aide: ['espace-club'] },

    { id: 'fiche', nom: 'Fiche du club', onglet: 'fiche', roles: ['club'],
      pitch: 'Les informations publiques du club affichées sur sa page et sur la carte.',
      pour: 'Correspondants de club.',
      etapes: ['Ouvrez « Fiche du club ».', 'Remplissez la présentation, le lieu, les entraînements, les équipes, la licence et les contacts publics.', 'Cliquez sur « Envoyer pour validation » : la rédaction vérifie puis met en ligne.'],
      exemple: { type: 'tableau', titre: 'Exemple : une fiche remplie', colonnes: ['Champ', 'Exemple'],
        lignes: [['Présentation', 'Club familial fondé par des bénévoles, de l’école de foot aux seniors.'], ['Stade, salle ou base', 'Stade municipal'], ['Entraînements', 'U9 : mercredi 14 h · Seniors : mardi et jeudi 19 h 30'], ['E-mail public du club', 'contact@us-exemple.fr']] },
      astuces: ['N’indiquez que des coordonnées publiques du club, jamais un numéro personnel sans accord.'],
      aide: ['espace-club', 'carte-hors-connexion'] },

    /* ----- pour tous ----- */
    { id: 'lineup', nom: 'Casa Line Up · compositions', onglet: 'lineup', roles: ['admin', 'chef', 'redacteur', 'club'],
      pitch: 'Créer une composition d’équipe sur un terrain tactique, puis la partager ou l’exporter en image.',
      pour: 'Toute l’équipe et les correspondants de club.',
      etapes: ['Cliquez sur « Casa Line Up · compositions » (menu de gauche).', 'Choisissez la discipline et le dispositif, puis placez les joueurs sur le terrain.', 'Ajoutez les remplaçants, le capitaine et le nom de l’équipe ; un champ laissé vide reste vide.', 'Réglez la confidentialité (privée, club, rédaction, publique).', 'Exportez (PNG, JPG, PDF) ou envoyez la composition à la rédaction.'],
      exemple: { type: 'tableau', titre: 'Exemple : la compo des Seniors A de l’US Exemple', colonnes: ['Ligne', 'Joueurs'],
        lignes: [['Dispositif', '4-3-3, format story 9:16'], ['Gardien', 'Tom R.'], ['Défense', 'Noé L. · Sam P. · Yanis K. (C) · Max D.'], ['Milieu', 'Léo M. · Enzo F. · Lucas G.'], ['Attaque', 'Hugo B. · Adam S. · Nathan V.'], ['Remplaçants', 'Jules A. · Ilyes T. · Paul C.']] },
      astuces: ['Pour les jeunes, prénom et initiale du nom seulement.'],
      aide: [] },

    { id: 'partage', nom: 'Partager sur mes réseaux', onglet: 'list', ongletClub: 'clist', roles: ['admin', 'chef', 'redacteur', 'club'],
      pitch: 'Préparer le partage d’un article publié : image d’aperçu, texte proposé, accès gratuit ou abonnés.',
      pour: 'Toute l’équipe et les correspondants, pour leurs propres articles.',
      etapes: ['Ouvrez un article publié (liste « Articles » ou « Mes contenus »), puis « Partager sur mes réseaux ».', 'Choisissez l’image d’aperçu (ou « Ma photo ») et, si vous voulez, le bandeau BE+.', 'Choisissez l’accès : gratuit, ou réservé aux abonnés.', 'Relisez le texte proposé, puis cliquez sur le réseau : Facebook, X, LinkedIn, WhatsApp… ou copiez le lien.'],
      exemple: { type: 'tableau', titre: 'Exemple : le partage d’un compte rendu', colonnes: ['Élément', 'Exemple'],
        lignes: [['Image', 'La photo de la célébration, avec le bandeau BE+'], ['Accès', 'Gratuit'], ['Texte', '⚽ US Exemple 2-1 FC Démo : la remontée au courage. Le récit du match sur BE+ 👇'], ['Lien', 'Le lien de l’article, suivi par Casa Besports']] },
      astuces: ['Seul un article en ligne peut être partagé : avant, le bouton s’appelle « Préparer le partage ».'],
      aide: [] }
  ];

  function roleKey(c) { return c.clubRole ? 'club' : c.isAdmin ? 'admin' : c.staffRole === 'collaborateur' ? 'chef' : 'redacteur'; }

  function blocs(body) {
    return String(body || '').split(/\n{2,}/).map(function (b) {
      b = b.trim();
      if (/^##\s/.test(b)) return { isH: true, t: b.replace(/^##\s+/, '') };
      if (/^>\s?/.test(b)) return { isQ: true, t: b.replace(/^>\s?/, '') };
      if (/^-\s/.test(b)) return { isL: true, items: b.split('\n').map(function (l) { return { t: l.replace(/^-\s+/, '') }; }) };
      return { isP: true, t: b };
    }).filter(function (x) { return x.t || x.items; });
  }

  /* c = { isAdmin, staffRole, clubRole, tab, go(tab), lineup(), copier(kind, article, clubChamps), aideOpen(id) } */
  function vals(self, c) {
    var s = self.state, rk = roleKey(c);
    var liste = FICHES.filter(function (f) { return f.roles.indexOf(rk) >= 0; });
    var cur = liste.find(function (f) { return f.id === s.manId; }) || null;
    var AIDE = (typeof window !== 'undefined' && window.CASA_AIDE) || [];
    var V = {
      intro: rk === 'club' ? 'Chaque outil de votre espace club expliqué pas à pas, avec un exemple. Les exemples sont fictifs : rien n’est envoyé depuis cette page.' : 'Chaque outil de l’espace rédaction expliqué pas à pas, avec un exemple. Les exemples sont fictifs : rien n’est publié depuis cette page.',
      isList: !cur, isFiche: !!cur, n: String(liste.length),
      items: liste.map(function (f, i) { return { num: String(i + 1).padStart(2, '0'), nom: f.nom, pitch: f.pitch, open: function () { self.setState({ manId: f.id }); try { window.scrollTo(0, 0); } catch (e) {} } }; }),
      back: function () { self.setState({ manId: null }); }
    };
    if (cur) {
      var i = liste.indexOf(cur), nxt = liste[i + 1] || null, prv = liste[i - 1] || null;
      var ex = cur.exemple, art = ex.type === 'article' ? ex.article : null;
      var onglet = rk === 'club' && cur.ongletClub ? cur.ongletClub : cur.onglet;
      V.f = {
        nom: cur.nom, pitch: cur.pitch, pour: cur.pour, pos: (i + 1) + ' / ' + liste.length,
        etapes: cur.etapes.map(function (t, k) { return { n: String(k + 1), t: t }; }),
        exTitre: ex.titre, exIsArticle: ex.type === 'article', exIsTable: ex.type === 'tableau',
        art: art ? { tag: art.tag + ' · ' + art.sport, titre: art.titre, chapeau: art.chapeau, blocs: blocs(art.corps), alt: art.alt } : null,
        cols: ex.colonnes ? ex.colonnes.map(function (t) { return { t: t }; }) : [],
        rows: ex.lignes ? ex.lignes.map(function (r) { return { cells: r.map(function (t, k) { return { t: t, k: ex.colonnes.length > 2 ? ex.colonnes[k] : '' }; }) }; }) : [],
        canCopy: !!ex.copier, copyLabel: ex.copier === 'club' ? 'Créer un brouillon à partir de cet exemple' : 'Copier cet exemple dans un nouveau brouillon',
        copy: function () { c.copier(ex.copier, ARTICLE_EXEMPLE, CLUB_EXEMPLE); },
        openLabel: onglet === 'lineup' ? 'Ouvrir Casa Line Up' : 'Ouvrir l’outil « ' + cur.nom.split(' : ')[0] + ' »',
        openTool: function () { self.setState({ manId: null }); if (onglet === 'lineup') c.lineup(); else c.go(onglet); },
        astuces: cur.astuces.map(function (t) { return { t: t }; }), hasAstuces: cur.astuces.length > 0,
        fiches: cur.aide.map(function (id) { return AIDE.find(function (a) { return a.id === id; }); }).filter(Boolean).map(function (a) { return { titre: a.titre, open: function () { c.aideOpen(a.id); } }; }),
        hasNext: !!nxt, nextNom: nxt ? nxt.nom : '', next: function () { if (nxt) self.setState({ manId: nxt.id }); },
        hasPrev: !!prv, prevNom: prv ? prv.nom : '', prev: function () { if (prv) self.setState({ manId: prv.id }); }
      };
      V.f.hasFiches = V.f.fiches.length > 0;
    }
    /* manuel de l’écran affiché (bouton « Manuel » de la barre du haut) */
    var tab = c.tab === 'edit' ? 'list' : c.tab === 'cedit' ? 'club' : c.tab;
    var ici = liste.find(function (f) { return f.onglet === tab; });
    V.ici = { show: tab !== 'guides', open: function () { self.setState({ studioTab: 'guides', manId: ici ? ici.id : null }); } };
    return V;
  }

  return { FICHES: FICHES, vals: vals, ARTICLE_EXEMPLE: ARTICLE_EXEMPLE, CLUB_EXEMPLE: CLUB_EXEMPLE };
})();
if (typeof window !== 'undefined') window.CasaManuels = CasaManuels;
