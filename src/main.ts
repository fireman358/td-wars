import { ALL_WAVES, BUILD_ORDER, GRID_H, GRID_W, SECTORS, TOWERS } from './game/config';
import { Engine } from './game/engine';
import { TARGET_LABELS, type Tower } from './game/tower';
import { Renderer } from './render';
import { PERK_DEFS, perkCost, saveMeta, type PerkId } from './game/meta';
import type { TowerKindId, Vec } from './game/types';

const engine = new Engine();
const canvas = document.getElementById('game') as HTMLCanvasElement;
const hud = document.getElementById('hud')!;
const renderer = new Renderer(canvas, engine);

const elCredits = document.getElementById('credits')!;
const elLives = document.getElementById('lives')!;
const elWave = document.getElementById('wave')!;

const elSector = document.getElementById('sector')!;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
const btnSound = document.getElementById('btn-sound') as HTMLButtonElement;
const btnSector = document.getElementById('btn-sector') as HTMLButtonElement;
const btnMeta = document.getElementById('btn-meta') as HTMLButtonElement;
const btnFullscreen = document.getElementById('btn-fullscreen') as HTMLButtonElement;
const saberFill = document.getElementById('saber-fill')!;
const buildBar = document.getElementById('build-bar')!;
const infoPanel = document.getElementById('info-panel')!
const sidePanel = document.getElementById('side-panel')!;

let selectedBuild: TowerKindId | null = null;

function posFromEvent(ev: MouseEvent): Vec {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - rect.left) / rect.width) * GRID_W,
    y: ((ev.clientY - rect.top) / rect.height) * GRID_H,
  };
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  const wrap = document.getElementById('game-wrap')!;
  const availW = (wrap.clientWidth || GRID_W) - 240;
  const availH = window.innerHeight - hud.offsetHeight - 116 - 60;
  const scale = Math.max(0.4, Math.min(availW / GRID_W, availH / GRID_H));
  const cssW = GRID_W * scale;
  const cssH = GRID_H * scale;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  renderer.ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  renderer.ctx.imageSmoothingEnabled = true;
}

btnFullscreen.addEventListener('click', () => {
  const app = document.getElementById('app')!;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void app.requestFullscreen();
  }
});
document.addEventListener('fullscreenchange', () => {
  setTimeout(resizeCanvas, 60);
});
window.addEventListener('resize', () => resizeCanvas());

function refreshHud() {
  elCredits.textContent = String(engine.credits);
  elLives.textContent = String(engine.lives);
  elWave.textContent = `${engine.waveNumber}/${engine.totalWaves}`;
  elSector.textContent = SECTORS[engine.sectorIndex].name;
  const next = ALL_WAVES[engine.waveIndex + 1];
  if (engine.autoTimer >= 0) {
    btnStart.textContent = `⏩ ${Math.ceil(engine.autoTimer)}s (+${Math.ceil(engine.autoTimer * 0.6 * 4)} cr)`;
    btnStart.disabled = false;
  } else if (next) {
    btnStart.textContent = `Lancer la vague ${engine.waveNumber + 1}`;
    btnStart.disabled = !engine.canStartWave();
  } else {
    btnStart.textContent = '—';
    btnStart.disabled = true;
  }
  btnSpeed.textContent = `x${engine.speed}`;
  refreshBuildBar();
}

