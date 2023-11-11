import { META_QUALITY_TYPES } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-metaquality-sheet.hbs";

export class WTMetaQualitySheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
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
    context.META_QUALITY_TYPES = META_QUALITY_TYPES;
    return context;
  }
}
