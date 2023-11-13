const SHEET_HTML = "systems/wildtalents/templates/ore-set-face-dialog.hbs";

export class ORESetFaceDialog extends Dialog {
  static async create(face, options = {}) {
    const confirmText = game.i18n.localize("WT.ORESetFaceDialog.Confirm");

    return new ORESetFaceDialog({
      title: game.i18n.localize("WT.ORESetFaceDialog.Title"),
      content: await renderTemplate(SHEET_HTML, {
        face: face,
      }),
      buttons: {
        roll: {
          label: confirmText,
          callback: async (html) => {
            const jq = $(html);
            if (options.onConfirm) {
              await options.onConfirm(Number(jq.find('[name="face"]').val()));
            }
          },
        },
      },
      default: confirmText,
      close: async (html) => {
        if (options.onClose) {
          await options.onClose();
        }
      },
    });
  }

  static async show(face, options = {}) {
    return new Promise(async (resolve, reject) => {
      (
        await ORESetFaceDialog.create(face, {
          ...options,
          onConfirm: async (result) => {
            if (options.onConfirm) {
              await options.onConfirm(result);
            }
            resolve(result);
          },
        })
      ).render(true);
    });
  }
}
