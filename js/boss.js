// ============================================
// LE BOSS : LE ROI FANTÔME 👻👑
// - Il a 500 PV (points de vie) !
// - C'est un fantôme : il traverse les murs
// - Il lance des boules d'ectoplasme
// - Quand il a perdu la moitié de ses PV, il entre en RAGE :
//   il devient rouge, plus rapide, et tire plus souvent
// - Zork le frappe avec l'épée (touche ESPACE)
// ============================================

const boss = {
  actif: false,
  x: 0, y: 0,      // position en pixels
  pv: 500,
  pvMax: 500,
  toucheA: -9999,  // le moment où il a été touché (pour le faire clignoter)
  prochainTir: 0,
  orbes: [],       // les boules d'ectoplasme qu'il lance
};

const DEGATS_EPEE = 10;   // chaque coup d'épée enlève 10 PV
const PORTEE_EPEE = 80;   // l'épée touche si le boss est à moins de 80 pixels
const RECHARGE_EPEE = 350; // il faut attendre 350 ms entre deux coups
let dernierCoup = -9999;

function creerBoss(maintenant) {
  boss.actif = !!niveaux[niveauActuel].boss;
  boss.x = canvas.width / 2;
  boss.y = HAUT + TAILLE * 2.5;
  boss.pv = boss.pvMax;
  boss.orbes = [];
  boss.toucheA = -9999;
  boss.prochainTir = maintenant + 5000;
}

function enRage() {
  return boss.pv < boss.pvMax / 2;
}

function bougerBoss(maintenant, secondes) {
  if (!boss.actif || etat !== "jeu") return;
  const [zx, zy] = positionZork();

  // Il flotte vers Zork (à travers les murs !)
  const vitesse = enRage() ? 75 : 45; // pixels par seconde
  const angle = Math.atan2(zy - boss.y, zx - boss.x);
  boss.x += Math.cos(angle) * vitesse * secondes;
  boss.y += Math.sin(angle) * vitesse * secondes;
  boss.x = Math.max(50, Math.min(canvas.width - 50, boss.x));
  boss.y = Math.max(HAUT + 60, Math.min(canvas.height - 45, boss.y));

  // Il lance des boules d'ectoplasme en éventail
  if (maintenant > boss.prochainTir) {
    const nombre = enRage() ? 5 : 3;
    for (let i = 0; i < nombre; i++) {
      const a = angle + (i - (nombre - 1) / 2) * 0.3;
      boss.orbes.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150 });
    }
    boss.prochainTir = maintenant + (enRage() ? 1600 : 2600);
  }

  // Les boules avancent, et disparaissent quand elles sortent de l'écran
  for (const o of boss.orbes) {
    o.x += o.vx * secondes;
    o.y += o.vy * secondes;
  }
  boss.orbes = boss.orbes.filter(o => o.x > 0 && o.x < canvas.width && o.y > HAUT && o.y < canvas.height);

  // Est-ce que Zork est touché ?
  if (maintenant < invincibleJusqua) return;
  const toucheParBoss = distance(zx, zy, boss.x, boss.y) < 42;
  const orbeQuiTouche = boss.orbes.find(o => distance(zx, zy, o.x, o.y) < 15);
  if (orbeQuiTouche) boss.orbes = boss.orbes.filter(o => o !== orbeQuiTouche);
  if (toucheParBoss || orbeQuiTouche) perdreUneVie(maintenant);
}

// Un coup d'épée !
function coupEpee(maintenant) {
  if (!boss.actif || etat !== "jeu") return;
  if (maintenant - dernierCoup < RECHARGE_EPEE) return;
  dernierCoup = maintenant;
  const [zx, zy] = positionZork();

  // L'épée peut aussi casser les boules d'ectoplasme
  boss.orbes = boss.orbes.filter(o => distance(o.x, o.y, zx, zy) > 50);

  if (distance(zx, zy, boss.x, boss.y) < PORTEE_EPEE) {
    boss.pv = Math.max(0, boss.pv - DEGATS_EPEE);
    boss.toucheA = maintenant;
    // Le boss recule un peu sous le choc
    const a = Math.atan2(boss.y - zy, boss.x - zx);
    boss.x += Math.cos(a) * 25;
    boss.y += Math.sin(a) * 25;
    ajouterTexte("-" + DEGATS_EPEE, boss.x, boss.y - 55, "#ff5050");

    if (boss.pv === 0) {
      explosion(boss.x, boss.y);
      boss.actif = false;
      boss.orbes = [];
      ajouterPoints(5000, boss.x, boss.y);
      etat = "victoire";
      momentEtat = maintenant;
    }
  }
}

