import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import path, { join } from "path";
import fs, { existsSync, readdirSync, rmSync } from "fs";
import { Plugin } from "replugged/dist/types/addon";

const NODE_VERSION = "14";
const CHROME_VERSION = "91";

const globalModules = {
  replugged: {
    varName: "replugged",
    namedExports: [
      "Injector",
      "webpack",
      "common",
      "notices",
      "commands",
      "settings",
      "quickCSS",
      "themes",
      "ignition",
      "plugins",
      "util",
      "types",
    ],
    defaultExport: true,
  },
};

const REPLUGGED_FOLDER_NAME = "replugged";
export const CONFIG_PATH = (() => {
  switch (process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(process.env.HOME || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
  }
})();

const install: esbuild.Plugin = {
  name: "install",
  setup: (build) => {
    build.onEnd(() => {
      const id = build.initialOptions.outfile?.split("/")[1];
      if (!id) return;
      if (!process.argv.includes("--no-install")) {
        const dest = join(CONFIG_PATH, "plugins", id);
        if (existsSync(dest)) {
          rmSync(dest, { recursive: true });
        }
        fs.cpSync(join("dist", id), dest, { recursive: true });
        console.log("Installed updated version");
      }
    });
  },
};

const watch = process.argv.includes("--watch");

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, ".."),
  bundle: true,
  minify: false,
  sourcemap: true,
  format: "cjs" as esbuild.Format,
  logLevel: "info",
  watch,
  plugins: [install],
};

async function buildPlugin(path: string): Promise<void> {
  // dunno why using join on import() errors
  const manifestPath = join(path, "manifest.json");
  const manifest: Plugin = { ...(await import(manifestPath)) };

  const targets = [];

  if ("renderer" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.renderer)],
        platform: "browser",
        target: `chrome${CHROME_VERSION}`,
        outfile: `dist/${manifest.id}/renderer.js`,
        format: "esm" as esbuild.Format,
        plugins: [globalExternals(globalModules), install],
      }),
    );

    manifest.renderer = "renderer.js";
  }

  if ("preload" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.preload)],
        platform: "node",
        target: [`node${NODE_VERSION}`, `chrome${CHROME_VERSION}`],
        outfile: `dist/${manifest.id}/preload.js`,
        external: ["electron"],
      }),
    );

    manifest.preload = "preload.js";
  }

  if ("main" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.main)],
        platform: "node",
        target: `node${NODE_VERSION}`,
        outfile: `dist/${manifest.id}/main.js`,
        external: ["electron"],
      }),
    );

    manifest.main = "main.js";
  }

  if ("plaintextPatches" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.plaintextPatches)],
        platform: "browser",
        target: `chrome${CHROME_VERSION}`,
        outfile: `dist/${manifest.id}/plaintextPatches.js`,
        format: "esm" as esbuild.Format,
        plugins: [globalExternals(globalModules), install],
      }),
    );

    manifest.plaintextPatches = "plaintextPatches.js";
  }

  if (!fs.existsSync("dist")) fs.mkdirSync("dist");
  if (!fs.existsSync(join("dist", manifest.id))) fs.mkdirSync(`dist/${manifest.id}`);
  fs.writeFileSync(join("dist", manifest.id, "manifest.json"), JSON.stringify(manifest));

  Promise.all(targets);
}

if (existsSync(`dist`)) rmSync(`dist`, { recursive: true });

readdirSync(join(__dirname, "..", "plugins"), { withFileTypes: true }).forEach((dirent) => {
  if (!dirent.isDirectory()) return;
  buildPlugin(join(__dirname, "..", "plugins", dirent.name));
});
