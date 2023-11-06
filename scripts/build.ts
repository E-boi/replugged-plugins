import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import path from "path";
import { existsSync, readdirSync } from "fs";
import { cp, mkdir, writeFile } from "fs/promises";
import { PluginManifest } from "replugged/dist/types/addon";
import { reload } from "./watcher";
import { choosePlugin, getPluginManifest, getRootDir } from "./utils";
import chalk from "chalk";

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
      return path.join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return path.join(
        process.env.HOME || "",
        "Library",
        "Application Support",
        REPLUGGED_FOLDER_NAME,
      );
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return path.join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return path.join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
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
          const dest = path.join(CONFIG_PATH, "plugins", id);
          // if (existsSync(dest)) await rm(dest, { recursive: true });
          await cp(path.join("dist", id), dest, { recursive: true, force: true });
          await reload(id);
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
  absWorkingDir: path.join(__dirname, ".."),
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

async function buildPlugin(folderPath: string): Promise<void> {
  const manifestPath = path.resolve(getRootDir(), folderPath, "manifest.json");
  const manifest: PluginManifest = getPluginManifest(manifestPath);

  const targets = [];

  if ("renderer" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [path.join(folderPath, manifest.renderer!)],
        outfile: `dist/${manifest.id}/renderer.js`,
      }),
    );

    manifest.renderer = "renderer.js";
  }

  if ("plaintextPatches" in manifest) {
    targets.push(
      esbuild.build({
        ...common,
        entryPoints: [path.join(folderPath, manifest.plaintextPatches!)],
        outfile: `dist/${manifest.id}/plaintextPatches.js`,
      }),
    );

    manifest.plaintextPatches = "plaintextPatches.js";
  }

  if (!existsSync(path.join("dist", manifest.id)))
    await mkdir(`dist/${manifest.id}`, { recursive: true });
  await writeFile(path.join("dist", manifest.id, "manifest.json"), JSON.stringify(manifest));

  Promise.all(targets);
}

(async () => {
  const plugin = await choosePlugin(true);
  const directory = getRootDir();

  if (!plugin) {
    const pluginDir = readdirSync(path.resolve(directory, "plugins"), { withFileTypes: true });

    pluginDir.forEach((dirent) => {
      if (dirent.isDirectory()) {
        buildPlugin(path.resolve(directory, "plugins", dirent.name));
      } else {
        console.log(chalk.red(`skipping "${dirent.name}" because it's not a directory`));
      }
    });
    return;
  }

  buildPlugin(path.resolve(directory, "plugins", plugin!));
})();
