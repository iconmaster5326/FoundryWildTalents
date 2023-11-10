import { META_QUALITY_TYPES } from "../util.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-metaquality-sheet.hbs";

export class WTMetaQualitySheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      width: 600,
      height: 600,
      classes: ["wildtalents", "metaquality"],
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
    context.META_QUALITY_TYPES = META_QUALITY_TYPES;
    return context;
  }
}
