// ============================================
// LE JEU : l'état du jeu, les touches, les règles et la boucle
// ============================================

const zork = {
  x: 0, y: 0,               // case actuelle
  ancienX: 0, ancienY: 0,   // case d'avant (pour glisser en douceur)
  departX: 0, departY: 0,   // case de départ du niveau
  dx: 0, dy: 0,             // direction actuelle
  voulueDx: 0, voulueDy: 0, // direction demandée par le joueur
  regardX: 1, regardY: 0,   // où Zork regarde
};

let grille = [];
let niveauActuel = 0;
let score = 0;
let scoreDebutNiveau = 0;
let vies = 3;
let invincibleJusqua = 0;
let progressionZork = 0;

// "debut"    = on affiche le nom du niveau
// "jeu"      = on joue
// "aie"      = Zork vient de perdre une vie
// "fini"     = niveau terminé, on attend avant le suivant
// "gameover" = plus de vies
// "victoire" = le Roi Fantôme est vaincu !
let etat = "debut";
let momentEtat = 0;

let record = 0;
try { record = Number(localStorage.getItem("zork-record")) || 0; } catch (e) {}

let textes = [];     // les petits textes qui s'envolent (+200, -10...)
let particules = []; // les morceaux de l'explosion du boss

function theme() {
  return themes[niveaux[niveauActuel].theme];
}

function estUnMur(x, y) {
  if (x < 0 || y < 0 || x >= COLONNES || y >= LIGNES) return true;
  return grille[y][x] === "#";
}

function chargerNiveau(numero) {
  const maintenant = performance.now();
  niveauActuel = numero;
  scoreDebutNiveau = score;
  grille = niveaux[numero].carte.map(ligne => ligne.split(""));

  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (grille[y][x] === "Z") {
        zork.departX = x;
        zork.departY = y;
        grille[y][x] = " ";
      }
    }
  }
  remettreZorkAuDepart();
  textes = [];
  particules = [];
  invincibleJusqua = 0;

  creerEnnemis();
  creerBoss(maintenant);

  etat = "debut";
  momentEtat = maintenant;
  dessinerDecor();
}

function remettreZorkAuDepart() {
  zork.x = zork.ancienX = zork.departX;
  zork.y = zork.ancienY = zork.departY;
  zork.dx = zork.dy = zork.voulueDx = zork.voulueDy = 0;
  zork.regardX = 1;
  zork.regardY = 0;
}

// Le décor est dessiné une seule fois par niveau sur la feuille cachée
function dessinerDecor() {
  const t = theme();
  d.clearRect(0, 0, decor.width, decor.height);
  t.fond();
  t.murs();
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (!estUnMur(x, y)) continue;
      const auBord = x === 0 || y === 0 || x === COLONNES - 1 || y === LIGNES - 1;
      t.deco(centreX(x), centreY(y), hasard(x, y, 7), auBord);
    }
  }
  if (t.apres) t.apres();
}

// ============================================
// LES TOUCHES DU CLAVIER
// ============================================
document.addEventListener("keydown", (evenement) => {
  const touche = evenement.key;
  if (touche === "ArrowLeft")  { zork.voulueDx = -1; zork.voulueDy = 0; }
  if (touche === "ArrowRight") { zork.voulueDx = 1;  zork.voulueDy = 0; }
  if (touche === "ArrowUp")    { zork.voulueDx = 0;  zork.voulueDy = -1; }
  if (touche === "ArrowDown")  { zork.voulueDx = 0;  zork.voulueDy = 1; }
  if (touche.startsWith("Arrow") || touche === " ") evenement.preventDefault();

  if (touche === " ") {
    if (etat === "victoire") {
      // On recommence tout le jeu
      score = 0;
      vies = 3;
      chargerNiveau(0);
    } else if (etat === "gameover") {
      // On réessaye le même niveau
      score = scoreDebutNiveau;
      vies = 3;
      chargerNiveau(niveauActuel);
    } else {
      coupEpee(performance.now()); // ⚔️
    }
  }

  // Code secret pour tester : la touche N passe au niveau suivant
  if (touche === "n" || touche === "N") {
    chargerNiveau((niveauActuel + 1) % niveaux.length);
  }
});

