"use strict";
exports.__esModule = true;
exports.loadConfig = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var path_1 = tslib_1.__importDefault(require("path"));
var loadConfig = function (configPath) {
    var config = utils_1.loadJSON(configPath);
    var syncers = [];
    var baseDir = utils_1.getBasePath();
    config.syncers.forEach(function (sync) {
        var name = sync.name;
        var root = path_1["default"].join(baseDir, sync.root);
        var source = path_1["default"].join(root, sync.source);
        var destination = path_1["default"].join(baseDir, sync.destination, "./" + name);
        syncers.push({ name: name, root: root, source: source, destination: destination });
    });
    return { syncers: syncers };
};
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.js.map