function drawTowerIcon(cv: HTMLCanvasElement, id: string, accent: string) {
  const c = cv.getContext('2d')!;
  c.clearRect(0, 0, 44, 44);
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.beginPath();
  c.ellipse(23, 32, 13, 5, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#1a2436';
  c.strokeStyle = 'rgba(120,160,220,0.6)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(22, 24, 10, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.save();
  c.translate(22, 24);
  c.rotate(-Math.PI / 4);
  c.fillStyle = '#2b3a52';
  switch (id) {
    case 'plasma':
      c.fillRect(0, -3, 15, 6);
      c.fillStyle = accent;
      c.fillRect(12, -2, 4, 4);
      break;
    case 'ion':
      c.beginPath(); c.arc(6, 0, 6, 0, Math.PI * 2); c.fillStyle = '#1f3a3f'; c.fill();
      c.fillStyle = accent;
      c.beginPath(); c.arc(12, 0, 3, 0, Math.PI * 2); c.fill();
      break;
    case 'missile':
      c.fillRect(-3, -8, 12, 16);
      c.fillStyle = accent;
      for (const dy of [-5, 0, 5]) c.fillRect(6, dy - 1, 8, 2);
      break;
    case 'laser':
      c.fillRect(-2, -5, 18, 10);
      c.fillStyle = accent;
      c.fillRect(13, -1.5, 6, 3);
      break;
    case 'tesla':
      c.beginPath(); c.arc(3, 0, 7, 0, Math.PI * 2); c.fillStyle = '#2c1f3a'; c.fill();
      c.strokeStyle = accent; c.lineWidth = 1.5;
      c.beginPath(); c.arc(3, 0, 4.5, 0, 2); c.stroke();
      c.beginPath(); c.arc(3, 0, 4.5, 3, 5); c.stroke();
      break;
    case 'rail':
      c.fillRect(-2, -6, 18, 12);
      c.fillStyle = accent;
      c.fillRect(14, -1.5, 6, 3);
      c.strokeStyle = 'rgba(191,230,255,0.7)';
      c.beginPath(); c.moveTo(2, -4); c.lineTo(16, -4); c.moveTo(2, 4); c.lineTo(16, 4); c.stroke();
      break;
    case 'tractor':
      c.fillRect(-2, -5, 16, 10);
      c.strokeStyle = accent; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(10, -4); c.lineTo(18, -1); c.stroke();
      c.beginPath(); c.moveTo(10, 4); c.lineTo(18, 1); c.stroke();
      break;
    case 'axial':
      c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fillStyle = '#1e2a1a'; c.fill();
      c.fillRect(4, -8, 14, 16);
      c.fillStyle = accent;
      c.beginPath(); c.arc(17, 0, 3, 0, Math.PI * 2); c.fill();
      break;
    default:
      c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fillStyle = '#2a2f38'; c.fill();
      c.strokeStyle = accent;
      c.beginPath(); c.arc(0, 0, 11, 0, 2); c.stroke();
      c.fillStyle = accent;
      c.beginPath(); c.arc(0, 0, 2.5, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

function refreshBuildBar() {
  buildBar.innerHTML = '';
  for (const id of BUILD_ORDER) {
    const k = TOWERS[id];
    const btn = document.createElement('button');
    btn.className = 'build-btn';
    const cost = k.levels[0].cost;
    const unlocked = engine.isUnlocked(id);
    const affordable = engine.credits >= cost;
    btn.classList.toggle('locked', !unlocked || !affordable);
    if (selectedBuild === id) btn.classList.add('selected');
    const icon = document.createElement('canvas');
    icon.className = 'build-icon';
    icon.width = 44;
    icon.height = 44;
    drawTowerIcon(icon, id, k.accent);
    btn.appendChild(icon);
    if (!unlocked) {
      const lock = document.createElement('span');
      lock.className = 'name';
      lock.style.color = '#667';
      lock.textContent = `🔒 Secteur ${k.unlockSector + 1}`;
      btn.appendChild(lock);
      btn.title = `${k.name} — débloqué au secteur ${k.unlockSector + 1}`;
    } else {
      const cost2 = document.createElement('span');
      cost2.className = 'cost';
      cost2.textContent = `${cost} cr`;
      btn.appendChild(cost2);
      btn.title = `${k.name} (T${k.tier}) — ${k.desc}`;
    }
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!unlocked) {
        engine.sfx.error();
        return;
      }
      if (engine.credits < cost) {
        engine.sfx.error();
        return;
      }
      selectedBuild = selectedBuild === id ? null : id;
      renderer.selectedTower = null;
      hideInfo();
      refreshBuildBar();
    });
    buildBar.appendChild(btn);
  }
}

function showTowerInfo(t: Tower) {
  renderer.selectedTower = t;
  const k = TOWERS[t.id];
  const s = t.stats;
  let up: string;
  if (t.canUpgrade()) {
    up = `<button id="btn-up" class="btn primary">Améliorer ${t.upgradeCost()} cr</button>`;
  } else if (t.canSpec()) {
    up = `<div class="spec-choice"><button id="btn-spec0" class="btn primary" title="${k.specs![0].desc}">${k.specs![0].name}</button><button id="btn-spec1" class="btn" title="${k.specs![1].desc}">${k.specs![1].name}</button></div>`;
  } else if (t.spec) {
    up = `<span style="color:#7de64f">★ ${t.spec.name}</span>`;
  } else {
    up = '<span style="color:#ffd23f">Niveau max</span>';
  }
  const incomeRow = k.kind === 'income' ? `<div class="row"><span class="k">Revenu</span><span>${s.income ?? 0} cr/s</span></div>` : '';
  const statsRows = k.kind === 'income'
    ? incomeRow
    : `<div class="row"><span class="k">Dégâts</span><span>${s.damage}</span></div>
    <div class="row"><span class="k">Portée</span><span>${s.range}</span></div>
    <div class="row"><span class="k">Cadence</span><span>${s.fireRate}/s</span></div>
    ${k.kind === 'splash' ? `<div class="row"><span class="k">Zone</span><span>${s.splashRadius}</span></div>` : ''}
    ${k.kind === 'slow' ? `<div class="row"><span class="k">Ralentit</span><span>x${s.slowFactor}</span></div>` : ''}
    ${k.kind === 'chain' ? `<div class="row"><span class="k">Chaîne</span><span>${s.chainTargets}</span></div>` : ''}
    <div class="row"><span class="k">Cible</span><button id="btn-target" class="btn" style="padding:2px 8px;font-size:11px">${TARGET_LABELS[t.targetMode]}</button></div>`;
  infoPanel.innerHTML = `
    <h3>${k.name} — Nv ${t.level + 1}</h3>
    <div class="actions">
      ${up}
      <button id="btn-sell" class="btn">Vendre ${t.sellValue()} cr</button>
    </div>
    ${statsRows}`;
  if (infoPanel.parentElement !== sidePanel) sidePanel.appendChild(infoPanel);
  infoPanel.style.display = 'block';
  document.getElementById('btn-up')?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.upgradeTower(t);
    showTowerInfo(t);
  });
  document.getElementById('btn-spec0')?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.buySpec(t, 0);
    showTowerInfo(t);
  });
  document.getElementById('btn-spec1')?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.buySpec(t, 1);
    showTowerInfo(t);
  });
  document.getElementById('btn-target')!.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.cycleTargetMode(t);
    showTowerInfo(t);
  });
  document.getElementById('btn-sell')!.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.sellTower(t);
    hideInfo();
    refreshBuildBar();
  });
}

