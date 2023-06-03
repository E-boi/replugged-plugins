import asar from "@electron/asar";
import { copyFileSync, existsSync, readFileSync, readdirSync } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";
import { PluginManifest } from "replugged/dist/types/addon";

readdirSync("dist", { withFileTypes: true }).forEach(async (direct) => {
  if (!direct.isDirectory()) return;
  const manifest = JSON.parse(
    readFileSync(join("dist", direct.name, "manifest.json"), "utf-8"),
  ) as PluginManifest;
  const output = `bundle/${manifest.id}`;

  if (!existsSync("bundle")) {
    try {
      await mkdir("bundle");
    } catch {}
  }

  asar.createPackage(join("dist", direct.name), `${output}.asar`);
  copyFileSync(`dist/${direct.name}/manifest.json`, `${output}.json`);
});
