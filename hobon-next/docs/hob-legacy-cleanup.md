# HOB-LEGACY-DATA + HOB-DANGLING-METADATA — Cleanup Log

**Datum:** 15 aug 2026  
**Status:** Live

## Writes (Sanity)

### HOB-LEGACY-DATA (safe subset)
- product-nl-kratzakken: unset(['body', 'lead'])
- product-fr-kratzakken: unset(['body', 'lead'])
- Reason: beide hebben heroHeadline ✓
- Skipped (no heroHeadline): boterfolie, dolav × NL/FR/EN (6 docs)

### HOB-DANGLING-METADATA (both deleted)
- 199edf78-fe1e-4a0a-96df-46f83f86e3c2 (old FR header)
- daed35c9-a440-4f54-8f91-ceb96cd19845 (old FR faalkosten)
- Fallback: patterned _id still works (headerNavigation-fr, insight-fr-faalkosten-…)

## Next phase
- Add heroHeadline to remaining 6 → unset body+lead
- Or: remove legacy fallback from ProductTemplate (post-launch)
