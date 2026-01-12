## 2024-07-25 - Initial Optimization: Memoize Cloudinary URL Calculation

**Learning:** The `OptimizedImage` component was recalculating the Cloudinary URL on every render, causing unnecessary computational overhead. While the impact per render is small, the component's widespread use across the application makes this a meaningful optimization.

**Action:** Applied `useMemo` to the `optimizedSrc` calculation in `components/OptimizedImage.tsx`. This ensures the URL is only recomputed when its dependencies (`imgSrc`, `hasError`, `cloudinaryOptimizations`) change. This avoids redundant computations during re-renders, leading to a small but broad performance improvement.