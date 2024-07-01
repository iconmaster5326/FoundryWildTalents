import { META_QUALITY_TYPES } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-metaquality-sheet.hbs";

export class WTMetaQualitySheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "metaquality"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    context.MQ_TYPES_SELECT_OPTIONS = {};
    for (var i = 0; i < META_QUALITY_TYPES.length; i++) {
      context.MQ_TYPES_SELECT_OPTIONS[i] = META_QUALITY_TYPES[i].name;
    }

    return context;
  }
}
