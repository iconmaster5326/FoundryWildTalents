import { CAPACITY_TYPES, POWER_TYPES, QUALITY_TYPES, STATS } from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-power-sheet.hbs";

export class WTPowerSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
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

    context.documents = {};
    if (context.system.skill.id) {
      context.documents[context.system.skill.id] = Item.get(
        context.system.skill.id
      );
    }
    for (const quality of context.system.qualities) {
      for (const extra of quality.extras) {
        context.documents[extra.id] = Item.get(extra.id);
      }
    }

    context.STATS = STATS;
    context.POWER_TYPES = POWER_TYPES;
    context.QUALITY_TYPES = QUALITY_TYPES;
    context.CAPACITY_TYPES = CAPACITY_TYPES;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    html.find(".add-quality").click((event) => {
      event.preventDefault();
      this.item.update({
        "system.qualities": this.item.system.qualities.concat([{}]),
      });
    });
    html.find(".remove-quality").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.item.system.qualities
        .slice(0, i)
        .concat(this.item.system.qualities.slice(i + 1));
      this.item.update({
        "system.qualities": newArray,
      });
    });
    ContextMenu.create(this, html, ".skillslot", [
      {
        name: game.i18n.localize("WT.Dialog.RemoveSkill"),
        icon: "",
        condition: (slot) => {
          return this.item.system.skill.id;
        },
        callback: async (slot) => {
          this.item.update({
            "system.skill.id": "",
          });
        },
      },
    ]);
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;
    const itemID = itemInfo.uuid.slice("Item.".length);
    const item = Item.get(itemID);
    if (!item) return;
    if (item.type == "skill" && this.item.system.powerType == 1) {
      this.item.update({ "system.skill.id": itemID });
    } else if (item.type == "extra") {
    }
  }
}
