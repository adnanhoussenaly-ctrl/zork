// ============================================
// LES ENNEMIS
// Ils partent des 4 coins du labyrinthe et chassent Zork.
// Plus le niveau est loin, plus ils sont nombreux, rapides et malins !
// ============================================

let ennemis = [];
const COINS = [[1, 1], [17, 1], [1, 11], [17, 11]];
const DUREE_PEUR = 7000; // la super-perle fait peur aux ennemis pendant 7 secondes
let peurJusqua = 0;

function creerEnnemis() {
  ennemis = [];
  peurJusqua = 0;
  if (niveaux[niveauActuel].boss) return;

  // Niveaux 1-3 : 2 ennemis, niveaux 4-6 : 3 ennemis, niveaux 7-9 : 4 ennemis
  const nombre = Math.min(4, 2 + Math.floor(niveauActuel / 3));
  for (let i = 0; i < nombre; i++) {
    const [x, y] = COINS[i];
    ennemis.push({
      x, y, ancienX: x, ancienY: y,
      departX: x, departY: y,
      dx: 0, dy: 0,
      dernierPas: 0,
      pas: 300,
      mortJusqua: 0,
    });
  }
}

// Le temps entre deux pas : 260 ms au niveau 1, de plus en plus court ensuite
// (au niveau 9, ils sont plus rapides que Zork !)
function vitesseEnnemis() {
  return Math.max(120, 260 - niveauActuel * 17);
}

// Les chances que l'ennemi choisisse le chemin vers Zork (sinon il va au hasard)
function intelligenceEnnemis() {
  return Math.min(0.9, 0.45 + niveauActuel * 0.055);
}

function ontPeur(maintenant) {
  return maintenant < peurJusqua;
}

function remettreEnnemisAuDepart() {
  for (const e of ennemis) {
    e.x = e.ancienX = e.departX;
    e.y = e.ancienY = e.departY;
    e.dx = e.dy = 0;
  }
}

function bougerEnnemis(maintenant) {
  const [zx, zy] = [zork.x, zork.y];
  for (const e of ennemis) {
    if (maintenant < e.mortJusqua) continue;
    e.pas = ontPeur(maintenant) ? vitesseEnnemis() * 1.6 : vitesseEnnemis();
    if (maintenant - e.dernierPas < e.pas) continue;
    e.dernierPas = maintenant;
    e.ancienX = e.x;
    e.ancienY = e.y;
    if (etat !== "jeu") continue;

    // Toutes les directions sans mur
    const possibles = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !estUnMur(e.x + dx, e.y + dy));
    // On évite de faire demi-tour (sauf si c'est un cul-de-sac)
    let choix = possibles.filter(([dx, dy]) => !(dx === -e.dx && dy === -e.dy));
    if (choix.length === 0) choix = possibles;

    let direction;
    if (Math.random() < intelligenceEnnemis()) {
      // On range les choix du plus proche de Zork au plus loin
      choix.sort((a, b) =>
        distance(e.x + a[0], e.y + a[1], zx, zy) - distance(e.x + b[0], e.y + b[1], zx, zy)
      );
      // S'il a peur, il s'enfuit (le plus loin). Sinon, il fonce (le plus proche).
      direction = ontPeur(maintenant) ? choix[choix.length - 1] : choix[0];
    } else {
      direction = choix[Math.floor(Math.random() * choix.length)];
    }

    e.dx = direction[0];
    e.dy = direction[1];
    e.x += e.dx;
    e.y += e.dy;
  }
}

// La position de l'ennemi en pixels (il glisse entre deux cases, comme Zork)
function positionEnnemi(e, maintenant) {
  const p = Math.min((maintenant - e.dernierPas) / e.pas, 1);
  return [
    centreX(e.ancienX + (e.x - e.ancienX) * p),
    centreY(e.ancienY + (e.y - e.ancienY) * p),
  ];
}

function verifierCollisionsEnnemis(maintenant) {
  if (etat !== "jeu") return;
  const [zx, zy] = positionZork();
  for (const e of ennemis) {
    if (maintenant < e.mortJusqua) continue;
    const [ex, ey] = positionEnnemi(e, maintenant);
    if (distance(zx, zy, ex, ey) > 24) continue;

    if (ontPeur(maintenant)) {
      // Miam ! Zork mange l'ennemi. Il revient dans son coin 4 secondes plus tard.
      e.mortJusqua = maintenant + 4000;
      e.x = e.ancienX = e.departX;
      e.y = e.ancienY = e.departY;
      ajouterPoints(200, ex, ey);
    } else {
      perdreUneVie(maintenant);
      return;
    }
  }
}