function hideInfo() {
  infoPanel.style.display = 'none';
  renderer.selectedTower = null;
}

function showSectorIntro() {
  const existing = document.getElementById('sector-intro');
  existing?.remove();
  const intro = document.createElement('div');
  intro.id = 'sector-intro';
  intro.innerHTML = `
    <h2>${SECTORS[engine.sectorIndex].name}</h2>
    <p>${(SECTORS[engine.sectorIndex] as any).subtitle}</p>`;
  document.getElementById('canvas-holder')!.appendChild(intro);
  setTimeout(() => intro.classList.add('show'), 10);
  setTimeout(() => {
    intro.classList.remove('show');
    setTimeout(() => intro.remove(), 600);
  }, 3200);
}

function showOverlay(title: string, subtitle: string, msg: string, color: 'gold' | 'red') {
  const existing = document.getElementById('overlay');
  existing?.remove();
  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.innerHTML = `
    <h${color === 'gold' ? '1' : '2'}>${title}</h${color === 'gold' ? '1' : '2'}>
    <p class="subtitle">${subtitle}</p>
    <p>${msg}</p>
    <button class="btn primary" onclick="location.reload()">Rejouer</button>`;
  document.getElementById('canvas-holder')!.appendChild(ov);
}

engine.onEvent = (e) => {
  switch (e.type) {
    case 'credits':
    case 'lives':
    case 'wave':
      refreshHud();
      break;
    case 'sector':
      elSector.textContent = SECTORS[engine.sectorIndex].name;
      if (engine.sectorIndex > 0) renderer.hyperT = 1.4;
      showSectorIntro();
      refreshHud();
      break;
    case 'speed':
      btnSpeed.textContent = `x${engine.speed}`;
      break;
    case 'buildbar':
      refreshBuildBar();
      break;
    case 'victory':
      showOverlay('LA GALAXIE EST SAUVÉE', 'Victoire totale', `Vous avez vaincu les ${ALL_WAVES.length} vagues sur les ${SECTORS.length} secteurs, avec ${engine.lives} vies restantes.`, 'gold');
      break;
    case 'defeat':
      showOverlay('BASE DÉTRUITE', 'Défaite', `La flotte du Nova Empire a percé vos défenses à la vague ${engine.waveNumber} du ${SECTORS[engine.sectorIndex].name}.`, 'red');
      break;
    case 'info':
      if (renderer.selectedTower) showTowerInfo(renderer.selectedTower);
      break;
  }
};

