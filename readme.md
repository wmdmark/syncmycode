# Local Sync

---

## What

Local Sync is an unorthodox, but pragmattic way of sharing code between different projects and keeping them in sync. Think of it as a poor man's Bit.dev. 

Here's what it does:

1. *Copies* external project source code to your local project. This is the actual source code, not build files.
2. Checks `package.json` mis-matches and let's you know what you need to add or correct.
3. Allows copying local changes back to the external projects so you can sync them back


## Why? 

We needed a simple way to share our own code libraries across multiple repos (and not just in a monorepo). We wanted a "native" developer experience where changes in the library code are immedietly built/hot reloaded just like local code. We needed a way to push changes from a local copy back to the source.

There may be better way to do what we're doing here but I haven't found any that have a good DX (Developer Experience) for our small team of devs. That said, this very well may not scale to larger teams.

# How

```
npm install -g local-sync
```

### Setup a config file

Create a `local-sync.json` file in the root of the project you want to sync code to. For each external project and an entry to `syncers` section

```json
{
  "syncers": [
    {
      "name": "codex-core",
      "root": "../codex/packages/core",
      "source": "src",
      "destination": "./external"
    },
    {
      "name": "fellow-kit",
      "root": "../fellow-kit",
      "source": "src",
      "destination": "./external"
    }
  ]
}
```

### Verify Setup

```
local-sync --verify
```

This will check your source paths as well as reccommend any changes that need to be made to your local `package.json` projects to support the synced libraries.
