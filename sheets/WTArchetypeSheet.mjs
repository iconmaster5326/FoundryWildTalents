import { DEFAULT_SILHOUETTE, lookupItemSync } from "../util.mjs";
import {
  WTItemSheet,
  generateAddRefListDropHandler,
  generateAddRefSheetListener,
} from "./sheets.mjs";

const SHEET_HTML = "systems/wildtalents/templates/wt-archetype-sheet.hbs";

export class WTArchetypeSheet extends WTItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: SHEET_HTML,
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
  async getData() {
    const context = await super.getData();

    context.documents = {};
    for (const mq of context.system.sources) {
      context.documents[mq.id] = lookupItemSync(this.item, mq.id);
    }
    for (const mq of context.system.permissions) {
      context.documents[mq.id] = lookupItemSync(this.item, mq.id);
    }
    for (const mq of context.system.intrinsics) {
      context.documents[mq.id] = lookupItemSync(this.item, mq.id);
    }
    for (const power of context.system.hyperstats) {
      context.documents[power.id] = lookupItemSync(this.item, power.id);
    }
    for (const power of context.system.hyperskills) {
      context.documents[power.id] = lookupItemSync(this.item, power.id);
    }
    for (const power of context.system.miracles) {
      context.documents[power.id] = lookupItemSync(this.item, power.id);
    }

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    const addRefListListener = generateAddRefSheetListener(this, html);

    addRefListListener(
      "source",
      "metaquality",
      "system.sources",
      () => this.item.system.sources,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewSource",
        // createWith: { system: { metaQualityType: 0 } },
        removeDialogText: "WT.Dialog.RemoveSource",
      }
    );
    addRefListListener(
      "permission",
      "metaquality",
      "system.permissions",
      () => this.item.system.permissions,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewPermission",
        // createWith: { system: { metaQualityType: 1 } },
        removeDialogText: "WT.Dialog.RemovePermission",
      }
    );
    addRefListListener(
      "intrinsic",
      "metaquality",
      "system.intrinsics",
      () => this.item.system.intrinsics,
      {
        // creatable: true,
        // newInstanceName: "WT.Dialog.NewIntrinsic",
        // createWith: { system: { metaQualityType: 2 } },
        removeDialogText: "WT.Dialog.RemoveIntrinsic",
      }
    );
    addRefListListener(
      "hyperstat",
      "power",
      "system.hyperstats",
      () => this.item.system.hyperstats,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewHyperstat",
        createWith: { system: { powerType: 0 } },
        removeDialogText: "WT.Dialog.RemoveHyperstat",
      }
    );
    addRefListListener(
      "hyperskill",
      "power",
      "system.hyperskills",
      () => this.item.system.hyperskills,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewHyperskill",
        createWith: { system: { powerType: 1 } },
        removeDialogText: "WT.Dialog.RemoveHyperskill",
      }
    );
    addRefListListener(
      "miracle",
      "power",
      "system.miracles",
      () => this.item.system.miracles,
      {
        creatable: true,
        newInstanceName: "WT.Dialog.NewMiracle",
        createWith: { system: { powerType: 2 } },
        removeDialogText: "WT.Dialog.RemoveMiracle",
      }
    );

    html.find(".add-body-part").click((event) => {
      event.preventDefault();
      this.item.update({
        "system.silhouette": this.item.system.silhouette.concat([{}]),
      });
    });
    html.find(".remove-body-part").click((event) => {
      event.preventDefault();
      const i = Number(event.currentTarget.getAttribute("index"));
      const newArray = this.item.system.silhouette
        .slice(0, i)
        .concat(this.item.system.silhouette.slice(i + 1));
      this.item.update({
        "system.silhouette": newArray,
      });
    });

    ContextMenu.create(this, html, ".silhouette-header", [
      {
        name: game.i18n.localize("WT.Dialog.RestoreSilhouette"),
        icon: "",
        condition: (_) => true,
        callback: async (_) => {
          this.actor.update({
            "system.silhouette": DEFAULT_SILHOUETTE,
          });
        },
      },
    ]);
  }

  /** @override */
  async _onDropItem(event, itemInfo) {
    if (!this.isEditable) return;

    if (itemInfo.type == "Item") {
      const item = await fromUuid(itemInfo.uuid);
      if (!item) return;

      const addRefListDropHandler = generateAddRefListDropHandler(this, item);

      await addRefListDropHandler(
        "metaqualities",
        "source",
        "metaquality",
        "system.sources",
        () => this.item.system.sources,
        { filter: (item) => item.system.metaQualityType == 0 }
      );
      await addRefListDropHandler(
        "metaqualities",
        "permission",
        "metaquality",
        "system.permissions",
        () => this.item.system.permissions,
        { filter: (item) => item.system.metaQualityType == 1 }
      );
      await addRefListDropHandler(
        "metaqualities",
        "intrinsic",
        "metaquality",
        "system.intrinsics",
        () => this.item.system.intrinsics,
        { filter: (item) => item.system.metaQualityType == 2 }
      );
      await addRefListDropHandler(
        undefined,
        "hyperstat",
        "power",
        "system.hyperstats",
        () => this.item.system.hyperstats,
        { filter: (item) => item.system.powerType == 0 }
      );
      await addRefListDropHandler(
        undefined,
        "hyperskill",
        "power",
        "system.hyperskills",
        () => this.item.system.hyperskills,
        { filter: (item) => item.system.powerType == 1 }
      );
      await addRefListDropHandler(
        undefined,
        "miracle",
        "power",
        "system.miracles",
        () => this.item.system.miracles,
        { filter: (item) => item.system.powerType == 2 }
      );
    }
  }
}
