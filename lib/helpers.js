"use strict";
/*

*/
exports.__esModule = true;
exports.createVSCodeWorkspace = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var path_1 = tslib_1.__importDefault(require("path"));
var packages_1 = require("./packages");
var createVSCodeWorkspace = function (syncers, workspacePath) {
    var pkg = packages_1.loadPackage(path_1["default"].join(utils_1.getBasePath(), "package.json"));
    var folders = [{ name: pkg.name, path: "./" }];
    syncers.forEach(function (syncer) {
        folders.push({ name: syncer.name, path: syncer.relativeSource });
    });
    var settings = {
        "files.exclude": {
            "**/.git": true,
            "**/.svn": true,
            "**/.hg": true,
            "**/CVS": true,
            "**/.DS_Store": true
        }
    };
    syncers.forEach(function (syncer) {
        var relDestination = path_1["default"].relative(utils_1.getBasePath(), syncer.destination);
        settings["files.exclude"][relDestination] = true;
    });
    var workspace = { folders: folders, settings: settings };
    if (workspacePath)
        utils_1.saveJSON(workspacePath, workspace);
    return workspace;
};
exports.createVSCodeWorkspace = createVSCodeWorkspace;
//# sourceMappingURL=helpers.js.map