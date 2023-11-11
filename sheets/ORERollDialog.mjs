const SHEET_HTML = "systems/wildtalents/templates/ore-roll-dialog.hbs";

export class ORERollDialog extends Dialog {
  static async create(dice, options = {}) {
    const rollText = game.i18n.localize("WT.ORERollDialog.Confirm");

    return new ORERollDialog({
      title: game.i18n.localize("WT.ORERollDialog.Title"),
      content: await renderTemplate(SHEET_HTML, {
        dice: dice,
        minWidth: options.minWidth ?? 2,
        minHeight: options.minHeight ?? 1,
      }),
      buttons: {
        roll: {
          label: rollText,
          callback: async (html) => {},
        },
      },
      default: rollText,
      close: async (html) => {},
    });
  }
}
