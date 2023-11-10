const SHEET_HTML = "systems/wildtalents/templates/wt-archetype-sheet.hbs";

export class WTArchetypeSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      width: 600,
      height: 600,
      classes: ["wildtalents", "archetype"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "general",
        },
      ],
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
    return context;
  }
}
