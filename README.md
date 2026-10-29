# Y Wars — Tower Defense

Tower defense spatial dans un univers "space opera" reconnaissable, avec ses propres noms et son identité originale : **Y Wars**.

## 🎮 Concept

Défendez votre **Base Étoilée** contre 25 vagues de la flotte du **Nova Empire**. Placez des tours le long du chemin, améliorez-les, gérez vos crédits, et survivez jusqu'au boss final : le **Destroyer Lunaire**.

## 🛠️ Tours

| Tour | Rôle | Coût de base |
|------|------|--------------|
| Canon à plasma | Mono-cible rapide, polyvalent | 60 cr |
| Laser à impulsion | Gros dégâts monocible | 110 cr |
| Canon ionique | Ralentit les ennemis (zone) | 80 cr |
| Lance-missiles | Dégâts de zone | 130 cr |
| Canon électrique | Arcs en chaîne | 150 cr |
| Rail orbital | Très longue portée | 200 cr |

Chaque tour possède **3 niveaux d'amélioration**.

## 👾 Ennemis

- **Drone éclaireur** — petit et nombreux
- **Soldat blindé** — armure de base
- **Chasseur stellaire** — très rapide
- **Char des sables** — robuste et blindé
- **Marcheur quadripode** — gros, lent, tanky
- **Bombardier furtif** — difficile à cibler
- **Régénérateur** — soigne les ennemis proches
- **Destroyer Lunaire** — boss final

## ⚙️ Lancer le jeu

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173.

Build de production :

```bash
npm run build
npm run preview
```

## 🕹️ Contrôles

- Clic sur une tour dans la barre en bas à gauche → sélection du type à construire
- Clic sur le terrain → placer la tour
- Clic sur une tour existante → panneau d'amélioration / vente
- Clic droit → annuler la sélection
- **Lancer la vague** → démarre la vague suivante quand vous êtes prêt

## 🌐 Jouer en ligne

Le jeu est déployé automatiquement sur GitHub Pages via le workflow `.github/workflows/deploy.yml` dès qu'un commit arrive sur `main`.