btnStart.addEventListener('click', () => {
  engine.startWave();
  refreshHud();
});
btnSpeed.addEventListener('click', () => engine.toggleSpeed());
function showSectorPicker() {
  const existing = document.getElementById('sector-picker');
  existing?.remove();
  const pick = document.createElement('div');
  pick.id = 'sector-picker';
  const buttons = SECTORS.map((s, i) => `<button class="pick-btn" data-i="${i}">
      <span class="pick-name">${s.name}</span>
      <span class="pick-sub">${(s as any).subtitle}</span>
    </button>`).join('');
  pick.innerHTML = `<h3>Choisir un secteur</h3><div class="pick-list">${buttons}</div>
    <p class="pick-note">Mode test : crédits bonus accordés selon le secteur</p>`;
  document.getElementById('canvas-holder')!.appendChild(pick);
  pick.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const btn = target.closest('.pick-btn') as HTMLElement | null;
    if (btn && !btn.hasAttribute('disabled')) {
      engine.jumpToSector(Number(btn.dataset.i));
      hideInfo();
      pick.remove();
      refreshHud();
    } else if (ev.target === pick) {
      pick.remove();
    }
  });
}

function showMetaPanel() {
  const existing = document.getElementById('meta-panel');
  existing?.remove();
  const meta = engine.meta;
  const cards = PERK_DEFS.map((p) => {
    const lvl = meta.perks[p.id as PerkId];
    const maxed = lvl >= p.max;
    const cost = perkCost(lvl);
    const canBuy = !maxed && meta.points >= cost;
    const current = lvl * p.perLevel;
    const next = maxed ? current : (lvl + 1) * p.perLevel;
    const icons: Record<string, string> = { credits: '💠', lives: '🛡️', saber: '⚔️' };
    return `<div class="perk-card">
      <div class="p-icon">${icons[p.id] ?? '⭐'}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-desc">${p.desc}</div>
      <div class="p-val">Actuel : <b>+${current}${p.unit}</b>${maxed ? '' : ` → suivant : <b>+${next}${p.unit}</b>`}</div>
      <div class="p-lvl">Niveau ${lvl}/${p.max}</div>
      <button class="perk-buy" data-perk="${p.id}" ${canBuy ? '' : 'disabled'}>${maxed ? '★ Niveau max' : `Améliorer — ${cost} pts`}</button>
    </div>`;
  }).join('');
  const panel = document.createElement('div');
  panel.id = 'meta-panel';
  panel.innerHTML = `<h3>PERKS DE COMMANDEMENT</h3>
    <div class="meta-points">⭐ ${meta.points} points disponibles — record : vague ${meta.bestWave}/100</div>
    <div class="meta-list">${cards}</div>
    <div class="meta-help">
      <p><b>Comment gagner des points :</b> 1 point toutes les 2 vagues atteintes, +10 points bonus en fin de partie (victoire ou défaite).</p>
      <p><b>Comment ça marche :</b> les perks achetés s'appliquent automatiquement à chaque nouvelle partie. Les effets se cumulent par niveau.</p>
    </div>
    <button id="btn-meta-close" class="btn primary">Fermer</button>`;
  document.getElementById('canvas-holder')!.appendChild(panel);
  panel.querySelector('#btn-meta-close')!.addEventListener('click', () => panel.remove());
  panel.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest('[data-perk]') as HTMLElement | null;
    if (btn) {
      const id = btn.dataset.perk as PerkId;
      const lvl = engine.meta.perks[id];
      const cost = perkCost(lvl);
      const def = PERK_DEFS.find((p) => p.id === id)!;
      if (lvl < def.max && engine.meta.points >= cost) {
        engine.meta.points -= cost;
        engine.meta.perks[id] = lvl + 1;
        saveMeta(engine.meta);
        showMetaPanel();
      }
    }
  });
}

