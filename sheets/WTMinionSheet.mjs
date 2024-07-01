import {
  DAMAGE_TYPES,
  MINION_RATINGS,
  lookupItem,
  lookupItemSync,
} from "../util.mjs";
import {
  WTActorSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
  showOrRoll,
} from "./sheets.mjs";

const TEMPLATES = "systems/wildtalents/templates/";
const SHEET_HTML = TEMPLATES + "wt-minion-sheet.hbs";
const SHEET_HTML_LIMITED = TEMPLATES + "wt-actor-sheet-limited.hbs";

export class WTMinionSheet extends WTActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
      classes: ["wildtalents", "minion"],
    });
  }

  /** @override */
  get template() {
    if (this.actor.limited && !game.user.isGM) {
      return SHEET_HTML_LIMITED;
    } else {
      return SHEET_HTML;
    }
  }

  /** @override */
  async getData() {
    const lookup = (id) => lookupItemSync(this.actor, id);

    const context = await super.getData();
    context.documents = {};
    for (const mastery of context.system.masteries) {
      context.documents[mastery.id] = lookup(mastery.id);
    }

    context.MRATINGS_SELECT_OPTIONS = {};
    for (var i = 0; i < MINION_RATINGS.length; i++) {
      context.MRATINGS_SELECT_OPTIONS[i] = MINION_RATINGS[i].name;
    }
    context.DTYPES_SELECT_OPTIONS = {};
    for (var i = 0; i < DAMAGE_TYPES.length; i++) {
      context.DTYPES_SELECT_OPTIONS[i] = DAMAGE_TYPES[i].name;
    }

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const lookup = async (id) => lookupItem(this.actor, id);

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
      return showOrRoll(this.actor, event, this.actor.system.groupSize + "d");
    });
    html.find(".roll-general").on("dragstart", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTMinionGeneral",
          actor: this.actor.id,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-command").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        this.actor,
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollCommand"),
        {
          minHeight: this.actor.system.effectiveCommand,
        }
      );
    });
    html.find(".roll-command").on("dragstart", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTMinionCommand",
          actor: this.actor.id,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-skill").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        this.actor,
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollSkill"),
        {
          minHeight: this.actor.system.effectiveSkill,
        }
      );
    });
    html.find(".roll-skill").on("dragstart", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTMinionSkill",
          actor: this.actor.id,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-demoralization").click(async (event) => {
      event.preventDefault();
      return showOrRoll(
        this.actor,
        event,
        this.actor.system.groupSize + "d",
        game.i18n.localize("WT.Dialog.RollDemoralization"),
        {
          minHeight: this.actor.system.effectiveDemoralization,
        }
      );
    });
    html.find(".roll-demoralization").on("dragstart", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTMinionDemoralization",
          actor: this.actor.id,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });

    html.find(".roll-mastery").click(async (event) => {
      event.preventDefault();
      const index = Number(event.currentTarget.getAttribute("index"));
      const masteryInstance = this.actor.system.masteries[index];
      const skill = await lookup(masteryInstance.id);

      return showOrRoll(
        this.actor,
        event,
        this.actor.system.masteryDice,
        skill.name +
          (masteryInstance.specialty
            ? " (" + masteryInstance.specialty + ")"
            : "")
      );
    });
    html.find(".roll-mastery").on("dragstart", async (event) => {
      const masteryInstance =
        this.actor.system.masteries[
          Number(event.currentTarget.getAttribute("index"))
        ];
      event.originalEvent.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: "WTMinionMastery",
          actor: this.actor.id,
          mastery: masteryInstance,
          quick: event.shiftKey || event.ctrlKey,
        })
      );
    });
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;

    if (itemInfo.type == "Item") {
      const item = await fromUuid(itemInfo.uuid);
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
