
# What

Sync My Code is an unorthodox but pragmatic way of sharing code between different projects and keeping them in sync. Think of it as a poor man's Bit.dev. 

Here's what it does:

1. Watches and copies external project source code to your local project.
2. Checks your local `package.json` for mismatches and optionally updates it for you.
3. Allows syncing changes from your local copy back to the external projects or reverting them back to the external source.


# Why? 

* We needed a simple way to share our code libraries across multiple projects (and not just in a mono repo). 
* We wanted a "native" developer experience where the library code changes are immediately built/hot reloaded just like local code. 
* We needed a way to push changes from a local copy back to the source.

There may be a better way to do what we're doing here, but I haven't found any with a good [DX](https://css-tricks.com/what-is-developer-experience-dx/) for our small team of devs. That said, this very well may not scale to larger teams.

# How

## 1) Install
```
npm install -g @wmdmark/syncmycode
```

## 2) Setup a config file

Create a `sync.json` file in the root of the project you want to sync code to. For each external project, add an entry to `syncers` section.

Each syncer should have the following fields:

* **root**: Relative path to the root of the project (where the folder that holds it's `package.json`)
* **source**: The relative path (from root) that you want to sync source code from
* **destination**: The folder want to sync the source code to.
* **name (optional)**: A name for the package in your local project. Defaults to the name in package.json.

#### Example: 

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

## 3) Sync!
Simply run

```
syncmycode
```

This will check your source paths as well as recommend any changes that need to be made to your local `package.json` projects to support the synced libraries.

You can also specify a different location for the sync config file by adding a `--config my-sync-config.json`.

## Additonal Tips

- If you happen to edit the local copy of the external code. Simply run `syncmycode` again and it will detect any newer local changes and ask how you want to resolve them.