// ============================================
// FAIRE BOUGER ZORK (une case à la fois)
// ============================================
function deplacer(maintenant) {
  zork.ancienX = zork.x;
  zork.ancienY = zork.y;
  if (etat !== "jeu") return;

  if (!estUnMur(zork.x + zork.voulueDx, zork.y + zork.voulueDy)) {
    zork.dx = zork.voulueDx;
    zork.dy = zork.voulueDy;
  }

  if (!estUnMur(zork.x + zork.dx, zork.y + zork.dy)) {
    zork.x += zork.dx;
    zork.y += zork.dy;
  }

  if (zork.dx !== 0 || zork.dy !== 0) {
    zork.regardX = zork.dx;
    zork.regardY = zork.dy;
  }

  const caseZork = grille[zork.y][zork.x];
  if (caseZork === ".") {
    // Miam !
    grille[zork.y][zork.x] = " ";
    ajouterPoints(10);
  } else if (caseZork === "o") {
    // SUPER-PERLE : les ennemis ont peur !
    grille[zork.y][zork.x] = " ";
    ajouterPoints(50);
    peurJusqua = maintenant + DUREE_PEUR;
  }

  // Plus rien à manger ? Niveau terminé ! (sauf au niveau du boss : il faut le vaincre)
  const resteAManger = grille.some(ligne => ligne.includes(".") || ligne.includes("o"));
  if (!resteAManger && !niveaux[niveauActuel].boss) {
    etat = "fini";
    momentEtat = maintenant;
  }
}

// La position de Zork en pixels (il glisse entre deux cases)
function positionZork() {
  return [
    centreX(zork.ancienX + (zork.x - zork.ancienX) * progressionZork),
    centreY(zork.ancienY + (zork.y - zork.ancienY) * progressionZork),
  ];
}

function perdreUneVie(maintenant) {
  vies--;
  peurJusqua = 0;
  if (vies <= 0) {
    etat = "gameover";
    momentEtat = maintenant;
    return;
  }
  if (boss.actif) {
    // Contre le boss, on ne recommence pas au départ :
    // Zork clignote et ne peut pas être touché pendant 2 secondes
    invincibleJusqua = maintenant + 2000;
    const [zx, zy] = positionZork();
    ajouterTexte("AÏE !", zx, zy - 25, "#ff5050");
    return;
  }
  etat = "aie";
  momentEtat = maintenant;
}

function ajouterPoints(points, x, y) {
  score += points;
  if (score > record) {
    record = score;
    try { localStorage.setItem("zork-record", record); } catch (e) {}
  }
  if (x !== undefined) ajouterTexte("+" + points, x, y - 20, "#ffe14a");
}

function ajouterTexte(texte, x, y, couleur) {
  textes.push({ texte, x, y, couleur, debut: performance.now() });
}

function explosion(x, y) {
  const couleurs = ["#c02aff", "#ff2a2a", "#ffe14a", "#ffffff", "#7aff7a"];
  for (let i = 0; i < 120; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 60 + Math.random() * 260;
    particules.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      couleur: couleurs[i % couleurs.length],
      taille: 2 + Math.random() * 4,
      debut: performance.now(),
    });
  }
}

