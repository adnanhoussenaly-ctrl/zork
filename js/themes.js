// ============================================
// LES THÈMES : chaque monde a 4 parties
//   fond()   : le sol
//   murs()   : les murs
//   deco()   : les décorations posées sur les murs
//   objet()  : l'objet que Zork mange
// (et parfois apres() : un effet ajouté à la fin, comme une ombre sur les bords)
// ============================================
const themes = {};

// ---------- 🌊 L'OCÉAN ----------
themes.ocean = {
  fond() {
    const degrade = d.createLinearGradient(0, HAUT, 0, decor.height);
    degrade.addColorStop(0, "#1238a8");
    degrade.addColorStop(1, "#0a1f78");
    fondUni(degrade);
    pointsSurFond(["rgba(255,255,255,0.05)", "rgba(0,0,40,0.15)"], 1800, 2);
    // Les vagues
    d.strokeStyle = "rgba(170,215,255,0.35)";
    d.lineWidth = 2;
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (estUnMur(x, y) || hasard(x, y, 3) > 0.35) continue;
        const vx = centreX(x) + (hasard(x, y, 4) - 0.5) * 16;
        const vy = centreY(y) + (hasard(x, y, 5) - 0.5) * 16;
        d.beginPath();
        d.arc(vx - 4, vy, 4, Math.PI * 1.1, Math.PI * 1.9);
        d.arc(vx + 4, vy, 4, Math.PI * 1.1, Math.PI * 1.9);
        d.stroke();
      }
    }
  },
  murs() {
    // Des îles en 3 couches : eau claire, sable mouillé, sable sec
    dessinerCoucheMurs(TAILLE * 0.64, "#2b8fd0");
    dessinerCoucheMurs(TAILLE * 0.52, "#c79a3c");
    dessinerCoucheMurs(TAILLE * 0.45, "#f3d36e");
    grainsSurMurs("#d8b253", "#fff0a8", 8);
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.18) palmier(cx, cy);
      else if (h < 0.3) coquillage(cx, cy);
    } else {
      if (h < 0.3) palmier(cx, cy);
      else if (h < 0.55) rocher(cx, cy);
      else if (h < 0.7) herbe(cx, cy, "#3a9a35");
      else if (h < 0.82) etoileDeMer(cx, cy);
      else if (h < 0.9) coquillage(cx, cy);
    }
  },
  // Une perle blanche qui scintille
  objet(px, py, temps, brille) {
    rond(px, py, 7 + brille, "rgba(200,230,255,0.25)", crayon);
    rond(px, py, 4, "#f4f4ff", crayon);
    crayon.fillStyle = "white";
    crayon.fillRect(px - 2, py - 2, 2, 2);
  },
};

function palmier(cx, cy) {
  ombre(cx + 6, cy + 10, 13);
  d.strokeStyle = "#7a4a1e";
  d.lineWidth = 5;
  d.beginPath();
  d.moveTo(cx - 2, cy + 10);
  d.quadraticCurveTo(cx + 7, cy - 2, cx + 1, cy - 14);
  d.stroke();
  d.strokeStyle = "#a8743a";
  d.lineWidth = 2;
  d.stroke();
  const hautX = cx + 1;
  const hautY = cy - 14;
  for (const angle of [-2.8, -2.1, -1.4, -0.7, 0, 0.5]) {
    const finX = hautX + Math.cos(angle) * 16;
    const finY = hautY + Math.sin(angle) * 9 + 6;
    d.strokeStyle = "#1f7a2c";
    d.lineWidth = 5;
    d.beginPath();
    d.moveTo(hautX, hautY);
    d.quadraticCurveTo((hautX + finX) / 2, hautY - 8, finX, finY);
    d.stroke();
    d.strokeStyle = "#5fd05a";
    d.lineWidth = 1.5;
    d.stroke();
  }
  rond(hautX - 2, hautY + 3, 2.5, "#5a3a12");
  rond(hautX + 3, hautY + 3, 2.5, "#5a3a12");
}

function rocher(cx, cy) {
  ombre(cx + 3, cy + 8, 13);
  d.fillStyle = "#4a4a58";
  remplirForme(cx, cy, [[-12, 7], [-10, -3], [-4, -11], [5, -10], [12, -1], [11, 7]]);
  d.fillStyle = "#8a8a9c";
  remplirForme(cx, cy, [[-10, 2], [-8, -3], [-3, -9], [4, -8], [6, -2], [-2, 3]]);
  d.fillStyle = "#c4c4d4";
  remplirForme(cx, cy, [[-6, -3], [-3, -7], [1, -7], [-1, -3]]);
}

function herbe(cx, cy, couleur) {
  d.strokeStyle = couleur;
  d.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    d.beginPath();
    d.moveTo(cx + i * 3, cy + 6);
    d.quadraticCurveTo(cx + i * 4, cy - 2, cx + i * 6, cy - 6);
    d.stroke();
  }
}

function etoileDeMer(cx, cy) {
  d.fillStyle = "#ff7a3a";
  d.beginPath();
  for (let i = 0; i < 10; i++) {
    const rayon = i % 2 === 0 ? 8 : 3;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    d.lineTo(cx + Math.cos(angle) * rayon, cy + Math.sin(angle) * rayon);
  }
  d.closePath();
  d.fill();
}

function coquillage(cx, cy) {
  d.fillStyle = "#ffd0e0";
  d.beginPath();
  d.arc(cx, cy, 5, Math.PI, 0);
  d.lineTo(cx, cy + 4);
  d.closePath();
  d.fill();
  d.strokeStyle = "#d08aa0";
  d.lineWidth = 1;
  for (const dx of [-3, 0, 3]) {
    d.beginPath();
    d.moveTo(cx, cy + 3);
    d.lineTo(cx + dx, cy - 4);
    d.stroke();
  }
}

