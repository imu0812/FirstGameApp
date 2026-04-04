# AGENTS.md

## Project overview
This is a Phaser + Vite portrait survival game.
Main gameplay logic lives in `src/game/scenes/MainScene.js`.
UI overlays live in `src/game/scenes/UIScene.js`.

## Coding rules
- Preserve existing gameplay behavior unless explicitly requested.
- Prefer additive changes over refactors.
- Reuse existing spawn, upgrade, and stat-sync logic.
- Do not duplicate combat formulas.
- Keep test/debug tools isolated from production gameplay flow.
- When adding debug features, hide them behind explicit test mode flags.
- Avoid modifying entity classes unless necessary.

## Architecture expectations
- MainScene owns game state and combat flow.
- UIScene owns overlay UI.
- Shared communication should prefer existing event patterns.
- Data-driven lists should come from arsenal/enemy definitions, not hardcoded UI arrays.

## When implementing test mode
- Default off
- No-op when disabled
- Small, isolated touchpoints
- Build must pass after changes