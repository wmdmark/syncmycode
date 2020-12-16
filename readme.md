# Local Sync

---

## What

Local Sync is an unorthodox but pragmatic way of sharing code between different projects and keeping them in sync. Think of it as a poor man's Bit.dev. 

Here's what it does:

1. *Copies* external project source code to your local project (the actual source code, not build files.)
2. Checks `package.json` mismatches and lets you know what you need to add or correct.
3. Allows copying local changes back to the external projects so you can sync them back


## Why? 

We needed a simple way to share our code libraries across multiple projects (and not just in a mono repo). We wanted a "native" developer experience where the library code changes are immediately built/hot reloaded just like local code. We needed a way to push changes from a local copy back to the source.

There may be a better way to do what we're doing here, but I haven't found any with a good DX (Developer Experience) for our small team of devs. That said, this very well may not scale to larger teams.

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
      "root": "../fire-ui",
      "source": "src",
      "destination": "./lib"
    },
    {
      "root": "../fire-utils",
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

This will check your source paths as well as recommend any changes that need to be made to your local `package.json` projects to support the synced libraries.
