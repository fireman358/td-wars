import { ALL_WAVES, BUILD_ORDER, GRID_H, GRID_W, SECTORS, TOWERS } from './game/config';
import { Engine } from './game/engine';
import type { Tower } from './game/tower';
import { Renderer } from './render';
import type { TowerKindId, Vec } from './game/types';

const engine = new Engine();
const canvas = document.getElementById('game') as HTMLCanvasElement;
const renderer = new Renderer(canvas, engine);

const elCredits = document.getElementById('credits')!;
const elLives = document.getElementById('lives')!;
const elWave = document.getElementById('wave')!;

const elSector = document.getElementById('sector')!;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
const btnSound = document.getElementById('btn-sound') as HTMLButtonElement;
const buildBar = document.getElementById('build-bar')!;
const infoPanel = document.getElementById('info-panel')!;

let selectedBuild: TowerKindId | null = null;

function posFromEvent(ev: MouseEvent): Vec {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - rect.left) / rect.width) * GRID_W,
    y: ((ev.clientY - rect.top) / rect.height) * GRID_H,
  };
}

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

function refreshBuildBar() {
  buildBar.innerHTML = '';
  for (const id of BUILD_ORDER) {
    const k = TOWERS[id];
    const btn = document.createElement('button');
    btn.className = 'build-btn';
    const cost = k.levels[0].cost;
    const locked = engine.credits < cost;
    btn.classList.toggle('locked', locked);
    if (selectedBuild === id) btn.classList.add('selected');
    btn.innerHTML = `<span class="name" style="color:${k.color}">${k.name}</span><span class="cost">${cost} cr</span>`;
    btn.title = k.desc;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
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
  const up = t.canUpgrade()
    ? `<button id="btn-up" class="btn primary">Améliorer ${t.upgradeCost()} cr</button>`
    : '<span style="color:#ffd23f">Niveau max</span>';
  infoPanel.innerHTML = `
    <h3>${k.name} — Nv ${t.level + 1}</h3>
    <div class="row"><span class="k">Dégâts</span><span>${s.damage}</span></div>
    <div class="row"><span class="k">Portée</span><span>${s.range}</span></div>
    <div class="row"><span class="k">Cadence</span><span>${s.fireRate}/s</span></div>
    ${k.kind === 'splash' ? `<div class="row"><span class="k">Zone</span><span>${s.splashRadius}</span></div>` : ''}
    ${k.kind === 'slow' ? `<div class="row"><span class="k">Ralentit</span><span>x${s.slowFactor}</span></div>` : ''}
    ${k.kind === 'chain' ? `<div class="row"><span class="k">Cibles en chaîne</span><span>${s.chainTargets}</span></div>` : ''}
    <div class="actions">
      ${up}
      <button id="btn-sell" class="btn">Vendre ${t.sellValue()} cr</button>
    </div>`;
  infoPanel.style.display = 'block';
  document.getElementById('btn-up')?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    engine.upgradeTower(t);
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
  document.getElementById('game-wrap')!.appendChild(intro);
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
  document.getElementById('game-wrap')!.appendChild(ov);
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
btnSound.addEventListener('click', () => {
  engine.toggleSound();
  btnSound.textContent = engine.sfx.enabled ? '🔊' : '🔇';
});

canvas.addEventListener('mousemove', (ev) => {
  renderer.mouse = posFromEvent(ev);
  renderer.buildPreview = selectedBuild ? { kindId: selectedBuild, valid: true } : null;
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
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