// ---------- 🏰 LE CHÂTEAU MÉDIÉVAL ----------
themes.medieval = {
  fond() {
    fondUni("#12240f");
    pointsSurFond(["#1c3618", "#0a1608", "#2a4a22"], 2500, 2);
    pointsSurFond(["#3a3a3a", "#555"], 120, 3); // petits cailloux
  },
  murs() {
    // Des murailles en pierre avec de la mousse dessus
    dessinerMursRelief("#5a5a68", "#4f8a3a", true);
    pierresDevant("#383844");
    grainsSurMurs("#6aaa4a", "#3a6a2a", 10);
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.15) sapin(cx, cy);
      else if (h < 0.3) buisson(cx, cy);
    } else {
      if (h < 0.22) tour(cx, cy);
      else if (h < 0.42) sapin(cx, cy);
      else if (h < 0.58) buisson(cx, cy);
      else if (h < 0.7) drapeau(cx, cy);
      else if (h < 0.8) herbe(cx, cy, "#7ac85a");
    }
  },
  objet(px, py, temps) {
    pieceOr(px, py, temps);
  },
};

// Une pièce d'or qui tourne
function pieceOr(px, py, temps) {
  const largeur = 4 * Math.abs(Math.cos(temps / 400 + px));
  crayon.fillStyle = "#a0700a";
  crayon.beginPath();
  crayon.ellipse(px, py, largeur + 1, 5, 0, 0, Math.PI * 2);
  crayon.fill();
  crayon.fillStyle = "#ffd23a";
  crayon.beginPath();
  crayon.ellipse(px, py, largeur, 4, 0, 0, Math.PI * 2);
  crayon.fill();
}

// Dessine des lignes de pierres sur le devant des murs
function pierresDevant(couleur) {
  d.strokeStyle = couleur;
  d.lineWidth = 1;
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (!estUnMur(x, y) || estUnMur(x, y + 1)) continue;
      const haut = centreY(y) + RAYON_MUR;
      const gauche = estUnMur(x - 1, y) ? centreX(x) - TAILLE / 2 : centreX(x) - RAYON_MUR;
      const droite = estUnMur(x + 1, y) ? centreX(x) + TAILLE / 2 : centreX(x) + RAYON_MUR;
      d.beginPath();
      d.moveTo(gauche, haut + EPAISSEUR / 2);
      d.lineTo(droite, haut + EPAISSEUR / 2);
      for (let px = gauche + 4; px < droite; px += 8) {
        d.moveTo(px, haut);
        d.lineTo(px, haut + EPAISSEUR / 2);
        d.moveTo(px + 4, haut + EPAISSEUR / 2);
        d.lineTo(px + 4, haut + EPAISSEUR);
      }
      d.stroke();
    }
  }
}

function tour(cx, cy) {
  ombre(cx + 5, cy + 12, 12);
  d.fillStyle = "#6e6e7a";
  d.fillRect(cx - 7, cy - 12, 14, 24);
  d.fillStyle = "#9a9aa8";
  d.fillRect(cx - 7, cy - 12, 5, 24);
  d.strokeStyle = "#4a4a55";
  d.lineWidth = 1;
  for (const ly of [-6, 0, 6]) {
    d.beginPath();
    d.moveTo(cx - 7, cy + ly);
    d.lineTo(cx + 7, cy + ly);
    d.stroke();
  }
  // La porte
  d.fillStyle = "#2a1a10";
  d.beginPath();
  d.arc(cx, cy + 6, 3, Math.PI, 0);
  d.lineTo(cx + 3, cy + 12);
  d.lineTo(cx - 3, cy + 12);
  d.fill();
  // La fenêtre
  d.fillStyle = "#ffcc55";
  d.fillRect(cx - 1, cy - 7, 2, 4);
  // Le toit rouge
  d.fillStyle = "#a02424";
  remplirForme(cx, cy, [[-10, -12], [0, -28], [10, -12]]);
  d.fillStyle = "#d84040";
  remplirForme(cx, cy, [[-10, -12], [0, -28], [-2, -12]]);
}

function sapin(cx, cy) {
  ombre(cx + 4, cy + 11, 11);
  d.fillStyle = "#5a3a1a";
  d.fillRect(cx - 2, cy + 5, 4, 7);
  const etages = [[12, 7, "#1d5a24"], [10, -1, "#257030"], [7, -8, "#2f8a3a"]];
  for (const [largeur, bas, couleur] of etages) {
    d.fillStyle = couleur;
    remplirForme(cx, cy, [[-largeur, bas], [0, bas - 13], [largeur, bas]]);
  }
}

function buisson(cx, cy) {
  ombre(cx + 3, cy + 7, 12);
  rond(cx - 6, cy + 1, 6, "#2a6a2a");
  rond(cx + 6, cy + 1, 6, "#2a6a2a");
  rond(cx, cy - 3, 8, "#3a8a3a");
  rond(cx - 2, cy - 5, 3, "#6ac06a");
  rond(cx + 4, cy - 1, 1.5, "#e03a3a"); // une baie rouge
}

function drapeau(cx, cy) {
  ombre(cx + 2, cy + 10, 6);
  d.strokeStyle = "#5a3a1a";
  d.lineWidth = 2;
  d.beginPath();
  d.moveTo(cx - 4, cy + 10);
  d.lineTo(cx - 4, cy - 14);
  d.stroke();
  d.fillStyle = "#2050c0";
  remplirForme(cx, cy, [[-3, -14], [10, -11], [-3, -6]]);
  d.fillStyle = "#ffd23a";
  d.fillRect(cx, cy - 11, 3, 2);
}

