import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { join } from "path";
import { existsSync } from "fs";
import { cp, mkdir, readdir, rm, writeFile } from "fs/promises";
import { PluginManifest } from "replugged/dist/types/addon";
import { pathToFileURL } from "url";

// const NODE_VERSION = "14";
const CHROME_VERSION = "91";

const globalModules: esbuild.Plugin = {
  name: "globalModules",
  setup: (build) => {
    build.onResolve({ filter: /^react$/ }, (args) => {
      if (args.kind !== "import-statement") return;
      return { path: args.path, namespace: "react" };
    });

    build.onResolve({ filter: /^react-dom$/ }, (args) => {
      if (args.kind !== "import-statement") return;
      return { path: args.path, namespace: "react-dom" };
    });

    build.onResolve({ filter: /^replugged.+$/ }, (args) => {
      if (args.kind !== "import-statement") return;
      return {
        errors: [
          {
            text: `Importing from a path (${args.path}) is not supported. Instead, please import from "replugged" and destructure the required modules.`,
          },
        ],
      };
    });

    build.onResolve({ filter: /^replugged$/ }, (args) => {
      if (args.kind !== "import-statement") return;
      return {
        path: args.path,
        namespace: "replugged",
      };
    });

    build.onLoad({ filter: /.*/, namespace: "replugged" }, () => ({
      contents: "module.exports = window.replugged",
    }));

    build.onLoad({ filter: /.*/, namespace: "react" }, () => ({
      contents: "module.exports = window.replugged.common.React",
    }));

    build.onLoad({ filter: /.*/, namespace: "react-dom" }, () => ({
      contents: "module.exports = window.replugged.common.ReactDOM",
    }));
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
        try {
          const dest = join(CONFIG_PATH, "plugins", id);
          // if (existsSync(dest)) await rm(dest, { recursive: true });
          await cp(join("dist", id), dest, { recursive: true, force: true });
          console.log("Installed updated version");
        } catch (err) {
          console.error(err);
        }
      }
    });
  },
};

const watch = process.argv.includes("--watch");

const common: esbuild.BuildOptions = {
  absWorkingDir: join(__dirname, ".."),
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  format: "esm" as esbuild.Format,
  logLevel: "info",
  watch,
  plugins: [install, globalModules, sassPlugin()],
  platform: "browser",
  target: `chrome${CHROME_VERSION}`,
};

async function buildPlugin(path: string): Promise<void> {
  // dunno why using join on import() errors
  const manifestPath = pathToFileURL(join(path, "manifest.json")).toString();
  const manifest: PluginManifest = { ...(await import(manifestPath)) };

  const targets = [];

  if ("renderer" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.renderer!)],
        outfile: `dist/${manifest.id}/renderer.js`,
      }),
    );

    manifest.renderer = "renderer.js";
  }

  if ("plaintextPatches" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [join(path, manifest.plaintextPatches!)],
        outfile: `dist/${manifest.id}/plaintextPatches.js`,
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
  const plugin = process.argv.find((e) => e.includes("plugin="))?.split("=")?.[1];
  const pluginFolder = await readdir(join(__dirname, "..", "plugins"), { withFileTypes: true });
  if (plugin && pluginFolder.find((e) => e.isDirectory() && e.name === plugin))
    buildPlugin(join(__dirname, "..", "plugins", plugin));
  else if (plugin) {
    console.error(
      `Invalid folder ${plugin}`,
      `\nlist of all valid folders:`,
      pluginFolder.map((p) => p.name),
    );
  } else
    pluginFolder.forEach((dirent) => {
      if (!dirent.isDirectory()) return;
      buildPlugin(join(__dirname, "..", "plugins", dirent.name));
    });
})();
