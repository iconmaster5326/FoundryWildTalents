import { OREDice } from "../rolls/OREDice.mjs";

const SHEET_HTML = "systems/wildtalents/templates/ore-roll-dialog.hbs";

function parseEDFs(s, n) {
  const edfs = s.split(",").map((ss) => Number(ss.trim()));
  const stars = new Array(Math.max(0, n - edfs.length));
  stars.fill("*");
  return edfs.concat(stars);
}

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
        expertDiceFaces: options.expertDiceFaces ?? "",
      }),
      buttons: {
        roll: {
          label: rollText,
          callback: async (html) => {
            const jq = $(html);
            const dice = jq.find('[name="dice"]').val();
            const diceObject = OREDice.fromString(dice);
            if (options.onRoll) {
              await options.onRoll({
                dice: dice,
                minWidth: Number(jq.find('[name="minWidth"]').val()),
                minHeight: Number(jq.find('[name="minHeight"]').val()),
                penaltyDice: Number(jq.find('[name="penaltyDice"]').val()),
                gobbleDice: Number(jq.find('[name="gobbleDice"]').val()),
                flavor: options.flavor,
                expertDiceFaces: parseEDFs(
                  jq.find('[name="expertDiceFaces"]').val(),
                  diceObject.expertDice
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
      (
        await ORERollDialog.create(dice, {
          ...options,
          onRoll: async (result) => {
            if (options.onRoll) {
              await options.onRoll(result);
            }
            resolve(result);
          },
        })
      ).render(true);
    });
  }

  static async showAndChat(dice, options = {}) {
    const result = await ORERollDialog.show(dice, options);
    const diceObject = OREDice.fromString(result.dice)
      .penalize(result.penaltyDice)
      .constrain();
    const roll = await diceObject.roll({
      ...options,
      gobbled: result.gobbleDice,
      minWidth: result.minWidth,
      minHeight: result.minHeight,
      expertDiceFaces: result.expertDiceFaces,
    });
    return roll.showChatMessage();
  }
}