// ---------- 📻 LE SALON VINTAGE ----------
themes.vintage = {
  fond() {
    // Du papier peint à rayures, couleur vieille photo
    for (let px = 0; px < decor.width; px += 20) {
      d.fillStyle = (px / 20) % 2 ? "#e6d3ab" : "#efdfbd";
      d.fillRect(px, HAUT, 20, decor.height - HAUT);
    }
    // Des petites fleurs sur le papier peint
    d.fillStyle = "rgba(150,90,60,0.25)";
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (estUnMur(x, y)) continue;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          rond(centreX(x) + 10 + Math.cos(a) * 3, centreY(y) - 10 + Math.sin(a) * 3, 2, "rgba(150,90,60,0.25)");
        }
      }
    }
  },
  murs() {
    // Des meubles en bois verni
    dessinerMursRelief("#4e2f15", "#8e5a2c", true);
    // Les veines du bois
    d.strokeStyle = "rgba(60,30,10,0.35)";
    d.lineWidth = 1;
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (!estUnMur(x, y)) continue;
        for (let i = 0; i < 3; i++) {
          const ly = centreY(y) - 10 + i * 8 + hasard(x, y, i) * 4;
          d.beginPath();
          d.moveTo(centreX(x) - TAILLE / 2, ly);
          d.quadraticCurveTo(centreX(x), ly + (hasard(x, y, i + 5) - 0.5) * 6, centreX(x) + TAILLE / 2, ly);
          d.stroke();
        }
      }
    }
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.12) horloge(cx, cy);
      else if (h < 0.22) lampe(cx, cy);
    } else {
      if (h < 0.2) gramophone(cx, cy);
      else if (h < 0.38) horloge(cx, cy);
      else if (h < 0.55) disque(cx, cy);
      else if (h < 0.7) lampe(cx, cy);
    }
  },
  apres() {
    vignette("rgba(60,30,10,0.55)");
  },
  // Un bouton doré
  objet(px, py, temps, brille) {
    rond(px, py, 5.5, "#8a6420", crayon);
    rond(px, py, 4.5, "#d8aa48", crayon);
    crayon.fillStyle = "#6a4a18";
    crayon.fillRect(px - 2, py - 2, 1.5, 1.5);
    crayon.fillRect(px + 0.5, py - 2, 1.5, 1.5);
    crayon.fillRect(px - 2, py + 0.5, 1.5, 1.5);
    crayon.fillRect(px + 0.5, py + 0.5, 1.5, 1.5);
    if (brille > 0.8) rond(px - 2, py - 3, 1.5, "white", crayon);
  },
};

// Les bords de l'écran plus sombres, comme une vieille photo
function vignette(couleur) {
  const mx = decor.width / 2;
  const my = HAUT + (decor.height - HAUT) / 2;
  const g = d.createRadialGradient(mx, my, 150, mx, my, decor.width / 1.6);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, couleur);
  fondUni(g);
}

function gramophone(cx, cy) {
  ombre(cx + 3, cy + 11, 12);
  d.fillStyle = "#3a200c";
  d.fillRect(cx - 9, cy + 1, 18, 9);
  d.fillStyle = "#6a3e1a";
  d.fillRect(cx - 9, cy + 1, 18, 3);
  d.strokeStyle = "#b08a3a";
  d.lineWidth = 2;
  d.beginPath();
  d.moveTo(cx + 2, cy + 2);
  d.lineTo(cx + 2, cy - 5);
  d.stroke();
  // Le grand pavillon doré
  d.fillStyle = "#c9962e";
  remplirForme(cx, cy, [[2, -4], [-12, -10], [-2, -19]]);
  d.fillStyle = "#f2d27a";
  d.beginPath();
  d.ellipse(cx - 7, cy - 14.5, 6.7, 3, -0.73, 0, Math.PI * 2);
  d.fill();
  d.fillStyle = "#5a3a12";
  d.beginPath();
  d.ellipse(cx - 7, cy - 14.5, 3.5, 1.5, -0.73, 0, Math.PI * 2);
  d.fill();
}

function horloge(cx, cy) {
  ombre(cx + 3, cy + 11, 9);
  d.fillStyle = "#3a200c";
  d.fillRect(cx - 6, cy + 6, 3, 5);
  d.fillRect(cx + 3, cy + 6, 3, 5);
  rond(cx, cy - 1, 10, "#6a4420");
  rond(cx, cy - 1, 8, "#f4ead0");
  d.strokeStyle = "#2a1a0a";
  d.lineWidth = 1.5;
  d.beginPath();
  d.moveTo(cx, cy - 1); d.lineTo(cx, cy - 7);
  d.moveTo(cx, cy - 1); d.lineTo(cx + 4, cy + 1);
  d.stroke();
  rond(cx, cy - 1, 1.2, "#2a1a0a");
}

function disque(cx, cy) {
  ombre(cx + 2, cy + 7, 11);
  rond(cx, cy, 10, "#151515");
  d.strokeStyle = "#333";
  d.lineWidth = 1;
  for (const r of [8, 6]) {
    d.beginPath();
    d.arc(cx, cy, r, 0, Math.PI * 2);
    d.stroke();
  }
  rond(cx, cy, 3.5, "#c03030");
  rond(cx, cy, 1, "#151515");
}

function lampe(cx, cy) {
  lueur(d, cx, cy - 8, 22, "rgba(255,220,120,0.5)");
  ombre(cx + 2, cy + 11, 7);
  d.fillStyle = "#b08a3a";
  d.fillRect(cx - 1, cy - 6, 2, 16);
  d.beginPath();
  d.ellipse(cx, cy + 10, 6, 2, 0, 0, Math.PI * 2);
  d.fill();
  d.fillStyle = "#f0d8a0";
  remplirForme(cx, cy, [[-5, -16], [5, -16], [9, -5], [-9, -5]]);
  d.fillStyle = "#c8a060";
  d.fillRect(cx - 9, cy - 6, 18, 2);
}

