"use strict";
exports.__esModule = true;
exports.syncDependencies = exports.diffDependencies = exports.needsPackageSync = exports.diffPackages = exports.loadPackage = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var fs_1 = tslib_1.__importDefault(require("fs"));
var satisfies_1 = tslib_1.__importDefault(require("semver/functions/satisfies"));
var gt_1 = tslib_1.__importDefault(require("semver/functions/gt"));
var coerce_1 = tslib_1.__importDefault(require("semver/functions/coerce"));
var sort_package_json_1 = tslib_1.__importDefault(require("sort-package-json"));
var loadPackage = function (packagePath) {
    var data = utils_1.loadJSON(packagePath);
    return data;
};
exports.loadPackage = loadPackage;
var diffPackages = function (source) {
    var externalSources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        externalSources[_i - 1] = arguments[_i];
    }
    var localPackage = exports.loadPackage(source);
    var localDeps = Object.keys(localPackage.dependencies).reduce(function (deps, packageName) {
        deps[packageName] = {
            source: "local",
            version: localPackage.dependencies[packageName],
            name: packageName
        };
        return deps;
    }, {});
    var conflicts = [];
    var additions = [];
    var needsSync = false;
    externalSources.forEach(function (externalSource) {
        var pkg = exports.loadPackage(externalSource);
        var pkgDeps = pkg.dependencies;
        Object.keys(pkgDeps).forEach(function (packageName) {
            var packageVersion = pkgDeps[packageName];
            if (!localDeps[packageName]) {
                var pack = {
                    source: pkg.name,
                    version: packageVersion,
                    name: packageName
                };
                localDeps[packageName] = pack;
                additions.push(pack);
            }
            else {
                var newVersion = coerce_1["default"](packageVersion).version;
                var currentVersion = coerce_1["default"](localDeps[packageName].version).version;
                var hasSatisfactoryVersion = satisfies_1["default"](newVersion, currentVersion);
                if (!hasSatisfactoryVersion) {
                    var resolution = {};
                    // assume that the latetst version is best
                    var isExternalNewer = gt_1["default"](newVersion, currentVersion);
                    if (isExternalNewer) {
                        resolution.version = newVersion;
                        resolution.source = pkg.name;
                        resolution.name = packageName;
                    }
                    else {
                        resolution = localDeps[packageName];
                    }
                    conflicts.push({
                        source: pkg.name,
                        name: packageName,
                        version: newVersion,
                        resolution: resolution,
                        newer: isExternalNewer
                    });
                    localDeps[packageName] = resolution;
                }
            }
        });
    });
    return { additions: additions, conflicts: conflicts, resolved: localDeps };
};
exports.diffPackages = diffPackages;
var needsPackageSync = function (packageDiff) {
    // Do we need to update the package.json?
    if (packageDiff.additions.length > 0)
        return true;
    if (packageDiff.conflicts.length > 0) {
        var newer = packageDiff.conflicts.filter(function (con) { return con.newer === true; });
        return newer.length > 0;
    }
    return false;
};
exports.needsPackageSync = needsPackageSync;
var diffDependencies = function (sourcePath, syncers) {
    return exports.diffPackages.apply(void 0, tslib_1.__spreadArrays([sourcePath + "/package.json"], syncers.map(function (syncer) { return syncer.root + "/package.json"; })));
};
exports.diffDependencies = diffDependencies;
var syncDependencies = function (sourcePath, syncers) {
    var diff = exports.diffDependencies(sourcePath, syncers);
    var packagePath = sourcePath + "/package.json";
    var pkg = exports.loadPackage(packagePath);
    pkg.dependencies = Object.keys(diff.resolved).reduce(function (deps, packageName) {
        deps[packageName] = diff.resolved[packageName].version;
        return deps;
    }, {});
    var packageJSON = sort_package_json_1["default"](JSON.stringify(pkg, null, 2));
    fs_1["default"].writeFileSync(packagePath, packageJSON, "utf-8");
};
exports.syncDependencies = syncDependencies;
//# sourceMappingURL=packages.js.map