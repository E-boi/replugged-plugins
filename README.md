# Replugged plugins

## Prerequisites

- NodeJS
- pnpm: `npm i -g pnpm`
- [Replugged](https://github.com/replugged-org/replugged#installation)

## Development

The code must be rebuilt after every change. You can use `pnpm run watch` to automatically rebuild
the plugin when you save a file.

Building using the script above will automatically install the updated version of the plugin in
Replugged. You can find the plugin folder directories for your OS
[here](https://github.com/replugged-org/replugged#installing-plugins-and-themes).  
If you don't want to install the updated version, append the `--no-install` flag:
`pnpm run build --no-install`.

You can format the code by running `pnpm run lint:fix`. The repository includes VSCode settings to
automatically format on save.

API docs coming soon(tm)

## Distribution

For plugin distribution, Replugged uses bundled `.asar` files. Bundled plugins can be installed to
the same plugin folder as listed above.

This repository includes a GitHub workflow to compile and publish a release with the asar file. To
trigger it, create a tag with the version number preceded by a `v` (e.g. `v1.0.0`) and push it to
GitHub:

```sh
git tag v1.0.0
git push --tags
```

The Replugged updater (coming soon™) will automatically check for updates on the repository
specified in the manifest. Make sure to update it to point to the correct repository!

You can manually compile the asar file with `pnpm run build-and-bundle`.
