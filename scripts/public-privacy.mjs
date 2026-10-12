import { readdir, readFile, realpath, rm } from "node:fs/promises";
import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { privatePublicAssets } from "../src/config/privacy.mjs";

const publicReferenceExtensions = new Set([".html", ".xml", ".json", ".js", ".css"]);
const generatedReferenceExtensions = new Set([".js", ".mjs", ".css", ".json"]);

function isInside(directory, target) {
  const path = relative(directory, target);
  return Boolean(path) && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function assertInside(directory, target) {
  if (!isInside(directory, target)) {
    throw new Error(`Refusing to remove an artifact outside the build directory: ${target}`);
  }
}

function publicAssetPath(directory, asset) {
  if (typeof asset !== "string" || !asset) {
    throw new Error("Private public assets must have a nonempty path.");
  }

  // Accept public-root paths with or without a leading slash. Resolve and
  // validate the complete target before any deletion, including on Windows.
  const target = resolve(directory, asset.replace(/^\//, ""));
  assertInside(directory, target);
  return target;
}

async function removeArtifact(directory, target) {
  assertInside(directory, target);

  let physicalTarget;
  try {
    physicalTarget = await realpath(target);
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }

  // A path that is lexically inside dist can still escape through a symlink.
  // Fail the build instead of deleting through such a path.
  assertInside(directory, physicalTarget);
  await rm(target, { recursive: true, force: true });
  return true;
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = resolve(directory, entry.name);
    // Generated output should contain real files. Reject links instead of
    // following them or silently leaving an uninspected downloadable artifact.
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing to inspect a symlink in the build directory: ${target}`);
    }
    if (entry.isDirectory()) files.push(...await collectFiles(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

async function readText(path) {
  const contents = await readFile(path);
  // Only the known text extensions are inspected, and binary data is ignored.
  return contents.includes(0) ? "" : contents.toString("utf8");
}

/** Remove private downloads and generated assets unreachable from public pages. */
export async function prunePublicArtifacts(directory) {
  const buildDirectory = await realpath(resolve(
    directory instanceof URL ? fileURLToPath(directory) : directory,
  ));
  const removedPrivateAssets = [];
  const removedGeneratedAssets = [];

  // Studio and drafts are local-only, just as they were in the deployment job.
  const privateTargets = new Set(
    [...privatePublicAssets, "admin", "drafts"].map((asset) => publicAssetPath(buildDirectory, asset)),
  );
  for (const target of privateTargets) {
    if (await removeArtifact(buildDirectory, target)) removedPrivateAssets.push(target);
  }

  const generatedDirectory = resolve(buildDirectory, "_astro");
  const allFiles = await collectFiles(buildDirectory);
  const generatedFiles = allFiles.filter((path) => isInside(generatedDirectory, path));
  const assetsByBasename = new Map();
  for (const path of generatedFiles) {
    const name = basename(path);
    if (!assetsByBasename.has(name)) assetsByBasename.set(name, []);
    assetsByBasename.get(name).push(path);
  }

  const retained = new Set();
  const pending = [];
  const retainReferences = (text) => {
    for (const [name, paths] of assetsByBasename) {
      if (!text.includes(name)) continue;
      // Duplicate basenames are ambiguous, so retain all matching assets.
      for (const path of paths) {
        if (retained.has(path)) continue;
        retained.add(path);
        pending.push(path);
      }
    }
  };

  // Start only from retained public output. Starting from every generated JS
  // file would keep private tools and their corpora alive after page rewrites.
  for (const path of allFiles) {
    if (isInside(generatedDirectory, path)) continue;
    if (publicReferenceExtensions.has(extname(path).toLowerCase())) {
      retainReferences(await readText(path));
    }
  }

  // Follow imports, CSS URLs, and other references transitively. Images, fonts,
  // and other binary assets can be retained but are never read as dependencies.
  for (let index = 0; index < pending.length; index += 1) {
    const path = pending[index];
    if (generatedReferenceExtensions.has(extname(path).toLowerCase())) {
      retainReferences(await readText(path));
    }
  }

  for (const path of generatedFiles) {
    if (!retained.has(path) && await removeArtifact(buildDirectory, path)) {
      removedGeneratedAssets.push(path);
    }
  }

  return { removedPrivateAssets, removedGeneratedAssets };
}

export default function publicPrivacy() {
  return {
    name: "public-privacy",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        await prunePublicArtifacts(dir);
      },
    },
  };
}
