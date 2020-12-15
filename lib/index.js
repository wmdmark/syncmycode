#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var clear_1 = tslib_1.__importDefault(require("clear"));
var commander_1 = require("commander");
var figlet_1 = tslib_1.__importDefault(require("figlet"));
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var packages_1 = require("./packages");
var sync_1 = require("./sync");
// import program from "commander"
var env = process.env.NODE_ENV;
clear_1["default"]();
console.log(chalk_1["default"].red(figlet_1["default"].textSync("local-sync", { horizontalLayout: "full" })));
commander_1.program
    .version("0.0.1")
    .description("A CLI for syncing local code")
    .command("start", "start the watcher")
    .option("-c, --config", "path to config file");
commander_1.program.exitOverride();
try {
    commander_1.program.parse(process.argv);
}
catch (err) {
    // custom processing...
    console.log("program error: ", err);
}
var syncers = [];
var baseDir = env === "development" ? path_1["default"].join(__dirname, "../") : __dirname;
var config = commander_1.program.config || "./local-sync.json";
var configPath = path_1["default"].join(baseDir, config);
var loadConfig = function (configPath) {
    var rawData = fs_1["default"].readFileSync(configPath);
    var config = JSON.parse(rawData);
    config.syncers.forEach(function (sync) {
        var name = sync.name;
        var root = path_1["default"].join(baseDir, sync.root);
        var source = path_1["default"].join(root, sync.source);
        var destination = path_1["default"].join(baseDir, sync.destination, "./" + name);
        syncers.push({ name: name, root: root, source: source, destination: destination });
    });
};
clear_1["default"]();
loadConfig(configPath);
var depsDiff = packages_1.diffDependencies(syncers);
// TODO: if addtions or conflicts show message
var watchSyncers = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(syncers.map(sync_1.watch))];
            case 1:
                _a.sent();
                console.log("init watchers");
                return [2 /*return*/];
        }
    });
}); };
watchSyncers();
if (!process.argv.slice(2).length) {
    commander_1.program.outputHelp();
}
//# sourceMappingURL=index.js.map