// ---------- 🌴 LA JUNGLE ----------
themes.jungle = {
  fond() {
    fondUni("#1e2a0e");
    pointsSurFond(["#2a3a14", "#141e08", "#3a4a1a"], 2500, 2);
    pointsSurFond(["#5a4020", "#4a3418"], 150, 3); // de la terre
  },
  murs() {
    // Des buissons très épais
    dessinerMursRelief("#1f4a14", "#3f8a26", false);
    // Plein de feuilles
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (!estUnMur(x, y)) continue;
        for (let i = 0; i < 6; i++) {
          d.fillStyle = i % 2 ? "#5ab83a" : "#2a6a1a";
          d.beginPath();
          d.ellipse(
            centreX(x) + (hasard(x, y, i + 40) - 0.5) * 28,
            centreY(y) + (hasard(x, y, i + 50) - 0.5) * 28,
            5, 2.5, hasard(x, y, i + 60) * Math.PI, 0, Math.PI * 2
          );
          d.fill();
        }
      }
    }
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.2) palmier(cx, cy);
      else if (h < 0.3) fleur(cx, cy);
    } else {
      if (h < 0.2) palmier(cx, cy);
      else if (h < 0.35) fleur(cx, cy);
      else if (h < 0.5) champignon(cx, cy);
      else if (h < 0.62) totem(cx, cy);
      else if (h < 0.72) herbe(cx, cy, "#8ae05a");
    }
  },
  // Une banane
  objet(px, py) {
    crayon.strokeStyle = "#ffd83a";
    crayon.lineWidth = 4;
    crayon.lineCap = "round";
    crayon.beginPath();
    crayon.arc(px + 1, py - 4, 7, 0.5, 2.6);
    crayon.stroke();
    crayon.lineCap = "butt";
    rond(px - 5.5, py - 0.5, 1.5, "#5a3a10", crayon);
  },
};

function fleur(cx, cy) {
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    rond(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 4, "#e0304a");
  }
  rond(cx, cy, 3, "#ffd83a");
}

function champignon(cx, cy) {
  ombre(cx + 3, cy + 9, 9);
  d.fillStyle = "#f0e6c8";
  d.fillRect(cx - 3, cy - 2, 6, 10);
  d.fillStyle = "#d02a2a";
  d.beginPath();
  d.arc(cx, cy - 2, 10, Math.PI, 0);
  d.fill();
  rond(cx - 4, cy - 6, 2, "white");
  rond(cx + 4, cy - 5, 1.5, "white");
  rond(cx, cy - 9, 1.5, "white");
}

function totem(cx, cy) {
  ombre(cx + 4, cy + 12, 10);
  for (const [haut, couleur] of [[-16, "#a0602a"], [-2, "#7a4a1e"]]) {
    d.fillStyle = couleur;
    d.fillRect(cx - 7, cy + haut, 14, 14);
    d.fillStyle = "#ffd83a";
    d.fillRect(cx - 5, cy + haut + 3, 3, 3);
    d.fillRect(cx + 2, cy + haut + 3, 3, 3);
    d.fillStyle = "#2a1408";
    d.fillRect(cx - 4, cy + haut + 9, 8, 3);
  }
  d.fillStyle = "#3aa84a"; // des plumes
  remplirForme(cx, cy, [[-9, -16], [-4, -24], [0, -16]]);
  d.fillStyle = "#e0304a";
  remplirForme(cx, cy, [[0, -16], [4, -24], [9, -16]]);
}

// ---------- ❄️ LA BANQUISE ----------
themes.banquise = {
  fond() {
    fondUni("#cfe8f5");
    // Des fissures dans la glace
    d.strokeStyle = "#a8d0e8";
    d.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      let fx = hasard(i, 3, 2) * decor.width;
      let fy = HAUT + hasard(i, 4, 2) * (decor.height - HAUT);
      d.beginPath();
      d.moveTo(fx, fy);
      for (let k = 0; k < 4; k++) {
        fx += (hasard(i, k, 5) - 0.5) * 30;
        fy += (hasard(i, k, 6) - 0.5) * 30;
        d.lineTo(fx, fy);
      }
      d.stroke();
    }
    pointsSurFond(["#ffffff", "#b8dcef"], 600, 2);
  },
  murs() {
    // Des blocs de neige et de glace
    dessinerMursRelief("#6aaed4", "#f6fbff", false);
    grainsSurMurs("#dfeff8", "#ffffff", 6);
    // Des stalactites de glace qui pendent
    d.fillStyle = "#e8f6ff";
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (!estUnMur(x, y) || estUnMur(x, y + 1)) continue;
        const bas = centreY(y) + RAYON_MUR + EPAISSEUR;
        for (const dx of [-8, -1, 6]) {
          const long = 3 + hasard(x, y, dx + 70) * 5;
          remplirForme(centreX(x) + dx, bas - 1, [[-2, 0], [2, 0], [0, long]]);
        }
      }
    }
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.2) sapinNeige(cx, cy);
      else if (h < 0.3) pingouin(cx, cy);
    } else {
      if (h < 0.2) sapinNeige(cx, cy);
      else if (h < 0.35) bonhommeDeNeige(cx, cy);
      else if (h < 0.48) igloo(cx, cy);
      else if (h < 0.6) pingouin(cx, cy);
    }
  },
  // Un flocon de neige qui tourne
  objet(px, py, temps) {
    crayon.save();
    crayon.translate(px, py);
    crayon.rotate(temps / 800);
    crayon.strokeStyle = "#3a8ac8";
    crayon.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      crayon.rotate(Math.PI / 3);
      crayon.beginPath();
      crayon.moveTo(-5, 0);
      crayon.lineTo(5, 0);
      crayon.stroke();
    }
    crayon.strokeStyle = "white";
    crayon.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      crayon.rotate(Math.PI / 3);
      crayon.beginPath();
      crayon.moveTo(-5, 0);
      crayon.lineTo(5, 0);
      crayon.stroke();
    }
    crayon.restore();
  },
};

function sapinNeige(cx, cy) {
  sapin(cx, cy);
  d.fillStyle = "white";
  remplirForme(cx, cy, [[-3, -18], [0, -21], [3, -18]]);
  remplirForme(cx, cy, [[-5, -10], [0, -14], [5, -10]]);
  remplirForme(cx, cy, [[-6, -2], [0, -6], [6, -2]]);
}