function dessinerEnnemis(maintenant) {
  const type = niveaux[niveauActuel].ennemi;
  for (const e of ennemis) {
    if (maintenant < e.mortJusqua) continue;
    const [ex, ey] = positionEnnemi(e, maintenant);
    if (ontPeur(maintenant)) {
      // Dans les 2 dernières secondes, il clignote pour prévenir que la peur s'arrête
      const clignote = peurJusqua - maintenant < 2000 && Math.floor(maintenant / 200) % 2 === 0;
      ennemiQuiAPeur(ex, ey, maintenant, clignote);
    } else {
      dessinsEnnemis[type](ex, ey, maintenant, e.dx || 1, e.dy);
    }
  }
}

// ============================================
// LES DESSINS DES ENNEMIS
// ============================================
const c = crayon; // un nom plus court pour dessiner les ennemis

// Des yeux méchants (sourcils en V)
function yeuxMechants(ox, oy, ecart, couleur = "white") {
  for (const cote of [-1, 1]) {
    rond(ox + cote * ecart, oy, 3, couleur, c);
    rond(ox + cote * ecart, oy + 0.5, 1.5, "#000", c);
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(ox + cote * (ecart + 4), oy - 5);
    c.lineTo(ox + cote * (ecart - 3), oy - 2);
    c.stroke();
  }
}

