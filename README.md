# Wild Talents for Foundry

This is a [Foundry VTT](https://foundryvtt.com/) system for running games of
[Wild Talents](https://preview.drivethrurpg.com/en/product/78394/Wild-Talents-2nd-Edition)
(and other [ORE](https://arcdream.com/home/) games that use similar
rules, such as [The Kerberos Club](https://preview.drivethrurpg.com/en/product/64271/wild-talents-the-kerberos-club)).

This system includes features for:

- keeping track of Wild Talents characters, including support for custom
  silhouettes, custom powers, custom skills, and more
- automatically keeping track of point cost for things like archetypes and
  powers
- rolling dice in the ORE fashion, including interactive dice regrouping and use
  of alternate hard dice
- GM content creation, letting them make new extras and meta-qualities, change
  the default skillset, and keep track of minion groups
- initiative, ordering by Sense in the declare phase

## Installation

Just copy this repository to your Foundry `Data/systems` directory; it's all
ready to go.

Alternatively, paste in the following manifest URL in Foundry's
"Add System" dialog: `https://raw.githubusercontent.com/iconmaster5326/FoundryWildTalents/main/system.json`

## Known Issues

- You can't right-click chat messages in Firefox by default. To fix this on your
  end, you need to go to `about:config` and set
  `layout.css.has-selector.enabled` to `true`, then restart Firefox.

## Special Thanks

- [Arc Dream Publishing](https://arcdream.com/), for the free
  [Essential Edition](https://preview.drivethrurpg.com/en/product/57975/Wild-Talents-Essential-Edition)
  rules
- The official Foundry discord, for considerable assistance
- [The one-roll-engine plugin](https://github.com/shemetz/one-roll-engine), for
  d10 sprites

## Changelog

### Version 1.0.4

* Fix bug with creating new actors in v12.

### Version 1.0.3

* Updated to Foundry 12.

### Version 1.0.2

* Fixed bug with double-clicking on slots.
* Fixed bug where the Set Die Face dialog would refuse to work on some OSes.

### Version 1.0.1

Added compendium support for dragging and dropping Wild Talents items.

### Version 1.0.0

Initial release.
