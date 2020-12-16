"use strict";
exports.__esModule = true;
exports.syncDiffSetBackToExternal = exports.syncDiff = exports.diffLocalChanges = exports.watch = void 0;
var tslib_1 = require("tslib");
var cpx_1 = tslib_1.__importDefault(require("cpx"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var dir_compare_1 = require("dir-compare");
var utils_1 = require("./utils");
var watch = function (syncer) {
    return new Promise(function (resolve, reject) {
        var initialLoad = false;
        // TODO: blob should be configurable
        var srcBlob = syncer.source + "/**/*.*";
        var watcher = cpx_1["default"].watch(srcBlob, syncer.destination, {
            clean: true,
            initialCopy: true
        });
        watcher.on("copy", function (e) {
            if (initialLoad) {
                var relPath = path_1["default"].relative(utils_1.getBasePath(), e.dstPath);
                console.log("\uD83D\uDD04 " + e.dstPath);
            }
        });
        watcher.on("watch-error", function (error) {
            reject(error);
        });
        watcher.on("watch-ready", function () {
            initialLoad = true;
            return resolve(watcher);
        });
    });
};
exports.watch = watch;
var isEmptyDir = function (path) {
    var files = fs_1["default"].readdirSync(path);
    return files.length === 0;
};
var diffLocalChanges = function (syncer) {
    var _a;
    var local = syncer.destination;
    var external = syncer.source;
    if (!fs_1["default"].existsSync(local))
        return [];
    var diff = dir_compare_1.compareSync(local, external, {
        excludeFilter: ".DS_Store",
        compareContent: true
    });
    var differences = (_a = diff.diffSet) === null || _a === void 0 ? void 0 : _a.filter(function (d) { return d.state !== "equal"; }).filter(function (d) {
        // filter out external empty dirs
        if (d.type1 === "missing") {
            if (d.type2 === "directory") {
                var dirPath = d.path2 + "/" + d.name2;
                return !isEmptyDir(dirPath);
            }
        }
        // filter out internal empty dirs
        if (d.type2 === "missing") {
            if (d.type1 === "directory") {
                var dirPath = d.path1 + "/" + d.name1;
                return !isEmptyDir(dirPath);
            }
        }
        return true;
    }).map(function (d) {
        d.isStale = new Date(d.date1) < new Date(d.date2);
        return d;
    });
    return differences;
};
exports.diffLocalChanges = diffLocalChanges;
var syncDiff = function (diffSet) {
    var source = diffSet.path1 + "/" + diffSet.name1;
    var destination = diffSet.path2 + "/" + diffSet.name2;
    fs_1["default"].copyFileSync(source, destination);
    return { source: source, destination: destination };
};
exports.syncDiff = syncDiff;
var syncDiffSetBackToExternal = function (differences) {
    return differences.map(exports.syncDiff);
};
exports.syncDiffSetBackToExternal = syncDiffSetBackToExternal;
//# sourceMappingURL=sync.js.map