const dessinsEnnemis = {
  // 🦈 Le requin
  requin(cx, cy, temps, dx) {
    c.save();
    c.translate(cx, cy + Math.sin(temps / 150) * 1.5);
    if (dx < 0) c.scale(-1, 1);
    c.fillStyle = "#4a5a70";
    remplirForme(0, 0, [[-10, 0], [-18, -8 + Math.sin(temps / 100) * 2], [-15, 0], [-18, 8 + Math.sin(temps / 100) * 2]], c);
    c.fillStyle = "#7a8aa0";
    c.beginPath();
    c.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#e0e8f0";
    c.beginPath();
    c.ellipse(2, 2, 11, 5, 0, 0, Math.PI);
    c.fill();
    c.fillStyle = "#4a5a70";
    remplirForme(0, 0, [[-5, -6], [1, -17], [5, -6]], c);
    rond(8, -2, 2.5, "white", c);
    rond(8.5, -2, 1.2, "#000", c);
    c.strokeStyle = "#000";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(5, -6);
    c.lineTo(11, -4);
    c.stroke();
    c.fillStyle = "#2a0a0a";
    c.fillRect(4, 2.5, 9, 3);
    c.fillStyle = "white";
    for (let k = 0; k < 4; k++) remplirForme(4.5 + k * 2.2, 2.5, [[0, 0], [2, 0], [1, 2]], c);
    c.restore();
  },

  // 🦇 La chauve-souris
  chauveSouris(cx, cy, temps) {
    const battement = Math.sin(temps / 70);
    c.fillStyle = "#3a1a4a";
    for (const cote of [-1, 1]) {
      c.save();
      c.translate(cx, cy);
      c.scale(cote, 1);
      c.beginPath();
      c.moveTo(4, -2);
      c.lineTo(18, -8 - battement * 6);
      c.lineTo(16, 2);
      c.lineTo(12, -1);
      c.lineTo(9, 4);
      c.lineTo(5, 2);
      c.closePath();
      c.fill();
      c.restore();
    }
    rond(cx, cy, 8, "#4a2a5a", c);
    remplirForme(cx, cy, [[-6, -5], [-4, -12], [-1, -6]], c);
    remplirForme(cx, cy, [[6, -5], [4, -12], [1, -6]], c);
    rond(cx - 3, cy - 1, 2, "#ff2a2a", c);
    rond(cx + 3, cy - 1, 2, "#ff2a2a", c);
    c.fillStyle = "white";
    remplirForme(cx, cy, [[-3, 3], [-1, 3], [-2, 6]], c);
    remplirForme(cx, cy, [[1, 3], [3, 3], [2, 6]], c);
  },

  // 🕷️ L'araignée
  araignee(cx, cy, temps) {
    c.strokeStyle = "#1a1a1a";
    c.lineWidth = 2;
    for (const cote of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const bouge = Math.sin(temps / 80 + i * 1.5) * 2;
        const oy = -5 + i * 3.5;
        c.beginPath();
        c.moveTo(cx, cy + oy * 0.5);
        c.lineTo(cx + cote * 10, cy + oy - 5 + bouge);
        c.lineTo(cx + cote * 15, cy + oy + 4 + bouge);
        c.stroke();
      }
    }
    rond(cx, cy + 3, 8, "#222", c);
    rond(cx, cy - 5, 5.5, "#333", c);
    c.fillStyle = "#c02020";
    remplirForme(cx, cy + 3, [[0, -4], [3, 0], [0, 4], [-3, 0]], c); // la marque rouge
    for (const [ox, oy] of [[-2.5, -6], [2.5, -6], [-1, -8], [1, -8]]) rond(cx + ox, cy + oy, 1.2, "#ff3030", c);
  },

  // 🐍 Le serpent
  serpent(cx, cy, temps, dx, dy) {
    const angle = Math.atan2(dy, dx);
    c.save();
    c.translate(cx, cy);
    c.rotate(angle);
    // Le corps qui ondule, derrière la tête
    for (let i = 5; i >= 1; i--) {
      const px = -i * 4;
      const py = Math.sin(temps / 100 + i) * 4;
      rond(px, py, 5 - i * 0.4, i % 2 ? "#3a9a2a" : "#ffd83a", c);
    }
    c.fillStyle = "#4ab83a";
    c.beginPath();
    c.ellipse(4, 0, 8, 6.5, 0, 0, Math.PI * 2);
    c.fill();
    // La langue
    if (Math.floor(temps / 300) % 2 === 0) {
      c.strokeStyle = "#e02040";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(11, 0);
      c.lineTo(16, 0);
      c.lineTo(19, -2);
      c.moveTo(16, 0);
      c.lineTo(19, 2);
      c.stroke();
    }
    rond(6, -3.5, 2, "#ffd83a", c);
    rond(6, 3.5, 2, "#ffd83a", c);
    c.fillStyle = "#000";
    c.fillRect(5.5, -5, 1, 3);
    c.fillRect(5.5, 2, 1, 3);
    c.restore();
  },

  // ❄️ Le yéti
  yeti(cx, cy, temps) {
    const bouge = Math.sin(temps / 120) * 1.5;
    // La fourrure toute ébouriffée
    c.fillStyle = "#e8f0f8";
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const r = i % 2 ? 13 : 16;
      c.lineTo(cx + Math.cos(a) * r, cy + bouge + Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
    c.fillStyle = "#8aa8c8"; // le visage
    c.beginPath();
    c.ellipse(cx, cy + bouge + 1, 9, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#6a6a7a"; // les cornes
    remplirForme(cx, cy + bouge, [[-9, -9], [-14, -18], [-5, -12]], c);
    remplirForme(cx, cy + bouge, [[9, -9], [14, -18], [5, -12]], c);
    yeuxMechants(cx, cy + bouge - 1, 4, "#ffd83a");
    c.fillStyle = "#2a1a2a";
    c.fillRect(cx - 5, cy + bouge + 4, 10, 4);
    c.fillStyle = "white";
    remplirForme(cx - 5, cy + bouge + 4, [[0, 0], [3, 0], [1.5, 3]], c);
    remplirForme(cx + 2, cy + bouge + 4, [[0, 0], [3, 0], [1.5, 3]], c);
  },

  // 🐻 L'ours en gélatine
  oursGelatine(cx, cy, temps) {
    const saute = Math.abs(Math.sin(temps / 150)) * -3;
    const y = cy + saute;
    c.globalAlpha = 0.85;
    c.fillStyle = "#e8203a";
    rond(cx - 7, y - 11, 4, "#e8203a", c);
    rond(cx + 7, y - 11, 4, "#e8203a", c);
    rond(cx, y - 6, 8, "#e8203a", c);
    c.beginPath();
    c.ellipse(cx, y + 7, 9, 8, 0, 0, Math.PI * 2);
    c.fill();
    rond(cx - 10, y + 4, 3.5, "#e8203a", c);
    rond(cx + 10, y + 4, 3.5, "#e8203a", c);
    c.globalAlpha = 1;
    rond(cx - 4, y - 10, 2, "rgba(255,255,255,0.6)", c);
    yeuxMechants(cx, y - 6, 3.5);
    c.fillStyle = "#6a0010";
    c.fillRect(cx - 3, y - 1, 6, 2);
  },

  // 🤖 Le robot
  robot(cx, cy, temps) {
    c.fillStyle = "#3a3a4a"; // les chenilles
    c.fillRect(cx - 12, cy + 8, 24, 6);
    c.fillStyle = "#8a8aa0";
    c.fillRect(cx - 10, cy - 6, 20, 15);
    c.fillStyle = "#b8b8cc";
    c.fillRect(cx - 10, cy - 6, 20, 3);
    // L'œil rouge qui balaye de gauche à droite
    c.fillStyle = "#1a0a0a";
    c.fillRect(cx - 8, cy - 1, 16, 5);
    const balaye = Math.sin(temps / 200) * 5;
    c.shadowColor = "#ff2020";
    c.shadowBlur = 8;
    rond(cx + balaye, cy + 1.5, 2.5, "#ff3030", c);
    c.shadowBlur = 0;
    // L'antenne qui clignote
    c.strokeStyle = "#8a8aa0";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx, cy - 6);
    c.lineTo(cx, cy - 13);
    c.stroke();
    rond(cx, cy - 14, 2.5, Math.floor(temps / 250) % 2 ? "#ff3030" : "#ffd83a", c);
  },

  // 👾 L'alien cyclope
  alien(cx, cy, temps) {
    // Les tentacules
    c.strokeStyle = "#7a2ab8";
    c.lineWidth = 3;
    c.lineCap = "round";
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(cx + i * 4, cy + 4);
      c.quadraticCurveTo(cx + i * 5 + Math.sin(temps / 100 + i) * 4, cy + 10, cx + i * 5, cy + 15);
      c.stroke();
    }
    c.lineCap = "butt";
    c.fillStyle = "#9a3ad8";
    c.beginPath();
    c.arc(cx, cy, 12, Math.PI, 0);
    c.lineTo(cx + 12, cy + 6);
    c.lineTo(cx - 12, cy + 6);
    c.fill();
    // Le gros œil unique
    rond(cx, cy - 3, 6, "white", c);
    rond(cx, cy - 3, 3, "#20c040", c);
    rond(cx, cy - 3, 1.5, "#000", c);
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 7, cy - 11);
    c.lineTo(cx, cy - 8);
    c.lineTo(cx + 7, cy - 11);
    c.stroke();
  },

  // 🔥 La boule de feu
  bouleDeFeu(cx, cy, temps) {
    lueur(c, cx, cy, 26, "rgba(255,120,20,0.45)");
    const flamme = (rayon, couleur, decal) => {
      c.fillStyle = couleur;
      c.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        let r = rayon + Math.sin(temps / 60 + i * 2 + decal) * 2;
        if (a > Math.PI * 1.2 && a < Math.PI * 1.8) r += 5; // les flammes montent
        c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
    };
    flamme(13, "#e02a0a", 0);
    flamme(10, "#ff8a1a", 1);
    flamme(6, "#ffe04a", 2);
    yeuxMechants(cx, cy, 4, "#fff8d0");
  },
};

// Quand ils ont peur : tout bleus et tremblants (ou blancs quand ils clignotent)
function ennemiQuiAPeur(cx, cy, temps, clignote) {
  const tremble = Math.sin(temps / 30) * 1.5;
  const x = cx + tremble;
  c.fillStyle = clignote ? "#f0f0ff" : "#2a3aff";
  c.beginPath();
  c.arc(x, cy - 2, 12, Math.PI, 0);
  c.lineTo(x + 12, cy + 11);
  for (let i = 0; i < 4; i++) {
    c.lineTo(x + 12 - i * 6 - 3, cy + 7);
    c.lineTo(x + 12 - i * 6 - 6, cy + 11);
  }
  c.closePath();
  c.fill();
  const couleurVisage = clignote ? "#ff3030" : "#ffd0d0";
  rond(x - 4, cy - 3, 2, couleurVisage, c);
  rond(x + 4, cy - 3, 2, couleurVisage, c);
  c.strokeStyle = couleurVisage;
  c.lineWidth = 1.5;
  c.beginPath();
  for (let i = 0; i <= 4; i++) c.lineTo(x - 6 + i * 3, cy + 4 + (i % 2 ? -2 : 0));
  c.stroke();
}
