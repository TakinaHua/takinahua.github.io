# Barry Hua — Portfolio

React + TypeScript + Vite portfolio with a responsive galaxy hero, three projects, and experience at Avary AI, Parasoft, and BigBet Research.

## Run locally

```sh
npm install
npm run dev
```

## Check

```sh
npm run build
npm run lint
npm run preview
```

Content lives in src/App.tsx; styles in src/App.css and src/index.css. The selected hero image is public/images/galaxy-hero.webp.

Each feature is saved in a separate Git commit. Use git log --oneline to browse milestones and git show COMMIT to review a change.

Résumé download and Atlas demo URL remain to be configured. EV Optimization is marked as coming soon. Fire and Ice links to its public repository; email and LinkedIn come from the résumé.

## Publish future changes

1. Open this folder and run `git pull --ff-only` before editing (with a clean working tree).
2. Run `npm run dev` and make one feature change. Review it in the browser.
3. Run `npm run lint` and `npm run build`. Optionally inspect the production build with `npm run preview`.
4. Run `git diff`, stage the relevant files with `git add`, and save one commit per feature using `git commit -m "feat: describe the change"`.
5. When ready to publish, run `git push origin main`.
6. Check the Deploy portfolio workflow in GitHub Actions. Once it succeeds, open https://takinahua.github.io/ and verify the update.

A commit saves work locally; pushing main publishes it automatically through GitHub Actions. Do not commit node_modules, dist, credentials, or private documents. GitHub Pages uses the compiled Vite output, not Jekyll.

To undo a published change while preserving history, use `git revert <commit>` and push the resulting commit. Avoid force-pushing.
