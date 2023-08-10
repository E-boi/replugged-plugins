import chalk from "chalk";
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import prompts from "prompts";
import { PluginManifest } from "replugged/dist/types";

let root: string;

export function getRootDir(): string {
  if (root) return root;

  try {
    root = execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();
    return root;
  } catch (error) {
    // @ts-expect-error not git
    if (error.message.includes("not a git repository")) {
      console.log(chalk.red("You must run this command from within a git repository"));
      process.exit(1);
    }

    // @ts-expect-error failed
    console.error(`Command failed with exit code ${error.status}: ${error.message}`);
    process.exit(1);
  }

  throw new Error("Unreachable");
}

export async function choosePlugin(all?: boolean): Promise<string | undefined> {
  const directory = getRootDir();

  const pluginDir = readdirSync(path.resolve(directory, "plugins"), { withFileTypes: true });
  const list: string[] = [];

  pluginDir.forEach((dirent) => {
    if (dirent.isDirectory()) {
      list.push(dirent.name);
    } else {
      console.log(chalk.red(`"${dirent.name}" is not a directory`));
    }
  });

  const options: prompts.Choice[] = list.map((folder) => ({ title: folder, value: folder }));

  if (all) options.push({ title: "All", value: null });

  const { plugin }: { plugin?: string } = await prompts(
    {
      name: "plugin",
      type: "select",
      message: "Select a plugin to update",
      choices: options,
    },
    { onCancel: promptOnCancel },
  );

  return plugin;
}

export function promptOnCancel(): void {
  console.log(chalk.red("Aborting"));
  process.exit(128); // SIGINT
}

export function getPluginManifest(manifestPath: string): PluginManifest {
  if (!existsSync(manifestPath)) {
    console.log(chalk.red(`"${manifestPath}" not found`));
    process.exit(1);
  }
  const manifestText = readFileSync(manifestPath, "utf8");
  let manifest: PluginManifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    console.log(chalk.red(`"${manifestPath}" is not valid JSON`));
    process.exit(1);
  }

  return manifest;
}
