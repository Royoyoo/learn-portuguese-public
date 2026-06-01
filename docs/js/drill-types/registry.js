import { fillGapDrillType } from "./fill-gap.js";
import { multipleChoiceDrillType } from "./multiple-choice.js";
import { wordBlocksDrillType } from "./word-blocks.js";

export const drillTypes = {
  [fillGapDrillType.type]: fillGapDrillType,
  [multipleChoiceDrillType.type]: multipleChoiceDrillType,
  [wordBlocksDrillType.type]: wordBlocksDrillType,
};

export function getDrillType(type) {
  return drillTypes[type] || null;
}
