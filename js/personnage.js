// ============================================
// ZORK : le petit fantôme gélatine vert, et son épée
// ============================================

// "echelle" permet de le dessiner en grand (le joueur) ou en petit (les vies)
function dessinerPersonnage(cx, cy, echelle, temps, regardX, regardY, bouche) {
  crayon.save();
  crayon.translate(cx, cy);
  crayon.scale(echelle, echelle);

  const demi = 14;   // la moitié de la taille du carré
  const coin = 6;    // l'arrondi des coins
  const vague = temps / 120;

  // La forme du corps : un carré arrondi avec le bas qui ondule
  crayon.beginPath();
  crayon.moveTo(-demi, -demi + coin);
  crayon.arcTo(-demi, -demi, -demi + coin, -demi, coin);
  crayon.lineTo(demi - coin, -demi);
  crayon.arcTo(demi, -demi, demi, -demi + coin, coin);
  crayon.lineTo(demi, demi - 3);
  // 3 vagues en bas, qui bougent avec le temps
  for (let i = 0; i < 3; i++) {
    const debut = demi - (i * 2 * demi) / 3;
    const fin = demi - ((i + 1) * 2 * demi) / 3;
    const creux = demi - 3 + Math.sin(vague + i * 2) * 2.5;
    crayon.quadraticCurveTo((debut + fin) / 2, creux + 5, fin, demi - 3);
  }
  crayon.closePath();

  // Le corps vert menthe
  crayon.fillStyle = "#8ff0a0";
  crayon.fill();

  // La bande un peu plus foncée en bas
  crayon.save();
  crayon.clip();
  crayon.fillStyle = "#79e68c";
  crayon.beginPath();
  crayon.moveTo(-demi, demi - 7);
  for (let i = 0; i <= 8; i++) {
    const px = -demi + (i * 2 * demi) / 8;
    crayon.lineTo(px, demi - 7 + Math.sin(vague + i) * 1.2);
  }
  crayon.lineTo(demi, demi + 6);
  crayon.lineTo(-demi, demi + 6);
  crayon.fill();
  crayon.restore();

  // Les petits bras qui font coucou
  const coucou = Math.sin(temps / 180) * 0.25;
  crayon.strokeStyle = "#5cc96e";
  crayon.lineWidth = 1.6;
  crayon.lineCap = "round";
  // Bras gauche : une boucle vers le bas
  crayon.save();
  crayon.translate(-9, 5);
  crayon.rotate(coucou);
  crayon.beginPath();
  crayon.moveTo(-4, 0);
  crayon.quadraticCurveTo(2, -1, 2, 2);
  crayon.quadraticCurveTo(1, 4, -3, 5);
  crayon.stroke();
  crayon.restore();
  // Bras droit : une boucle vers le haut
  crayon.save();
  crayon.translate(9, 4);
  crayon.rotate(-coucou);
  crayon.beginPath();
  crayon.moveTo(-3, 2);
  crayon.quadraticCurveTo(0, 1, 1, -3);
  crayon.quadraticCurveTo(4, -1, 3, 4);
  crayon.stroke();
  crayon.restore();
  crayon.lineCap = "butt";

  // Les yeux en forme de haricot (ils glissent un peu vers là où il va)
  crayon.fillStyle = "#141418";
  for (const cote of [-1, 1]) {
    const ox = cote * 6 + regardX * 1.5;
    const oy = -4 + regardY * 1.5;
    crayon.beginPath();
    crayon.moveTo(ox - 4.5, oy + 2);
    crayon.bezierCurveTo(ox - 4.5, oy - 5, ox + 4.5, oy - 5, ox + 4.5, oy + 2);
    crayon.quadraticCurveTo(ox, oy, ox - 4.5, oy + 2);
    crayon.fill();
  }

  // La bouche en forme de D (le plat en haut, l'arrondi en bas)
  const bx = regardX * 1.5;
  const by = 1.5 + regardY * 1.5;
  crayon.beginPath();
  crayon.moveTo(bx - 3.5, by);
  crayon.quadraticCurveTo(bx, by - 0.8, bx + 3.5, by);
  crayon.ellipse(bx, by, 3.5, bouche, 0, 0, Math.PI);
  crayon.fill();

  crayon.restore();
}

// ============================================
// L'ÉPÉE (seulement dans le niveau du boss)
// avancement : -1 = on ne frappe pas, de 0 à 1 = le coup est en train d'être donné
// ============================================
const DUREE_COUP = 250; // un coup d'épée dure 250 millisecondes

function dessinerEpee(cx, cy, regardX, regardY, avancement) {
  const direction = Math.atan2(regardY, regardX);
  let angle = direction - 0.9; // au repos, l'épée est tenue sur le côté

  if (avancement >= 0) {
    // Pendant le coup, l'épée tourne d'un côté à l'autre
    const debut = direction - 1.5;
    const fin = direction + 1.5;
    angle = debut + (fin - debut) * avancement;

    // La trace blanche du coup
    crayon.strokeStyle = `rgba(255,255,255,${0.7 * (1 - avancement)})`;
    crayon.lineWidth = 10;
    crayon.beginPath();
    crayon.arc(cx, cy, 34, debut, angle);
    crayon.stroke();
    crayon.strokeStyle = `rgba(150,220,255,${0.8 * (1 - avancement)})`;
    crayon.lineWidth = 3;
    crayon.stroke();
  }

  crayon.save();
  crayon.translate(cx, cy);
  crayon.rotate(angle);
  crayon.translate(10, 0);

  // La lame qui brille
  crayon.shadowColor = "#9ad8ff";
  crayon.shadowBlur = 8;
  crayon.fillStyle = "#d8e4f0";
  remplirForme(0, 0, [[8, -2.5], [32, -2.5], [37, 0], [32, 2.5], [8, 2.5]], crayon);
  crayon.shadowBlur = 0;
  crayon.fillStyle = "#ffffff";
  crayon.fillRect(9, -1.5, 23, 1);
  // La garde dorée
  crayon.fillStyle = "#e0b020";
  crayon.fillRect(6, -7, 3, 14);
  // La poignée
  crayon.fillStyle = "#6a3a1a";
  crayon.fillRect(0, -2, 6, 4);
  rond(-1, 0, 2.5, "#e0b020", crayon);

  crayon.restore();
}