btnMeta.addEventListener('click', () => {
  const p = document.getElementById('meta-panel');
  if (p) p.remove();
  else showMetaPanel();
});

btnSector.addEventListener('click', () => {
  const pick = document.getElementById('sector-picker');
  if (pick) pick.remove();
  else showSectorPicker();
});

btnSound.addEventListener('click', () => {
  engine.toggleSound();
  btnSound.textContent = engine.sfx.enabled ? '🔊' : '🔇';
});

canvas.addEventListener('mousemove', (ev) => {
  const pos = posFromEvent(ev);
  renderer.mouse = pos;
  engine.saberPos = pos;
  renderer.buildPreview = selectedBuild ? { kindId: selectedBuild, valid: true } : null;
});
canvas.addEventListener('mousedown', (ev) => {
  if (ev.button === 0) engine.saberActive = true;
});
window.addEventListener('mouseup', () => {
  engine.saberActive = false;
});
window.addEventListener('blur', () => {
  engine.saberActive = false;
});
canvas.addEventListener('mouseleave', () => {
  renderer.buildPreview = null;
});
canvas.addEventListener('contextmenu', (ev) => {
  ev.preventDefault();
  selectedBuild = null;
  renderer.buildPreview = null;
  hideInfo();
  refreshBuildBar();
});
canvas.addEventListener('click', (ev) => {
  const pos = posFromEvent(ev);
  const clicked = engine.towerAt(pos);
  if (clicked) {
    selectedBuild = null;
    renderer.buildPreview = null;
    showTowerInfo(clicked);
    refreshBuildBar();
    return;
  }
  if (selectedBuild) {
    engine.placeTower(selectedBuild, pos);
  } else {
    hideInfo();
  }
});

refreshHud();
showSectorIntro();
resizeCanvas();
setTimeout(resizeCanvas, 100);

let last = performance.now();
let hudTick = 0;
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  engine.update(dt);
  renderer.draw(dt);
  hudTick += dt;
  if (hudTick > 0.25) {
    hudTick = 0;
    if (engine.autoTimer >= 0) refreshHud();
  }
  saberFill.style.width = `${(engine.saberEnergy / engine.saberMax) * 100}%`;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
