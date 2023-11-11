import { CAPACITY_TYPES } from "../util.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-focus-sheet.hbs";

export class WTFocusSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      width: 600,
      height: 600,
      classes: ["wildtalents", "focus"],
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
    context.CAPACITY_TYPES = CAPACITY_TYPES;
    return context;
  }
}