function bonhommeDeNeige(cx, cy) {
  ombre(cx + 3, cy + 11, 10);
  rond(cx, cy + 4, 8, "#9ab8cc");
  rond(cx, cy + 4, 7, "white");
  rond(cx, cy - 7, 6, "#9ab8cc");
  rond(cx, cy - 7, 5, "white");
  d.fillStyle = "#e02a3a"; // l'écharpe
  d.fillRect(cx - 5, cy - 3, 10, 2);
  d.fillRect(cx + 2, cy - 3, 2, 6);
  d.fillStyle = "#111";
  d.fillRect(cx - 3, cy - 9, 1.5, 1.5);
  d.fillRect(cx + 1.5, cy - 9, 1.5, 1.5);
  d.fillStyle = "#ff8a1a"; // le nez carotte
  remplirForme(cx, cy, [[0, -7], [5, -6], [0, -5]]);
}

function igloo(cx, cy) {
  ombre(cx + 2, cy + 9, 13);
  d.fillStyle = "#f4fbff";
  d.beginPath();
  d.arc(cx, cy + 7, 13, Math.PI, 0);
  d.fill();
  d.strokeStyle = "#a8cce0";
  d.lineWidth = 1;
  for (const hauteur of [4, 9]) {
    const demiLargeur = Math.sqrt(13 * 13 - hauteur * hauteur);
    d.beginPath();
    d.moveTo(cx - demiLargeur, cy + 7 - hauteur);
    d.lineTo(cx + demiLargeur, cy + 7 - hauteur);
    d.stroke();
  }
  d.fillStyle = "#2a4a6a"; // l'entrée
  d.beginPath();
  d.arc(cx, cy + 7, 4.5, Math.PI, 0);
  d.fill();
}

function pingouin(cx, cy) {
  ombre(cx + 2, cy + 10, 7);
  d.fillStyle = "#1a1a2a";
  d.beginPath();
  d.ellipse(cx, cy, 7, 10, 0, 0, Math.PI * 2);
  d.fill();
  d.fillStyle = "white";
  d.beginPath();
  d.ellipse(cx, cy + 2, 4.5, 7, 0, 0, Math.PI * 2);
  d.fill();
  rond(cx - 2, cy - 5, 1.2, "white");
  rond(cx + 2, cy - 5, 1.2, "white");
  d.fillStyle = "#ff9a1a";
  remplirForme(cx, cy, [[-2, -3], [2, -3], [0, -1]]);
  d.fillRect(cx - 5, cy + 9, 4, 2);
  d.fillRect(cx + 1, cy + 9, 4, 2);
}

// ---------- 🍭 LE PAYS DES BONBONS ----------
themes.bonbons = {
  fond() {
    fondUni("#ffe3f1");
    pointsSurFond(["#ff6fa8", "#6fd0ff", "#ffd84a", "#8ae86a", "#c58aff"], 350, 3);
  },
  murs() {
    // Des blocs de guimauve rose
    dessinerMursRelief("#c94f8e", "#ff8cc6", false);
    // Le glaçage blanc qui coule sur le dessus
    d.fillStyle = "#fff4fa";
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (!estUnMur(x, y) || estUnMur(x, y - 1)) continue;
        const hy = centreY(y) - RAYON_MUR;
        d.beginPath();
        d.arc(centreX(x), centreY(y), RAYON_MUR, Math.PI * 1.1, Math.PI * 1.9);
        d.fill();
        rond(centreX(x) - 6, hy + 6 + hasard(x, y, 30) * 4, 2.5, "#fff4fa");
        rond(centreX(x) + 5, hy + 5 + hasard(x, y, 31) * 5, 2.5, "#fff4fa");
      }
    }
    grainsSurMurs("#ffffff", "#ffd84a", 6);
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.15) sucette(cx, cy);
      else if (h < 0.25) sucreDOrge(cx, cy);
    } else {
      if (h < 0.2) sucette(cx, cy);
      else if (h < 0.35) cupcake(cx, cy);
      else if (h < 0.5) donut(cx, cy);
      else if (h < 0.62) sucreDOrge(cx, cy);
    }
  },
  // Un petit bonbon emballé, d'une couleur différente selon la case
  objet(px, py, temps, brille, x, y) {
    const couleurs = ["#ff4a8a", "#3ab8ff", "#ffc83a", "#5ad84a", "#b45aff"];
    const couleur = couleurs[(x + y) % couleurs.length];
    crayon.fillStyle = couleur;
    remplirForme(px, py, [[-4, 0], [-8, -3], [-8, 3]], crayon);
    remplirForme(px, py, [[4, 0], [8, -3], [8, 3]], crayon);
    rond(px, py, 4.5, couleur, crayon);
    crayon.fillStyle = "rgba(255,255,255,0.7)";
    crayon.fillRect(px - 2, py - 2, 2, 2);
  },
};

function sucette(cx, cy) {
  ombre(cx + 3, cy + 12, 6);
  d.strokeStyle = "#ffffff";
  d.lineWidth = 2;
  d.beginPath();
  d.moveTo(cx, cy + 12);
  d.lineTo(cx, cy - 4);
  d.stroke();
  rond(cx, cy - 9, 8, "#ff4a8a");
  d.strokeStyle = "#ffffff";
  d.lineWidth = 1.5;
  d.beginPath();
  for (let a = 0; a < Math.PI * 5; a += 0.2) {
    const r = a * 0.5;
    d.lineTo(cx + Math.cos(a) * r, cy - 9 + Math.sin(a) * r);
  }
  d.stroke();
}

function sucreDOrge(cx, cy) {
  ombre(cx + 3, cy + 12, 5);
  d.lineWidth = 5;
  d.lineCap = "round";
  d.beginPath();
  d.moveTo(cx + 3, cy + 11);
  d.lineTo(cx + 3, cy - 6);
  d.arc(cx - 2, cy - 6, 5, 0, Math.PI, true);
  d.strokeStyle = "#ffffff";
  d.stroke();
  d.setLineDash([3, 3]);
  d.strokeStyle = "#e02a3a";
  d.stroke();
  d.setLineDash([]);
  d.lineCap = "butt";
}

