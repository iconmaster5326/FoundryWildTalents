import { STATS } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-skill-sheet.hbs";

export class WTSkillSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "skill"],
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