// ============================================
// LE DESSIN DU ROI FANTÔME
// ============================================
function dessinerBoss(temps) {
  if (!boss.actif) return;

  // Les boules d'ectoplasme
  for (const o of boss.orbes) {
    lueur(crayon, o.x, o.y, 18, "rgba(120,255,120,0.5)");
    rond(o.x, o.y, 6, "#7aff7a", crayon);
    rond(o.x - 2, o.y - 2, 2, "#e0ffe0", crayon);
  }

  const rage = enRage();
  const touche = temps - boss.toucheA < 120;
  const L = 46; // la moitié de sa largeur

  crayon.save();
  crayon.translate(boss.x, boss.y + Math.sin(temps / 300) * 5);
  if (rage) crayon.translate(Math.sin(temps / 25) * 1.5, 0); // il tremble de rage

  // L'aura qui l'entoure
  lueur(crayon, 0, 0, 100, rage ? "rgba(255,30,30,0.4)" : "rgba(140,40,255,0.4)");

  // Les bras avec des griffes
  for (const cote of [-1, 1]) {
    crayon.save();
    crayon.translate(cote * L * 0.85, 0);
    crayon.rotate(cote * (0.3 + Math.sin(temps / 250 + cote) * 0.25));
    crayon.fillStyle = rage ? "#3a0612" : "#2a0a3a";
    crayon.beginPath();
    crayon.ellipse(cote * 12, 4, 15, 6, 0, 0, Math.PI * 2);
    crayon.fill();
    crayon.fillStyle = "#d8d0e0";
    for (let k = -1; k <= 1; k++) {
      remplirForme(cote * 25, 4 + k * 4, [[0, -1.5], [cote * 10, k * 2], [0, 1.5]], crayon);
    }
    crayon.restore();
  }

  // Le corps : une grande tête ronde et un bas tout déchiré qui bouge
  crayon.beginPath();
  crayon.moveTo(-L, 10);
  crayon.bezierCurveTo(-L, -62, L, -62, L, 10);
  for (let i = 0; i <= 8; i++) {
    const px = L - (i * 2 * L) / 8;
    const py = 42 + (i % 2 ? -14 : 0) + Math.sin(temps / 150 + i) * 6;
    crayon.lineTo(px, py);
  }
  crayon.closePath();
  const corps = crayon.createLinearGradient(0, -50, 0, 45);
  corps.addColorStop(0, rage ? "#6a0a20" : "#3a1050");
  corps.addColorStop(1, rage ? "#100004" : "#0a0010");
  crayon.fillStyle = touche ? "#ffffff" : corps;
  crayon.fill();
  crayon.strokeStyle = rage ? "rgba(255,120,120,0.6)" : "rgba(200,150,255,0.5)";
  crayon.lineWidth = 2;
  crayon.stroke();

  // La couronne cassée
  crayon.fillStyle = "#c9a020";
  remplirForme(0, 0, [[-18, -38], [-18, -52], [-10, -44], [-4, -60], [2, -44], [10, -55], [18, -38]], crayon);
  rond(-4, -46, 2.5, "#e02a3a", crayon);
  rond(9, -44, 2, "#2a8aff", crayon);

  // Les yeux rouges qui brillent
  crayon.shadowColor = "#ff2020";
  crayon.shadowBlur = 18;
  for (const cote of [-1, 1]) {
    crayon.fillStyle = "#ff2a2a";
    remplirForme(0, 0, [[cote * 5, -22], [cote * 25, -31], [cote * 22, -13], [cote * 8, -12]], crayon);
    crayon.fillStyle = "#ffe0a0";
    crayon.beginPath();
    crayon.ellipse(cote * 15, -19, 1.8, 5, 0, 0, Math.PI * 2);
    crayon.fill();
  }
  crayon.shadowBlur = 0;

  // La grande bouche pleine de dents
  const ouverture = 11 + Math.sin(temps / 200) * 4;
  crayon.fillStyle = "#2a0008";
  crayon.beginPath();
  crayon.ellipse(0, 6, 25, ouverture, 0, 0, Math.PI * 2);
  crayon.fill();
  crayon.fillStyle = "#f0e8e0";
  for (let i = 0; i < 7; i++) {
    const px = -21 + i * 7;
    remplirForme(px, 6 - ouverture * 0.75, [[-3, 0], [3, 0], [0, 8]], crayon);
    remplirForme(px + 3.5, 6 + ouverture * 0.75, [[-3, 0], [3, 0], [0, -7]], crayon);
  }

  crayon.restore();
}

// La barre de vie du boss, en haut du terrain
function dessinerBarreBoss() {
  if (!boss.actif) return;
  const largeur = 420;
  const bx = (canvas.width - largeur) / 2;
  const by = HAUT + 10;
  crayon.fillStyle = "rgba(0,0,0,0.75)";
  crayon.fillRect(bx - 6, by - 4, largeur + 12, 34);
  crayon.fillStyle = "#3a0a10";
  crayon.fillRect(bx, by + 12, largeur, 12);
  const g = crayon.createLinearGradient(bx, 0, bx + largeur, 0);
  g.addColorStop(0, "#ff2a2a");
  g.addColorStop(1, enRage() ? "#ff8a1a" : "#c02aff");
  crayon.fillStyle = g;
  crayon.fillRect(bx, by + 12, (largeur * boss.pv) / boss.pvMax, 12);
  crayon.font = "9px 'Press Start 2P'";
  crayon.textAlign = "left";
  crayon.fillStyle = enRage() ? "#ff6060" : "#e0b0ff";
  crayon.fillText(enRage() ? "LE ROI FANTÔME - RAGE !" : "LE ROI FANTÔME", bx, by + 8);
  crayon.textAlign = "right";
  crayon.fillStyle = "white";
  crayon.fillText(boss.pv + " / " + boss.pvMax + " PV", bx + largeur, by + 8);
}
