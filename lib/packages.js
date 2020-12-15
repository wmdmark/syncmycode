"use strict";
exports.__esModule = true;
exports.diffDependencies = void 0;
var utils_1 = require("./utils");
var semverSatisfies = require("semver/functions/satisfies");
var semverGt = require("semver/functions/gt");
var coerce = require("semver/functions/coerce");
var loadDeps = function (packagePath) {
    var data = utils_1.loadJSON(packagePath);
    return data.dependencies;
};
var diffDependencies = function (syncers) {
    var localDeps = loadDeps(utils_1.getBasePath() + "/package.json");
    var conflicts = [];
    var additions = [];
    var deps = Object.keys(localDeps).reduce(function (deps, packageName) {
        deps[packageName] = {
            source: "local",
            version: localDeps[packageName],
            name: packageName
        };
        return deps;
    }, {});
    syncers.forEach(function (syncer) {
        var packagePath = syncer.root + "/package.json";
        var pkgDeps = loadDeps(packagePath);
        Object.keys(pkgDeps).forEach(function (packageName) {
            var packageVersion = pkgDeps[packageName];
            if (!deps[packageName]) {
                var pkg = {
                    source: syncer.name,
                    version: packageVersion,
                    name: packageName
                };
                deps[packageName] = pkg;
                additions.push(pkg);
            }
            else {
                var newVersion = coerce(packageVersion).version;
                var currentVersion = coerce(deps[packageName].version).version;
                var hasSatisfactoryVersion = semverSatisfies(newVersion, currentVersion);
                if (!hasSatisfactoryVersion) {
                    var resolution = {};
                    // assume that the latetst version is best
                    if (semverGt(newVersion, currentVersion)) {
                        // The current version is gra
                        resolution.version = newVersion;
                        resolution.source = syncer.name;
                        resolution.name = packageName;
                    }
                    else {
                        resolution = deps[packageName];
                    }
                    conflicts.push({
                        source: syncer.name,
                        name: packageName,
                        version: newVersion,
                        resolution: resolution
                    });
                }
            }
        });
    });
    return { conflicts: conflicts, additions: additions, deps: deps };
};
exports.diffDependencies = diffDependencies;
//# sourceMappingURL=packages.js.map