function cupcake(cx, cy) {
  ombre(cx + 3, cy + 11, 10);
  d.fillStyle = "#4ab8f0";
  remplirForme(cx, cy, [[-9, 0], [9, 0], [6, 11], [-6, 11]]);
  rond(cx - 5, cy - 1, 5, "#fff0f6");
  rond(cx + 5, cy - 1, 5, "#fff0f6");
  rond(cx, cy - 5, 6, "#ffd0e4");
  rond(cx, cy - 12, 3, "#e02a3a"); // la cerise
}

function donut(cx, cy) {
  ombre(cx + 3, cy + 8, 11);
  rond(cx, cy, 10, "#d9a066");
  rond(cx, cy - 1, 8.5, "#7a3e1e"); // le chocolat
  const couleurs = ["#ff6fa8", "#6fd0ff", "#ffd84a", "#ffffff"];
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    d.fillStyle = couleurs[i % 4];
    d.fillRect(cx + Math.cos(a) * 6, cy - 1 + Math.sin(a) * 6, 2.5, 1.5);
  }
  rond(cx, cy - 1, 3, "#ff8cc6"); // le trou
}

// ---------- 🌃 LA VILLE LA NUIT ----------
themes.ville = {
  fond() {
    fondUni("#1a1a26");
    pointsSurFond(["#22222e", "#14141c"], 1500, 2);
    // Les lignes jaunes au milieu des rues
    d.fillStyle = "rgba(255,210,80,0.3)";
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (estUnMur(x, y)) continue;
        if (!estUnMur(x - 1, y) && !estUnMur(x + 1, y)) d.fillRect(centreX(x) - 6, centreY(y) - 1, 12, 2);
        else if (!estUnMur(x, y - 1) && !estUnMur(x, y + 1)) d.fillRect(centreX(x) - 1, centreY(y) - 6, 2, 12);
      }
    }
  },
  murs() {
    // Des immeubles vus d'en haut
    dessinerMursRelief("#22223a", "#3c3c5c", true);
    // Les fenêtres allumées ou éteintes
    for (let y = 0; y < LIGNES; y++) {
      for (let x = 0; x < COLONNES; x++) {
        if (!estUnMur(x, y)) continue;
        for (let i = 0; i < 4; i++) {
          d.fillStyle = hasard(x, y, i + 80) < 0.55 ? "#ffd85a" : "#28283c";
          d.fillRect(centreX(x) - 10 + (i % 2) * 13, centreY(y) - 10 + Math.floor(i / 2) * 13, 7, 7);
        }
      }
    }
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.15) lampadaire(cx, cy);
    } else {
      if (h < 0.15) lampadaire(cx, cy);
      else if (h < 0.28) antenne(cx, cy);
      else if (h < 0.38) neon(cx, cy);
    }
  },
  apres() {
    vignette("rgba(0,0,10,0.5)");
  },
  objet(px, py, temps) {
    pieceOr(px, py, temps);
  },
};

function lampadaire(cx, cy) {
  lueur(d, cx + 6, cy - 12, 24, "rgba(255,230,140,0.45)");
  d.strokeStyle = "#555566";
  d.lineWidth = 2;
  d.beginPath();
  d.moveTo(cx, cy + 10);
  d.lineTo(cx, cy - 12);
  d.lineTo(cx + 6, cy - 12);
  d.stroke();
  rond(cx + 6, cy - 11, 2.5, "#fff0b0");
}

function antenne(cx, cy) {
  d.strokeStyle = "#8888a0";
  d.lineWidth = 1.5;
  d.beginPath();
  d.moveTo(cx, cy + 6);
  d.lineTo(cx, cy - 14);
  d.moveTo(cx - 5, cy - 8);
  d.lineTo(cx + 5, cy - 8);
  d.moveTo(cx - 3, cy - 3);
  d.lineTo(cx + 3, cy - 3);
  d.stroke();
  lueur(d, cx, cy - 15, 7, "rgba(255,40,40,0.8)");
  rond(cx, cy - 15, 1.5, "#ff4040");
}

function neon(cx, cy) {
  lueur(d, cx, cy, 22, "rgba(255,60,180,0.35)");
  d.strokeStyle = "#ff5ad0";
  d.lineWidth = 2;
  d.strokeRect(cx - 12, cy - 6, 24, 12);
  d.fillStyle = "#ffb0ec";
  d.font = "7px 'Press Start 2P'";
  d.textAlign = "center";
  d.fillText("BAR", cx, cy + 4);
}

// ---------- 🚀 L'ESPACE ----------
themes.espace = {
  fond() {
    fondUni("#03030f");
    lueur(d, 150, 250, 220, "rgba(140,40,200,0.25)");
    lueur(d, 620, 450, 220, "rgba(40,120,220,0.22)");
    pointsSurFond(["#ffffff", "#9fb8ff", "#ffe9a8", "#555577"], 400, 1);
    pointsSurFond(["#ffffff", "#bcd0ff"], 50, 2);
  },
  murs() {
    // Des astéroïdes avec des cratères
    dessinerMursRelief("#3e362e", "#857868", false);
    crateres("#5e5448", "#a89a88");
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.1) cristal(cx, cy, "#8a3ad8", "#d8a8ff");
    } else {
      if (h < 0.15) planete(cx, cy, "#ffb070", "#c0502a");
      else if (h < 0.3) satellite(cx, cy);
      else if (h < 0.45) cristal(cx, cy, "#8a3ad8", "#d8a8ff");
      else if (h < 0.55) fusee(cx, cy);
      else if (h < 0.65) planete(cx, cy, "#90e0ff", "#2a60c0");
    }
  },
  // Une étoile jaune qui scintille
  objet(px, py, temps, brille) {
    rond(px, py, 6 + brille, "rgba(255,230,120,0.2)", crayon);
    const t = 5 + brille;
    crayon.fillStyle = "#ffe14a";
    crayon.beginPath();
    crayon.moveTo(px, py - t);
    crayon.quadraticCurveTo(px, py, px + t, py);
    crayon.quadraticCurveTo(px, py, px, py + t);
    crayon.quadraticCurveTo(px, py, px - t, py);
    crayon.quadraticCurveTo(px, py, px, py - t);
    crayon.fill();
  },
};

