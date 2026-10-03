# 👽 Zork, le voyage vers les étoiles

Un jeu inspiré de Pac-Man, fait par un jeune programmeur de 12 ans (avec l'aide de Claude) !

Zork, un petit fantôme gélatine vert, traverse **10 mondes** en mangeant tout sur son passage, en fuyant les ennemis… jusqu'au combat final contre **le Roi Fantôme** 👑👻

## 🎮 Comment jouer

| Touche | Action |
|---|---|
| ← ↑ → ↓ | Déplacer Zork |
| Espace | Coup d'épée ⚔️ (contre le boss) |
| N | Code secret : passer au niveau suivant |

- Mange tous les objets pour finir le niveau
- Les **grosses perles** font peur aux ennemis : pendant 7 secondes, Zork peut les manger !
- Tu as **3 vies**

## 🌍 Les 10 mondes

1. 🌊 L'Océan (requins)
2. 🏰 Le Château Médiéval (chauves-souris)
3. 📻 Le Salon Vintage (araignées)
4. 🌴 La Jungle (serpents)
5. ❄️ La Banquise (yétis)
6. 🍭 Le Pays des Bonbons (oursons en gélatine)
7. 🌃 La Ville la nuit (robots)
8. 🚀 L'Espace (aliens)
9. 🌋 Le Volcan (boules de feu)
10. 👻 Le Manoir Hanté : **le Roi Fantôme, 500 PV !**

## 📁 Le code

| Fichier | Ce qu'il fait |
|---|---|
| `js/niveaux.js` | Les 10 labyrinthes |
| `js/outils.js` | Les réglages et les outils de dessin |
| `js/themes.js` | Le dessin des 10 mondes |
| `js/personnage.js` | Zork et son épée |
| `js/ennemis.js` | Les ennemis et leur intelligence |
| `js/boss.js` | Le Roi Fantôme |
| `js/jeu.js` | Les règles et la boucle du jeu |

Le jeu est fait en HTML et JavaScript, sans aucune bibliothèque : tout est dessiné avec le `canvas`.
