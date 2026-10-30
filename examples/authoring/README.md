# Authoring example

A small content folder for the `standin` CLI: a library (`library.json` and its PNGs) and one map template. It is the shape that `content validate` and `content apply` expect, and the keys and names in it are the ones the template spec uses. The tests check that the folder validates and that the spec compiles against a library made from `library.json`.

```text
examples/authoring/
  library.json                 2 tilesets, 5 assets (a door family with 3 variants)
  tilesets/floor.png           2 floor tiles
  tilesets/brick.png           the 8 pieces of the wall style "Brick" (caps on top, bases below)
  assets/*.png                 crate, desk, chair (with a seat), monitor, door and its variants
  templates/small-office.yaml  a spec of kind template
  templates/small-office.png   its thumbnail
```

## What it shows

- A floor tileset with a `tileMeta` category for each tile, and a wall tileset whose tile meta names a style with its eight pieces (`style`, `edges`, `top`, `solid` and a `solidMask` on the side pieces).
- A `DECORATION` asset (it needs a `category`), a `DESK`, a `CHAIR` with a `SIT` action and its seat, a `MONITOR` that sits on a surface, and a door whose variants are the rotations `DEG_90`, `DEG_180` and `DEG_270` of the base.
- A spec that finds the tilesets by their **name** (`Example floor`, `Example brick`) and the assets by their **key**. A tileset has a `key` in `library.json`, but a spec cannot use it.

The PNGs are flat colors made for this example, a few hundred bytes each. They have no artistic value on purpose: replace them with your own art.

## Try it

Check the folder on this machine. It sends nothing and needs no token:

```sh
pnpm -s standin content validate examples/authoring
```

With an instance and a service token (`library:read`, `library:write`, `templates:read`, `templates:write`, `maps:read`, `maps:write`; see `skills/author-map/SKILL.md`):

```sh
pnpm -s standin content apply examples/authoring --dry-run
pnpm -s standin content apply examples/authoring
pnpm -s standin library list
pnpm -s standin template list --size-tier XS
```

The template is created as a draft. Add `--publish` to `content apply` to publish it (its thumbnail is already in the folder). Running `content apply` again changes nothing: the library says `unchanged` and the template `exists`, because applying a spec twice would put its content twice.

To use the same spec on a map of your own, the library entries have to exist first: apply the folder, then `pnpm -s standin map apply ./your-spec.yaml --map <map-id> --dry-run`.

## License

Everything in this folder (the images, `library.json`, the spec and this file) is licensed under [CC BY 4.0](LICENSE): use, copy, modify and redistribute it, including commercially and on a self-hosted instance, as long as you give credit:

> Standin examples by kauavitorrodrigues, licensed under CC BY 4.0.

The code of the repository is under the [AGPL-3.0](../../LICENSE) and the `ee/` directory has its [own license](../../ee/LICENSE). Neither changes the license of this folder.
