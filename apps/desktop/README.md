# Yixin Studio Desktop

This is a small Electron shell for the local Website Studio. It starts the
Astro dev server on `127.0.0.1`, opens `/admin/` inside a desktop window, and
adds desktop controls for preview, check, build, logs, and publishing selected
Git changes.

## Commands

```sh
npm run desktop
npm run desktop:build
```

`npm run desktop` opens the working app from this repository.

`npm run desktop:build` creates a Windows app folder under
`desktop-dist/Yixin Studio-win32-x64/`. Open `Yixin Studio.exe` inside that
folder.

## Notes

- The app edits this repository; it is not a separate copy of the site.
- The built app assumes the `desktop-dist/` folder remains inside this
  repository. If you move it elsewhere, set `YIXIN_STUDIO_REPO` to the website
  repo folder before launching.
- The app runs Astro from this repository's `node_modules`, so run `npm ci` or
  `npm install` after cloning the repo on a new machine.
- Git publishing still uses the machine's normal Git credentials.
- The local server binds to `127.0.0.1` only.
- Close the app to stop the local Astro server it started.
