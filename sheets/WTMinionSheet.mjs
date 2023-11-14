import { DAMAGE_TYPES, MINION_RATINGS } from "../util.mjs";
import {
  WTActorSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
  showOrRoll,
} from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-minion-sheet.hbs";

export class WTMinionSheet extends WTActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "minion"],
    });
  }

  /** @override */
  get template() {
    return SHEET_HTML;
  }

  /** @override */
  getData() {
    const lookup = (id) =>
      Item.get(id) || this.actor.getEmbeddedDocument("Item", id);

    const context = super.getData();
    context.documents = {};
    for (const mastery of context.system.masteries) {
      context.documents[mastery.id] = lookup(mastery.id);
    }
    context.MINION_RATINGS = MINION_RATINGS;
    context.DAMAGE_TYPES = DAMAGE_TYPES;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const lookup = (id) =>
      Item.get(id) || this.actor.getEmbeddedDocument("Item", id);

    if (!this.isEditable) return;

    const addRefListListener = generateAddRefSheetListener(this, html);

    addRefListListener(
      "mastery",
      "skill",
      "system.masteries",
      () => this.actor.system.masteries,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewSkill",
        removeDialogText: "WT.Dialog.RemoveSkill",
      }
    );

    html.find(".roll-general").click(async (event) => {
      event.preventDefault();
      return showOrRoll(event, this.actor.system.groupSize + "d");
    });
    html.find(".roll-command").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollCommand"),
        {
          minHeight: this.actor.system.effectiveCommand,
        }
      );
    });
    html.find(".roll-skill").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollSkill"),
        {
          minHeight: this.actor.system.effectiveSkill,
        }
      );
    });
    html.find(".roll-demoralization").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollDemoralization"),
        {
          minHeight: this.actor.system.effectiveDemoralization,
        }
      );
    });
    html.find(".roll-mastery").click(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const masteryInstance = this.actor.system.masteries[index];
      const skill = lookup(masteryInstance.id);
      const face = 6 - Math.floor(this.actor.system.groupSize / 5);

      return showOrRoll(
        event,
        face > 0 ? "2f" + face + "d" : "0d",
        skill.name +
          (masteryInstance.specialty
            ? " (" + masteryInstance.specialty + ")"
            : "")
      );
    });
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;

    if (itemInfo.type == "Item") {
      const itemID = itemInfo.uuid.slice("Item.".length);
      const item = Item.get(itemID);
      if (!item) return;

      const addRefListDropHandler = generateAddRefListDropHandler(this, item);

      await addRefListDropHandler(
        undefined,
        "mastery",
        "skill",
        "system.masteries",
        () => this.actor.system.masteries
      );
    }
  }
}