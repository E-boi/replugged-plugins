import esbuild from "esbuild";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { sassPlugin } from "esbuild-sass-plugin";
import { join } from "path";
import { existsSync } from "fs";
import { cp, mkdir, readdir, rm, writeFile } from "fs/promises";
import { Plugin } from "replugged/dist/types/addon";
import { pathToFileURL } from "url";
import { createElement } from "react";

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
      "components",
    ],
    defaultExport: true,
  },
  react: {
    varName: "replugged.common.React",
    namedExports: [
      "useEffect",
      "useState",
      "memo",
      "useCallback",
      "useContext",
      "useMemo",
      "useRef",
      "createElement",
      "useLayoutEffect",
      "useImperativeHandle",
      "forwardRef",
      "createContext",
      "Children",
      "isValidElement",
      "cloneElement",
      "useReducer",
    ],
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
    build.onEnd(async () => {
      const id = build.initialOptions.outfile?.split("/")[1];
      if (!id) return;
      if (!process.argv.includes("--no-install")) {
        const dest = join(CONFIG_PATH, "plugins", id);
        // if (existsSync(dest)) await rm(dest, { recursive: true });
        await cp(join("dist", id), dest, { recursive: true, force: true });
        console.log("Installed updated version");
      }
    });
  },
};

const watch = process.argv.includes("--watch");

const common: esbuild.BuildOptions = {
  absWorkingDir: join(__dirname, ".."),
  bundle: true,
  minify: true,
  sourcemap: true,
  format: "cjs" as esbuild.Format,
  logLevel: "info",
  watch,
  // @ts-expect-error dumb types but works
  plugins: [install, globalExternals(globalModules), sassPlugin()],
};

async function buildPlugin(path: string): Promise<void> {
  // dunno why using join on import() errors
  const manifestPath = pathToFileURL(join(path, "manifest.json")).toString();
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
      }),
    );

    manifest.plaintextPatches = "plaintextPatches.js";
  }

  if (!existsSync(join("dist", manifest.id)))
    await mkdir(`dist/${manifest.id}`, { recursive: true });
  await writeFile(join("dist", manifest.id, "manifest.json"), JSON.stringify(manifest));

  Promise.all(targets);
}

(async () => {
  if (existsSync("dist")) await rm("dist", { recursive: true });
  const plugin = process.argv.find((e) => e.includes("plugin"))?.split("=")?.[1];
  const pluginFolder = await readdir(join(__dirname, "..", "plugins"), { withFileTypes: true });
  if (plugin && pluginFolder.find((e) => e.isDirectory() && e.name === plugin))
    buildPlugin(join(__dirname, "..", "plugins", plugin));
  else
    pluginFolder.forEach((dirent) => {
      if (!dirent.isDirectory()) return;
      buildPlugin(join(__dirname, "..", "plugins", dirent.name));
    });
})();
