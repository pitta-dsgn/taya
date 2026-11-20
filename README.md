# Taya — guided analytics prototype

A static, build-free presentation of personalized financial analytics. The interface is based on the Taya Figma file and the supplied T-Bank references. All financial data and dialogues are fictional; the prototype has no AI backend and makes no bank requests.

## Experience

1. **Automatic introduction:** Home → scroll → Operations overview → Expenses → animated donut → Taya offer. The 13-second timeline supports pause, resume and replay. No app input is needed during this stage.
2. **Interactive Taya:** choose a problem outside the phone. A Russian keyboard appears and the request is typed and submitted automatically. The visitor then chooses replies, reviews transactions and scrolls the complete conversation. Back minimizes the existing chat into a floating bubble; reopening restores the conversation and scroll position.
3. **Completion:** finish after reviewing a result, then choose another problem or restart the entire introduction.

Scenarios cover salary reconciliation, a large purchase excluded from analytics, and confirmed friend refunds linked to a shared bill. Selection changes recalculate totals. Original transaction history remains unchanged.

## Scenario B — Figma / Итог

The large-purchase scenario starts with a general request, then lets the visitor confirm DNS and airfare exclusions. The November preview expands into a read-only period with category filters and a full transaction list; excluded operations remain visible. Six-month comparison supports month selection, detailed bar/donut views, a swipeable donut carousel, July travel-agency exclusion/restoration, and free-text amount thresholds. All sums are calculated from the shared ledger in `personal-model.mjs`.

## Development

Node.js 20+, no dependencies:

```sh
npm run dev
npm test
```

Open http://localhost:5173. `node build-preview.mjs` produces a standalone `preview.html` for offline viewing.

## Publication

GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).

https://pitta-dsgn.github.io/taya/

SVG icons and illustrations live in `assets/icons/`. Navigation, chart controls and merchant icons are exported from the source Figma components. The phone uses an explicit SF Pro / native Apple system font stack. On platforms without these fonts, the installed sans-serif fallback is used; proprietary Apple font files are not redistributed.

## Validation

`npm test` covers financial reconciliation, routing, escaping user input, immutable chat history, automatic draft punctuation, playback pause/resume and cancellation. Scenario B also has application-level routing checks, exclusion/restoration arithmetic, category filtering and threshold tests. The current B update has not been visually checked in a browser.
