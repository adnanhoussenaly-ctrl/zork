// ============================================
// LES OUTILS : les réglages et les petites fonctions
// utilisées partout dans le jeu
// ============================================

const TAILLE = 40;   // taille d'une case en pixels
const HAUT = 84;     // hauteur du bandeau en haut (titre, scores)
const VITESSE = 150; // Zork avance d'une case toutes les 150 millisecondes

const COLONNES = niveaux[0].carte[0].length;
const LIGNES = niveaux[0].carte.length;

const canvas = document.getElementById("jeu");
const crayon = canvas.getContext("2d");
canvas.width = COLONNES * TAILLE;
canvas.height = LIGNES * TAILLE + HAUT;

// Le décor est dessiné une seule fois par niveau sur cette feuille cachée
const decor = document.createElement("canvas");
decor.width = canvas.width;
decor.height = canvas.height;
const d = decor.getContext("2d");

// Le centre d'une case, en pixels
function centreX(x) { return x * TAILLE + TAILLE / 2; }
function centreY(y) { return HAUT + y * TAILLE + TAILLE / 2; }

// La distance entre deux points
function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Un "faux hasard" : il donne toujours le même nombre pour la même case.
// Comme ça, les décorations ne changent pas de place.
function hasard(x, y, graine) {
  const n = Math.sin(x * 127.1 + y * 311.7 + graine * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// ============================================
// Outils pour dessiner le décor (sur la feuille cachée "d")
// ============================================

// Dessine toutes les cases de mur d'une couleur.
// rayon : la taille du bloc
// decalY : pour dessiner plus bas (le "devant" du mur, qui donne du relief)
// carre : true = blocs carrés, false = blocs arrondis
function dessinerCoucheMurs(rayon, couleur, decalY = 0, carre = false) {
  d.fillStyle = couleur;
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (!estUnMur(x, y)) continue;
      const cx = centreX(x);
      const cy = centreY(y) + decalY;
      d.beginPath();
      if (carre) d.rect(cx - rayon, cy - rayon, rayon * 2, rayon * 2);
      else d.arc(cx, cy, rayon, 0, Math.PI * 2);
      d.fill();
      if (estUnMur(x + 1, y)) d.fillRect(cx, cy - rayon, TAILLE, rayon * 2);
      if (estUnMur(x, y + 1)) d.fillRect(cx - rayon, cy, rayon * 2, TAILLE);
      if (x === 0) d.fillRect(cx - TAILLE, cy - rayon, TAILLE, rayon * 2);
      if (y === 0) d.fillRect(cx - rayon, cy - TAILLE, rayon * 2, TAILLE);
      if (estUnMur(x + 1, y) && estUnMur(x, y + 1) && estUnMur(x + 1, y + 1)) {
        d.fillRect(cx, cy, TAILLE, TAILLE);
      }
    }
  }
}

// Des murs avec du relief : une ombre, un devant foncé et un dessus clair
const RAYON_MUR = TAILLE * 0.42;
const EPAISSEUR = 7;
function dessinerMursRelief(couleurDevant, couleurDessus, carre) {
  d.save();
  d.globalAlpha = 0.35;
  dessinerCoucheMurs(RAYON_MUR, "#000000", EPAISSEUR + 4, carre);
  d.restore();
  dessinerCoucheMurs(RAYON_MUR, couleurDevant, EPAISSEUR, carre);
  dessinerCoucheMurs(RAYON_MUR, couleurDessus, 0, carre);
}

// Petits points sur le dessus des murs (herbe, sable, sucre...)
function grainsSurMurs(couleur1, couleur2, nombre) {
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (!estUnMur(x, y)) continue;
      for (let i = 0; i < nombre; i++) {
        d.fillStyle = i % 2 ? couleur1 : couleur2;
        d.fillRect(
          centreX(x) + (hasard(x, y, i) - 0.5) * TAILLE * 0.7,
          centreY(y) + (hasard(x, y, i + 10) - 0.5) * TAILLE * 0.7,
          2, 2
        );
      }
    }
  }
}

// Petits points sur le fond
function pointsSurFond(couleurs, nombre, taille) {
  for (let i = 0; i < nombre; i++) {
    d.fillStyle = couleurs[i % couleurs.length];
    d.fillRect(hasard(i, 1, 1) * decor.width, HAUT + hasard(i, 2, 1) * (decor.height - HAUT), taille, taille);
  }
}

// Remplit tout le fond d'une couleur
function fondUni(couleur) {
  d.fillStyle = couleur;
  d.fillRect(0, HAUT, decor.width, decor.height - HAUT);
}

function ombre(cx, cy, largeur) {
  d.fillStyle = "rgba(30,20,0,0.3)";
  d.beginPath();
  d.ellipse(cx, cy, largeur, largeur * 0.35, 0, 0, Math.PI * 2);
  d.fill();
}

function remplirForme(cx, cy, points, ctx = d) {
  ctx.beginPath();
  ctx.moveTo(cx + points[0][0], cy + points[0][1]);
  for (const [px, py] of points) ctx.lineTo(cx + px, cy + py);
  ctx.closePath();
  ctx.fill();
}

function rond(cx, cy, rayon, couleur, ctx = d) {
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
  ctx.fill();
}

// Une lumière ronde qui s'efface sur les bords (lampes, lave, bougies...)
function lueur(ctx, cx, cy, rayon, couleur) {
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, rayon);
  g.addColorStop(0, couleur);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - rayon, cy - rayon, rayon * 2, rayon * 2);
}
