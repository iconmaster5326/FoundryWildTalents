import { CAPACITY_TYPES, POWER_TYPES, STATS } from "../util.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-power-sheet.hbs";

export class WTPowerSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      width: 600,
      height: 600,
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
    const actorData = this.item.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.rollData = context.item.getRollData();
    context.STATS = STATS;
    context.POWER_TYPES = POWER_TYPES;
    context.CAPACITY_TYPES = CAPACITY_TYPES;
    return context;
  }
}
