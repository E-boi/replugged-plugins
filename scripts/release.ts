import { writeFileSync } from "fs";
import path from "path";
import prompts from "prompts";
import semver from "semver";
import chalk from "chalk";
import { execSync } from "child_process";
import { choosePlugin, getPluginManifest, getRootDir, promptOnCancel } from "./utils";

/**
 * Prompt a confirmation message and exit if the user does not confirm.
 *
 * @param {string} message
 * @param {boolean} [initial]
 */
async function confirmOrExit(message: string, initial = false): Promise<void> {
  const { doContinue } = await prompts(
    {
      type: "confirm",
      name: "doContinue",
      message: chalk.yellow(message),
      initial,
    },
    { onCancel: promptOnCancel },
  );

  if (!doContinue) {
    console.log(chalk.red("Aborting"));
    process.exit(0);
  }
}

/**
 * Run a command and return the output.
 *
 * @param {string} command
 * @param {boolean} [exit = true] Exit if the command fails
 * @returns {string}
 */
function runCommand(command: string, exit = true): string {
  try {
    const result = execSync(command, {
      encoding: "utf8",
      cwd: getRootDir(),
    });
    return result;
  } catch (error) {
    // @ts-expect-error idk
    if (!exit) return error.stdout;
    // @ts-expect-error idk
    console.error(error.message);
    process.exit(1);
  }
  throw new Error("Unreachable");
}

export async function release(): Promise<void> {
  const directory = getRootDir();

  const status = runCommand("git status --porcelain");
  const isClean = !status.trim();
  if (!isClean) await confirmOrExit("Working directory is not clean. Continue?");

  const plugin = (await choosePlugin()) as string;
  const manifestPath = path.resolve(directory, "plugins", plugin, "manifest.json");
  const manifest = getPluginManifest(manifestPath);

  // Prompt for version

  const { version } = manifest;
  let nextVersion;

  const isValidSemver = Boolean(semver.valid(version));
  if (isValidSemver) {
    const nextPatch = semver.inc(version, "patch");
    const nextMinor = semver.inc(version, "minor");
    const nextMajor = semver.inc(version, "major");

    ({ nextVersion } = await prompts(
      {
        type: "select",
        name: "nextVersion",
        message: "Version",
        choices: [
          {
            title: `Patch: v${nextPatch}`,
            value: nextPatch,
          },
          {
            title: `Minor: v${nextMinor}`,
            value: nextMinor,
          },
          {
            title: `Major: v${nextMajor}`,
            value: nextMajor,
          },
          {
            title: "Custom",
            value: null,
          },
        ],
      },
      { onCancel: promptOnCancel },
    ));
  }
  if (!nextVersion) {
    ({ nextVersion } = await prompts(
      {
        type: "text",
        name: "nextVersion",
        message: isValidSemver ? "Custom Version" : "Version",
        validate: (value) => {
          if (!value.trim()) return "Version is required";

          return true;
        },
      },
      { onCancel: promptOnCancel },
    ));
  }

  nextVersion = nextVersion.trim();
  const isNewValidSemver = Boolean(semver.valid(nextVersion));
  if (isValidSemver) {
    // If the existing version is not semver, don't bother with semver checks
    if (isNewValidSemver) {
      if (semver.lte(nextVersion, version)) {
        await confirmOrExit(`Version ${nextVersion} is not greater than ${version}. Continue?`);
      }
      const cleaned = semver.clean(nextVersion);
      if (cleaned !== nextVersion) {
        let { clean } = await prompts({
          type: "confirm",
          name: "clean",
          message: `Convert ${nextVersion} to cleaned version ${cleaned}?`,
          initial: true,
        });
        if (clean) nextVersion = cleaned;
      }
    } else {
      await confirmOrExit(`Version ${nextVersion} is not a valid semver. Continue?`);
    }
  }

  // Update manifest.json and package.json
  manifest.version = nextVersion;

  // Write manifest.json and package.json (indent with 2 spaces and keep trailing newline)
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  // Stage changes
  runCommand(`git add ${path.join("plugins", plugin, "manifest.json")}`);

  // Commit changes
  const { message } = await prompts(
    {
      type: "text",
      name: "message",
      message: "Commit message",
      initial: `[${manifest.name}] Release v${nextVersion}`,
      validate: (value) => {
        if (!value.trim()) return "Commit message is required";

        return true;
      },
    },
    { onCancel: promptOnCancel },
  );

  // Pick tag name
  const existingTags = runCommand("git tag --list").split("\n").filter(Boolean);

  const { tagName } = await prompts(
    {
      type: "text",
      name: "tagName",
      message: "Tag name",
      initial: `v${nextVersion}-${manifest.name.split(" ").join("_")}`,
      validate: (value) => {
        if (!value.trim()) return "Tag name is required";

        if (existingTags.includes(value)) return `Tag ${value} already exists`;

        return true;
      },
    },
    { onCancel: promptOnCancel },
  );

  const hasSigningKey = Boolean(runCommand("git config --get user.signingkey", false).trim());
  const commitSigningEnabled =
    runCommand("git config --get commit.gpgsign", false).trim() === "true";
  const tagSigningEnabled = runCommand("git config --get tag.gpgsign", false).trim() === "true";

  let sign = false;
  if (hasSigningKey && (!commitSigningEnabled || !tagSigningEnabled)) {
    ({ sign } = await prompts({
      type: "confirm",
      name: "sign",
      message: "Sign commit and tag?",
      initial: true,
    }));
  }

  // Commit changes
  runCommand(`git commit${sign ? " -S" : ""} -m "${message}"`);

  // Tag commit
  runCommand(`git tag${sign ? " -s" : ""} -a -m "${message}" "${tagName}"`);

  // Push changes
  await confirmOrExit("Push changes to remote?", true);

  runCommand("git push");

  // And the tag
  runCommand("git push --tags");
}

release();
