import { CAPACITY_TYPES, POWER_TYPES, STATS } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-extra-sheet.hbs";

export class WTExtraSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "extra"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  getData() {
    const context = super.getData();
    return context;
  }
}
