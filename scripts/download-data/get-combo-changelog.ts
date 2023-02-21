import newComboDataJSON from "@spellbook/frontend/static/api/combo-data.json";
import type { CompressedApiResponse } from "@spellbook/frontend/lib/api/types";
import get from "../shared/get";

type CompressedKey = keyof CompressedApiResponse;

const CURRENTLY_DEPLOYED_IN_PROD_COMBO_LIST_URL =
  "https://commanderspellbook.com/api/combo-data.json";

const properties = ["c", "i", "p", "s", "r"] as CompressedKey[];
const propertyMap = {
  c: "Cards",
  i: "Color Identity",
  p: "Prerequisites",
  s: "Steps",
  r: "Results",
} as Record<CompressedKey, string>;
const newComboData = newComboDataJSON as CompressedApiResponse[];

function formatCombosForChangelog(combos: CompressedApiResponse[]) {
  return combos.map((combo) => {
    return {
      id: combo.d,
      cards: combo.c,
    };
  });
}

// note: for this to work, this must be run after the combo-data has been
// created locally, but before it gets deployed to prod
export default function createChangelog() {
  return get(CURRENTLY_DEPLOYED_IN_PROD_COMBO_LIST_URL).then((oldData) => {
    const oldComboData = oldData as CompressedApiResponse[];

    const addedCombos = [] as CompressedApiResponse[];
    const deletedCombos = [] as CompressedApiResponse[];
    const updatedCombos = [] as { id: string; change: string }[];

    newComboData.forEach((combo) => {
      const oldCombo = oldComboData.find((oldCombo) => {
        return oldCombo.d === combo.d;
      });

      if (!oldCombo) {
        addedCombos.push(combo);
        return;
      }

      let change = "";

      properties.forEach((key) => {
        const oldValue = JSON.stringify(oldCombo[key]);
        const newValue = JSON.stringify(combo[key]);

        if (oldValue !== newValue) {
          const label = propertyMap[key];
          change += `${label} changed. Before: ${oldCombo[key]} | After: ${combo[key]}\n`;
        }
      });

      if (change) {
        updatedCombos.push({
          id: combo.d,
          change: change.trim(),
        });
      }
    });

    oldComboData.forEach((oldCombo) => {
      const newCombo = newComboData.find((combo) => {
        return combo.d === oldCombo.d;
      });
      if (!newCombo) {
        deletedCombos.push(oldCombo);
      }
    });

    return {
      addedCombos: formatCombosForChangelog(addedCombos),
      deletedCombos: formatCombosForChangelog(deletedCombos),
      updatedCombos,
    };
  });
}