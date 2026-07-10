/** Werk seed.ts bij na NL red-cell import (alleen bekende paden). */

import fs from "node:fs";
import path from "node:path";
import type { RedNlPatch } from "./import-red-nl-translations";

const SEED_PATH = path.join(process.cwd(), "scripts", "seed.ts");

export function updateSeedFromPatches(
  patches: RedNlPatch[],
  baseline: Map<string, string>,
): { updated: string[]; skipped: string[] } {
  let content = fs.readFileSync(SEED_PATH, "utf8");
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const patch of patches) {
    const was = baseline.get(patch.referentie) ?? "";

    if (patch.referentie.startsWith("product-nl-")) {
      skipped.push(`${patch.referentie} (product-stub in seed heeft geen ${patch.fieldPath})`);
      continue;
    }

    if (patch.fieldPath === "body") {
      if (!content.includes("Mlldpe")) {
        skipped.push(`${patch.referentie} (geen Mlldpe in seed.ts)`);
        continue;
      }
      content = content.replaceAll("Mlldpe", "mLLdpe");
      updated.push(patch.referentie);
      continue;
    }

    if (!was) {
      skipped.push(`${patch.referentie} (geen was-waarde in baseline)`);
      continue;
    }

    const escaped = was.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    if (!re.test(content)) {
      skipped.push(`${patch.referentie} (was-waarde "${was}" niet in seed.ts)`);
      continue;
    }

    content = content.replace(re, patch.wordt);
    updated.push(patch.referentie);
  }

  fs.writeFileSync(SEED_PATH, content, "utf8");
  return { updated, skipped };
}
