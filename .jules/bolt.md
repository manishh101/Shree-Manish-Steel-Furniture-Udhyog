## 2024-07-16 - Memoize Presentational Components
**Learning:** Identified that `ProductCard.tsx`, a frequently rendered presentational component, was not memoized. This caused unnecessary re-renders in parent components like `CleanMostSellingSection.tsx`, which lists multiple product cards.
**Action:** Always check if presentational components, especially those in lists, are wrapped in `React.memo`. Applying this pattern will prevent needless re-renders and improve UI performance.
