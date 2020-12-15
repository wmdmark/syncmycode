"use strict";
exports.__esModule = true;
exports.getBasePath = exports.loadJSON = void 0;
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var env = process.env.NODE_ENV;
var loadJSON = function (filePath) {
    var data = fs_1["default"].readFileSync(filePath, "utf-8");
    return JSON.parse(data);
};
exports.loadJSON = loadJSON;
var getBasePath = function () {
    return path_1["default"].resolve("./");
};
exports.getBasePath = getBasePath;
//# sourceMappingURL=utils.js.map