// ============================================
// DESSINER LE JEU (plusieurs fois par seconde)
// ============================================
function dessiner(maintenant, secondes) {
  crayon.drawImage(decor, 0, 0);

  // Les objets à manger
  const t = theme();
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      const caseGrille = grille[y][x];
      if (caseGrille !== "." && caseGrille !== "o") continue;
      const brille = Math.sin(maintenant / 300 + x + y * 2);
      const px = centreX(x);
      const py = centreY(y);
      if (caseGrille === "o") {
        // La super-perle : le même objet, mais en GROS et qui palpite
        const taille = 1.9 + Math.sin(maintenant / 150) * 0.3;
        lueur(crayon, px, py, 22, "rgba(255,255,255,0.35)");
        crayon.save();
        crayon.translate(px, py);
        crayon.scale(taille, taille);
        crayon.translate(-px, -py);
        t.objet(px, py, maintenant, brille, x, y);
        crayon.restore();
      } else {
        t.objet(px, py, maintenant, brille, x, y);
      }
    }
  }

  dessinerEnnemis(maintenant);
  dessinerBoss(maintenant);
  dessinerZork(maintenant);
  dessinerParticules(maintenant, secondes);
  dessinerTextes(maintenant);
  dessinerBarreBoss();
  dessinerBandeau();

  // Les messages au milieu de l'écran
  if (etat === "debut") {
    if (niveaux[niveauActuel].boss) {
      message("NIVEAU " + (niveauActuel + 1), niveaux[niveauActuel].nom, "Tu as reçu l'ÉPÉE ! ESPACE pour frapper");
    } else {
      message("NIVEAU " + (niveauActuel + 1), niveaux[niveauActuel].nom);
    }
  } else if (etat === "aie") {
    message("AÏE !", "Il te reste " + vies + (vies > 1 ? " vies" : " vie"));
  } else if (etat === "fini") {
    message("BRAVO !", "Niveau terminé");
  } else if (etat === "gameover") {
    message("GAME OVER", "Appuie sur ESPACE pour réessayer");
  } else if (etat === "victoire" && maintenant - momentEtat > 1500) {
    message("VICTOIRE !", "Tu as vaincu le Roi Fantôme !", "Score : " + score + " - ESPACE pour rejouer");
  }
}

function message(grand, petit, encore) {
  crayon.fillStyle = "rgba(0, 0, 30, 0.65)";
  crayon.fillRect(0, HAUT, canvas.width, canvas.height - HAUT);
  crayon.textAlign = "center";
  crayon.fillStyle = "#ffe14a";
  crayon.font = "28px 'Press Start 2P'";
  crayon.fillText(grand, canvas.width / 2, canvas.height / 2 + 10);
  crayon.fillStyle = "white";
  crayon.font = "13px 'Press Start 2P'";
  crayon.fillText(petit, canvas.width / 2, canvas.height / 2 + 50);
  if (encore) {
    crayon.fillStyle = "#9fd8ff";
    crayon.font = "10px 'Press Start 2P'";
    crayon.fillText(encore, canvas.width / 2, canvas.height / 2 + 85);
  }
}

function dessinerZork(maintenant) {
  // Quand il est invincible, Zork clignote
  if (maintenant < invincibleJusqua && Math.floor(maintenant / 100) % 2 === 0) return;

  const [cx, baseY] = positionZork();
  const flotte = Math.sin(maintenant / 200) * 2; // Zork flotte un peu
  const cy = baseY + flotte;

  // Son ombre
  crayon.fillStyle = "rgba(0,0,40,0.4)";
  crayon.beginPath();
  crayon.ellipse(cx, baseY + 16, 12 - flotte, 4, 0, 0, Math.PI * 2);
  crayon.fill();

  // La bouche s'ouvre et se ferme quand il avance
  const avance = zork.x !== zork.ancienX || zork.y !== zork.ancienY;
  const bouche = avance ? 1.5 + Math.abs(Math.sin(progressionZork * Math.PI)) * 3 : 3;

  dessinerPersonnage(cx, cy, 1, maintenant, zork.regardX, zork.regardY, bouche);

  // L'épée, seulement dans le niveau du boss
  if (niveaux[niveauActuel].boss) {
    const temps = maintenant - dernierCoup;
    const avancement = temps < DUREE_COUP ? temps / DUREE_COUP : -1;
    dessinerEpee(cx, cy, zork.regardX, zork.regardY, avancement);
  }
}

function dessinerTextes(maintenant) {
  textes = textes.filter(t => maintenant - t.debut < 900);
  crayon.font = "12px 'Press Start 2P'";
  crayon.textAlign = "center";
  for (const t of textes) {
    const age = (maintenant - t.debut) / 900;
    crayon.globalAlpha = 1 - age;
    crayon.fillStyle = "#000";
    crayon.fillText(t.texte, t.x + 2, t.y - age * 30 + 2);
    crayon.fillStyle = t.couleur;
    crayon.fillText(t.texte, t.x, t.y - age * 30);
  }
  crayon.globalAlpha = 1;
}

