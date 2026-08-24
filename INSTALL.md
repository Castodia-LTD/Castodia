# package.json changes

Install Vitest:

```bash
npm install --save-dev vitest
```

Then add these scripts to the existing `scripts` object in `package.json`:

```json
"test": "node scripts/run-tests-with-report.mjs",
"test:watch": "vitest"
```

Your scripts block should end up similar to:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node scripts/run-tests-with-report.mjs",
    "test:watch": "vitest"
  }
}
```

Add the contents of `gitignore-snippet.txt` to the existing `.gitignore`.

Copy:
- `vitest.config.ts` to the repository root
- `scripts/` to the repository root
- `tests/` to the repository root
- `docs/TESTING.md` into the existing `docs/` directory

Then run:

```bash
npm test
```
