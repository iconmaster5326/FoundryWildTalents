import { OREDice } from "../rolls/OREDice.mjs";

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
        penaltyDice: options.penaltyDice ?? 0,
        gobbleDice: options.gobbleDice ?? 0,
      }),
      buttons: {
        roll: {
          label: rollText,
          callback: async (html) => {
            const jq = $(html);
            if (options.onRoll) {
              await options.onRoll({
                dice: jq.find('[name="dice"]').attr("value"),
                minWidth: Number(jq.find('[name="minWidth"]').attr("value")),
                minHeight: Number(jq.find('[name="minHeight"]').attr("value")),
                penaltyDice: Number(
                  jq.find('[name="penaltyDice"]').attr("value")
                ),
                gobbleDice: Number(
                  jq.find('[name="gobbleDice"]').attr("value")
                ),
              });
            }
          },
        },
      },
      default: rollText,
      close: async (html) => {
        if (options.onClose) {
          await options.onClose();
        }
      },
    });
  }

  static async show(dice, options = {}) {
    return new Promise(async (resolve, reject) => {
      (await ORERollDialog.create(dice, {
        ...options,
        onRoll: async (result) => {
          if (options.onRoll) {
            await options.onRoll(result);
          }
          resolve(result);
        },
      })).render(true);
    });
  }

  static async showAndChat(dice, options = {}) {
    const result = await ORERollDialog.show(dice, options);
    const diceObject = OREDice.fromString(result.dice)
      .penalize(result.penaltyDice)
      .constrain();
    const roll = await diceObject.roll();
    roll.gobble(result.gobbleDice);
    return roll.showChatMessage();
  }
}