function dessinerParticules(maintenant, secondes) {
  particules = particules.filter(p => maintenant - p.debut < 1800);
  for (const p of particules) {
    p.x += p.vx * secondes;
    p.y += p.vy * secondes;
    p.vx *= 0.98;
    p.vy *= 0.98;
    crayon.globalAlpha = 1 - (maintenant - p.debut) / 1800;
    crayon.fillStyle = p.couleur;
    crayon.fillRect(p.x, p.y, p.taille, p.taille);
  }
  crayon.globalAlpha = 1;
}

function dessinerBandeau() {
  crayon.fillStyle = "#000814";
  crayon.fillRect(0, 0, canvas.width, HAUT);

  // Le parchemin avec le titre
  const mx = canvas.width / 2;
  crayon.fillStyle = "#b8a440";
  crayon.fillRect(mx - 120, 14, 20, 36);
  crayon.fillRect(mx + 100, 14, 20, 36);
  crayon.fillStyle = "#f0e08a";
  crayon.fillRect(mx - 105, 8, 210, 44);
  crayon.fillStyle = "#d8c460";
  crayon.beginPath();
  crayon.arc(mx - 105, 30, 10, 0, Math.PI * 2);
  crayon.arc(mx + 105, 30, 10, 0, Math.PI * 2);
  crayon.fill();
  crayon.fillStyle = "#3a2a08";
  crayon.font = "20px 'Press Start 2P'";
  crayon.textAlign = "center";
  crayon.fillText("ZORK", mx, 41);

  // Le nom du niveau sous le parchemin
  crayon.font = "9px 'Press Start 2P'";
  crayon.fillStyle = "#ffe14a";
  crayon.fillText("NIVEAU " + (niveauActuel + 1) + " : " + niveaux[niveauActuel].nom, mx, 72);

  // Le meilleur score à gauche
  crayon.font = "10px 'Press Start 2P'";
  crayon.textAlign = "left";
  crayon.fillStyle = "#9fd8ff";
  crayon.fillText("MEILLEUR", 20, 28);
  crayon.fillStyle = "white";
  crayon.fillText(String(record).padStart(6, "0"), 20, 50);

  // Le score du joueur à droite
  crayon.textAlign = "right";
  crayon.fillStyle = "#9fd8ff";
  crayon.fillText("JOUEUR 1", canvas.width - 20, 28);
  crayon.fillStyle = "white";
  crayon.fillText(String(score).padStart(6, "0"), canvas.width - 20, 50);

  // Les vies : des petits Zork (le même dessin, en plus petit)
  for (let i = 0; i < vies; i++) {
    const vx = canvas.width - 190 + i * 26;
    dessinerPersonnage(vx, 38, 0.65, 0, 0, 0, 3);
  }
}

// ============================================
// LA BOUCLE DU JEU
// ============================================
chargerNiveau(0);
let dernierPas = performance.now();
let derniereImage = performance.now();

function boucle(maintenant) {
  const secondes = Math.min((maintenant - derniereImage) / 1000, 0.05);
  derniereImage = maintenant;

  // Le nom du niveau reste 1,5 seconde (3,5 secondes pour le boss)
  const dureeDebut = niveaux[niveauActuel].boss ? 3500 : 1500;
  if (etat === "debut" && maintenant - momentEtat > dureeDebut) etat = "jeu";
  // Après 2 secondes de "Bravo", on passe au niveau suivant
  if (etat === "fini" && maintenant - momentEtat > 2000) chargerNiveau(niveauActuel + 1);
  // Après "Aïe", tout le monde retourne à sa place et on continue
  if (etat === "aie" && maintenant - momentEtat > 1500) {
    remettreZorkAuDepart();
    remettreEnnemisAuDepart();
    etat = "jeu";
  }

  if (maintenant - dernierPas >= VITESSE) {
    deplacer(maintenant);
    dernierPas = maintenant;
  }
  progressionZork = Math.min((maintenant - dernierPas) / VITESSE, 1);

  bougerEnnemis(maintenant);
  verifierCollisionsEnnemis(maintenant);
  bougerBoss(maintenant, secondes);

  dessiner(maintenant, secondes);
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);
