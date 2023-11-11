import { CAPACITY_TYPES, POWER_TYPES, STATS } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-power-sheet.hbs";

export class WTPowerSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "power"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.STATS = STATS;
    context.POWER_TYPES = POWER_TYPES;
    context.CAPACITY_TYPES = CAPACITY_TYPES;
    return context;
  }
}