function crateres(couleur, bordure) {
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (!estUnMur(x, y)) continue;
      for (let i = 0; i < 2; i++) {
        if (hasard(x, y, i + 20) > 0.6) continue;
        const kx = centreX(x) + (hasard(x, y, i + 21) - 0.5) * 18;
        const ky = centreY(y) + (hasard(x, y, i + 22) - 0.5) * 18;
        const kr = 2 + hasard(x, y, i + 23) * 3;
        rond(kx, ky, kr, couleur);
        d.strokeStyle = bordure;
        d.lineWidth = 1;
        d.beginPath();
        d.arc(kx, ky, kr, 0.2, 1.8);
        d.stroke();
      }
    }
  }
}

function planete(cx, cy, clair, fonce) {
  d.strokeStyle = "rgba(255,230,180,0.8)";
  d.lineWidth = 2;
  d.beginPath();
  d.ellipse(cx, cy, 15, 4, -0.3, Math.PI, Math.PI * 2); // l'arrière de l'anneau
  d.stroke();
  const degrade = d.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 9);
  degrade.addColorStop(0, clair);
  degrade.addColorStop(1, fonce);
  rond(cx, cy, 9, degrade);
  d.beginPath();
  d.ellipse(cx, cy, 15, 4, -0.3, 0, Math.PI); // l'avant de l'anneau
  d.stroke();
}

function satellite(cx, cy) {
  d.fillStyle = "#2a5ad0";
  d.fillRect(cx - 16, cy - 3, 10, 6);
  d.fillRect(cx + 6, cy - 3, 10, 6);
  d.fillStyle = "#c0c4d0";
  d.fillRect(cx - 5, cy - 5, 10, 10);
  d.fillStyle = "#e8eaf0";
  d.fillRect(cx - 5, cy - 5, 4, 10);
  d.strokeStyle = "#c0c4d0";
  d.lineWidth = 1;
  d.beginPath();
  d.moveTo(cx, cy - 5);
  d.lineTo(cx, cy - 11);
  d.stroke();
  rond(cx, cy - 12, 1.5, "#ff4040");
}

function cristal(cx, cy, fonce, clair) {
  ombre(cx + 2, cy + 8, 8);
  d.fillStyle = fonce;
  remplirForme(cx, cy, [[-6, 6], [-4, -6], [0, -12], [4, -6], [6, 6]]);
  d.fillStyle = clair;
  remplirForme(cx, cy, [[-4, -6], [0, -12], [0, 6], [-6, 6]]);
  d.fillStyle = fonce;
  remplirForme(cx, cy, [[8, 7], [9, -2], [12, 7]]);
}

function fusee(cx, cy) {
  d.fillStyle = "#ff9a2a";
  remplirForme(cx, cy, [[-3, 8], [0, 15], [3, 8]]);
  d.fillStyle = "#d02a2a";
  remplirForme(cx, cy, [[-5, 2], [-9, 9], [-4, 7]]);
  remplirForme(cx, cy, [[5, 2], [9, 9], [4, 7]]);
  d.fillStyle = "#f0f0f8";
  d.beginPath();
  d.ellipse(cx, cy, 5, 10, 0, 0, Math.PI * 2);
  d.fill();
  d.fillStyle = "#d02a2a";
  remplirForme(cx, cy, [[-4, -6], [0, -12], [4, -6]]);
  rond(cx, cy - 1, 2.5, "#4aa0ff");
}

// ---------- 🌋 LE VOLCAN ----------
themes.volcan = {
  fond() {
    fondUni("#1e0e0a");
    pointsSurFond(["#2a1410", "#120604"], 2000, 2);
    // Des fissures de lave qui brillent
    for (let i = 0; i < 30; i++) {
      let fx = hasard(i, 3, 9) * decor.width;
      let fy = HAUT + hasard(i, 4, 9) * (decor.height - HAUT);
      lueur(d, fx, fy, 18, "rgba(255,90,20,0.25)");
      d.strokeStyle = "#ff6a1a";
      d.lineWidth = 1.5;
      d.beginPath();
      d.moveTo(fx, fy);
      for (let k = 0; k < 3; k++) {
        fx += (hasard(i, k, 11) - 0.5) * 20;
        fy += (hasard(i, k, 12) - 0.5) * 20;
        d.lineTo(fx, fy);
      }
      d.stroke();
    }
  },
  murs() {
    // Des rochers de lave noire
    dessinerMursRelief("#1e1210", "#4a2e26", false);
    crateres("#3a221c", "#ff6a1a");
    grainsSurMurs("#6a4a3a", "#2a1a14", 6);
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.12) petitVolcan(cx, cy);
    } else {
      if (h < 0.18) petitVolcan(cx, cy);
      else if (h < 0.32) cristal(cx, cy, "#a01020", "#ff6070");
      else if (h < 0.45) crane(cx, cy);
    }
  },
  apres() {
    vignette("rgba(40,0,0,0.5)");
  },
  // Un rubis rouge
  objet(px, py, temps, brille) {
    rond(px, py, 7 + brille, "rgba(255,60,60,0.2)", crayon);
    crayon.fillStyle = "#c01020";
    remplirForme(px, py, [[0, -6], [5, 0], [0, 6], [-5, 0]], crayon);
    crayon.fillStyle = "#ff7080";
    remplirForme(px, py, [[0, -6], [0, 0], [-5, 0]], crayon);
  },
};

