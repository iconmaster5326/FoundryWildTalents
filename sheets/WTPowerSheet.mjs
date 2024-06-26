import {
  CAPACITY_TYPES,
  POWER_TYPES,
  QUALITY_TYPES,
  STATS,
  lookupItem,
  lookupItemSync,
} from "../util.mjs";
import { WTItemSheet } from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-power-sheet.hbs";

export class WTPowerSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "power"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    context.documents = {};
    if (context.system.skill.id) {
      context.documents[context.system.skill.id] = lookupItemSync(
        this.item,
        context.system.skill.id
      );
    }
    for (const quality of context.system.qualities) {
      for (const extra of quality.extras) {
        context.documents[extra.id] = lookupItemSync(this.item, extra.id);
      }
    }

    context.POWERTYPES_SELECT_OPTIONS = {};
    for (var i = 0; i < POWER_TYPES.length; i++) {
      context.POWERTYPES_SELECT_OPTIONS[i] = POWER_TYPES[i].name;
    }
    context.QTYTYPES_SELECT_OPTIONS = {};
    for (var i = 0; i < QUALITY_TYPES.length; i++) {
      context.QTYTYPES_SELECT_OPTIONS[i] = QUALITY_TYPES[i].name;
    }

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

    html.find(".skillslot").dblclick(async (event) => {
      event.preventDefault();
      (await lookupItem(this.item.system.skill.id)).sheet.render(true);
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

    html.find(".add-extra").click((event) => {
      event.preventDefault();
      const newArray = this.item.system.qualities.slice();
      const i = Number(event.currentTarget.getAttribute("index"));
      newArray[i].extras = newArray[i].extras.concat([{}]);
      this.item.update({
        "system.qualities": newArray,
      });
    });
    html.find(".remove-extra").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      const newArray = this.item.system.qualities.slice();
      newArray[i].extras = newArray[i].extras
        .slice(0, j)
        .concat(newArray[i].extras.slice(j + 1));
      this.item.update({
        "system.qualities": newArray,
      });
    });

    html.find(".extraslot").dblclick(async (event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index1"));
      const j = Number(event.currentTarget.getAttribute("index2"));
      (
        await lookupItem(this.item.system.qualities[i].extras[j].id)
      ).sheet.render(true);
    });
    ContextMenu.create(this, html, ".extraslot", [
      {
        name: game.i18n.localize("WT.Dialog.RemoveExtra"),
        icon: "",
        condition: (slot) => {
          const i = Number(slot.attr("index1"));
          const j = Number(slot.attr("index2"));
          return this.item.system.qualities[i].extras[j].id;
        },
        callback: async (slot) => {
          const i = Number(slot.attr("index1"));
          const j = Number(slot.attr("index2"));
          const newArray = this.item.system.qualities.slice();
          newArray[i].extras[j] = {
            ...newArray[i].extras[j],
            id: undefined,
          };
          this.item.update({
            "system.qualities": newArray,
          });
        },
      },
    ]);
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;
    const item = await fromUuid(itemInfo.uuid);
    if (!item) return;
    if (item.type == "skill" && this.item.system.powerType == 1) {
      this.item.update({ "system.skill.id": item.id });
    } else if (item.type == "extra") {
      if (item.system.fociOnly) return;
      const slots = document
        .elementsFromPoint(event.pageX, event.pageY)
        .filter((e) => e.classList.contains("extraslot"));
      const qualities = document
        .elementsFromPoint(event.pageX, event.pageY)
        .filter((e) => e.classList.contains("quality"));
      if (slots.length) {
        const i = Number(slots[0].getAttribute("index1"));
        const j = Number(slots[0].getAttribute("index2"));
        const newArray = this.item.system.qualities.slice();
        newArray[i].extras[j] = {
          ...newArray[i].extras[j],
          id: item.id,
        };
        this.item.update({
          "system.qualities": newArray,
        });
      } else if (qualities.length) {
        const i = Number(qualities[0].getAttribute("index"));
        const newArray = this.item.system.qualities.slice();
        newArray[i].extras = newArray[i].extras.concat([{ id: item.id }]);
        this.item.update({
          "system.qualities": newArray,
        });
      }
    }
  }
}