function petitVolcan(cx, cy) {
  lueur(d, cx, cy - 10, 22, "rgba(255,100,20,0.4)");
  ombre(cx + 3, cy + 10, 14);
  d.fillStyle = "#3a2420";
  remplirForme(cx, cy, [[-14, 10], [-4, -8], [4, -8], [14, 10]]);
  d.fillStyle = "#5a3a30";
  remplirForme(cx, cy, [[-14, 10], [-4, -8], [-1, -8], [-6, 10]]);
  d.fillStyle = "#ff7a1a"; // la lave
  remplirForme(cx, cy, [[-4, -8], [4, -8], [2, -2], [3, 4], [0, 0], [-2, -4]]);
  rond(cx, cy - 15, 4, "rgba(120,120,120,0.5)"); // la fumée
  rond(cx + 4, cy - 21, 5, "rgba(120,120,120,0.35)");
}

function crane(cx, cy) {
  ombre(cx + 2, cy + 8, 8);
  rond(cx, cy - 2, 7, "#e8e0d0");
  d.fillStyle = "#e8e0d0";
  d.fillRect(cx - 4, cy + 3, 8, 5);
  rond(cx - 3, cy - 2, 2, "#1a0a08");
  rond(cx + 3, cy - 2, 2, "#1a0a08");
  d.fillStyle = "#1a0a08";
  d.fillRect(cx - 2, cy + 5, 1, 3);
  d.fillRect(cx + 1, cy + 5, 1, 3);
}

// ---------- 👻 LE MANOIR HANTÉ (le niveau du boss) ----------
themes.manoir = {
  fond() {
    fondUni("#16101e");
    // Le vieux parquet
    d.strokeStyle = "#1e1628";
    d.lineWidth = 1;
    for (let py = HAUT; py < decor.height; py += 10) {
      d.beginPath();
      d.moveTo(0, py);
      d.lineTo(decor.width, py);
      d.stroke();
    }
    pointsSurFond(["#221a2e", "#0c0812"], 1500, 2);
    // Du brouillard violet
    for (let i = 0; i < 6; i++) {
      lueur(d, hasard(i, 5, 3) * decor.width, HAUT + hasard(i, 6, 3) * (decor.height - HAUT), 120, "rgba(110,60,160,0.18)");
    }
  },
  murs() {
    // Des murs en pierre sombre
    dessinerMursRelief("#1a1622", "#3a3446", true);
    pierresDevant("#100c16");
    grainsSurMurs("#4a4458", "#2a2434", 6);
  },
  deco(cx, cy, h, auBord) {
    if (auBord) {
      if (h < 0.15) bougie(cx, cy);
      else if (h < 0.25) tombe(cx, cy);
    } else {
      if (h < 0.25) tombe(cx, cy);
      else if (h < 0.45) bougie(cx, cy);
      else if (h < 0.65) citrouille(cx, cy);
      else toile(cx, cy);
    }
  },
  apres() {
    vignette("rgba(10,0,20,0.7)");
  },
  // Une petite âme bleue qui flotte
  objet(px, py, temps, brille) {
    const fy = py + brille;
    rond(px, fy, 7, "rgba(120,220,255,0.2)", crayon);
    crayon.fillStyle = "#9ae8ff";
    crayon.beginPath();
    crayon.arc(px, fy + 1, 3.5, 0, Math.PI);
    crayon.quadraticCurveTo(px - 3.5, fy - 3, px, fy - 6);
    crayon.quadraticCurveTo(px + 3.5, fy - 3, px + 3.5, fy + 1);
    crayon.fill();
  },
};

function tombe(cx, cy) {
  ombre(cx + 3, cy + 10, 10);
  d.fillStyle = "#5a5468";
  d.beginPath();
  d.arc(cx, cy - 4, 8, Math.PI, 0);
  d.lineTo(cx + 8, cy + 10);
  d.lineTo(cx - 8, cy + 10);
  d.fill();
  d.fillStyle = "#7a7488";
  d.fillRect(cx - 8, cy - 4, 3, 14);
  d.fillStyle = "#2a2434";
  d.font = "6px 'Press Start 2P'";
  d.textAlign = "center";
  d.fillText("RIP", cx, cy + 2);
}

function bougie(cx, cy) {
  lueur(d, cx, cy - 8, 20, "rgba(255,180,80,0.45)");
  d.fillStyle = "#e8e0c8";
  d.fillRect(cx - 3, cy - 4, 6, 12);
  d.fillStyle = "#ff9a2a";
  d.beginPath();
  d.ellipse(cx, cy - 8, 2, 4, 0, 0, Math.PI * 2);
  d.fill();
  rond(cx, cy - 7, 1, "#fff0a0");
}

function citrouille(cx, cy) {
  ombre(cx + 3, cy + 9, 11);
  d.fillStyle = "#d86a10";
  for (const dx of [-5, 5, 0]) {
    d.beginPath();
    d.ellipse(cx + dx, cy + 1, 6, 8, 0, 0, Math.PI * 2);
    d.fill();
  }
  d.fillStyle = "#2a7a2a";
  d.fillRect(cx - 1, cy - 10, 3, 4);
  d.fillStyle = "#ffd83a"; // le visage qui fait peur
  remplirForme(cx, cy, [[-6, -2], [-2, -2], [-4, -5]]);
  remplirForme(cx, cy, [[2, -2], [6, -2], [4, -5]]);
  remplirForme(cx, cy, [[-6, 3], [6, 3], [3, 6], [0, 4], [-3, 6]]);
}

function toile(cx, cy) {
  d.strokeStyle = "rgba(220,220,230,0.5)";
  d.lineWidth = 1;
  const ox = cx - 14;
  const oy = cy - 14;
  for (let i = 0; i <= 4; i++) {
    const a = (i * Math.PI) / 8;
    d.beginPath();
    d.moveTo(ox, oy);
    d.lineTo(ox + Math.cos(a) * 26, oy + Math.sin(a) * 26);
    d.stroke();
  }
  for (const r of [8, 15, 22]) {
    d.beginPath();
    d.arc(ox, oy, r, 0, Math.PI / 2);
    d.stroke();
  }
}
