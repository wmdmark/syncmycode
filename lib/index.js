#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var clear_1 = tslib_1.__importDefault(require("clear"));
var commander_1 = require("commander");
var figlet_1 = tslib_1.__importDefault(require("figlet"));
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var path_1 = tslib_1.__importDefault(require("path"));
var config_1 = require("./config");
var helpers_1 = require("./helpers");
var packages_1 = require("./packages");
var sync_1 = require("./sync");
var utils_1 = require("./utils");
var log = console.log;
var warn = chalk_1["default"].keyword("orange");
var watchers;
clear_1["default"]();
console.log(chalk_1["default"].blueBright(figlet_1["default"].textSync("smc", { horizontalLayout: "full" })));
commander_1.program
    .version("0.0.1")
    .description("A CLI for syncing local code")
    .option("-c, --config", "path to config file")
    .options("-s, --skip", "skip setup prompts");
commander_1.program.exitOverride();
try {
    commander_1.program.parse(process.argv);
}
catch (err) {
    // custom processing...
    // console.log("program error: ", err)
}
var baseDir = utils_1.getBasePath();
var configFile = commander_1.program.config || "./sync.json";
var configPath = path_1["default"].join(baseDir, configFile);
var skipPrompts = commander_1.program.skip;
log("\u2714 Loading config from " + path_1["default"].relative(baseDir, configPath));
var config = config_1.loadConfig(configPath);
log("Syncing " + config.syncers.length + " source" + (config.syncers.length !== 1 ? "s" : ""));
config.syncers.forEach(function (sync) { return log(" - " + sync.name); });
var checkPackages = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var packageDiff, upgrades, prompt_1, answers;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                packageDiff = packages_1.diffDependencies(utils_1.getBasePath(), config.syncers);
                if (!packages_1.needsPackageSync(packageDiff)) return [3 /*break*/, 2];
                log(warn("Your local package.json needs to be updated: "));
                log("---------------------");
                if (packageDiff.additions.length) {
                    log("The following dependencies should be added: ");
                    packageDiff.additions.forEach(function (add) {
                        return log("- " + add.name + "@" + add.version);
                    });
                }
                upgrades = packageDiff.conflicts.filter(function (c) { return c.newer; });
                if (upgrades.length) {
                    log("The following dependencies should be upgraded: ");
                    upgrades.forEach(function (up) { return log("- " + up.name + "@" + up.version); });
                }
                prompt_1 = {
                    type: "confirm",
                    name: "update",
                    message: "Would you like to auto update your local package.json?",
                    "default": true
                };
                return [4 /*yield*/, inquirer_1["default"].prompt([prompt_1])];
            case 1:
                answers = _a.sent();
                if (answers.update) {
                    log("Syncing local package.json...");
                    packages_1.syncDependencies(utils_1.getBasePath(), config.syncers);
                    log(chalk_1["default"].green("\u2714 Local package.json updated"));
                }
                return [2 /*return*/, true];
            case 2: return [2 /*return*/];
        }
    });
}); };
var checkLocalChanges = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var diffs, prompt_2, answers;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                diffs = [];
                config.syncers.forEach(function (syncer) {
                    var _a;
                    var differences = (_a = sync_1.diffLocalChanges(syncer)) === null || _a === void 0 ? void 0 : _a.filter(function (d) { return d.isStale === false; });
                    if (differences.length > 0) {
                        log(warn("Found newer local changes made to " + syncer.name));
                        differences.map(function (dif) {
                            var relPath = path_1["default"].relative(utils_1.getBasePath(), dif.path1 + "/" + dif.name1);
                            log("- " + relPath);
                        });
                        diffs.push(differences);
                    }
                });
                if (!diffs.length) return [3 /*break*/, 2];
                prompt_2 = {
                    type: "list",
                    name: "option",
                    message: "What do you want to do?",
                    choices: [
                        { key: "s", name: "Sync local changes back to sources", value: "sync" },
                        {
                            key: "i",
                            name: "Overwrite local changes with source",
                            value: "ignore"
                        },
                    ]
                };
                return [4 /*yield*/, inquirer_1["default"].prompt([prompt_2])];
            case 1:
                answers = _a.sent();
                if (answers.option === "sync") {
                    log("Syncing back to source...");
                    diffs.map(sync_1.syncDiffSetBackToExternal);
                    log("\u2714 Files synced");
                }
                return [2 /*return*/, true];
            case 2: return [2 /*return*/, false];
        }
    });
}); };
var startSync = function () {
    log("Watcher started");
    log("---------------------");
    return Promise.all(config.syncers.map(function (syncer) {
        log(chalk_1["default"].blueBright("\uD83D\uDC40 watching " + syncer.name + " for changes..."));
        return sync_1.watch(syncer);
    }));
};
var checkWorkSpace = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var workspacePath, prompt_3, answers;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                workspacePath = path_1["default"].join(baseDir, "syncmycode.code-workspace");
                if (!!utils_1.fileExists(workspacePath)) return [3 /*break*/, 2];
                prompt_3 = {
                    type: "confirm",
                    name: "createWorkspace",
                    message: "Create Visual Studio Code workspace?",
                    "default": true
                };
                return [4 /*yield*/, inquirer_1["default"].prompt([prompt_3])];
            case 1:
                answers = _a.sent();
                if (answers.createWorkspace) {
                    log("Creating workspace...");
                    helpers_1.createVSCodeWorkspace(config.syncers, workspacePath);
                    log("\u2714 Workspace created");
                }
                _a.label = 2;
            case 2: return [2 /*return*/, true];
        }
    });
}); };
var run = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!skipPrompts) return [3 /*break*/, 2];
                return [4 /*yield*/, checkPackages()];
            case 1:
                _a.sent();
                log("\u2714 Local package.json looks good");
                _a.label = 2;
            case 2: return [4 /*yield*/, checkLocalChanges()];
            case 3:
                _a.sent();
                log("\u2714 Local files are synced");
                if (!!skipPrompts) return [3 /*break*/, 5];
                return [4 /*yield*/, checkWorkSpace()];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, startSync()];
            case 6:
                watchers = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var cleanup = function () {
    if (watchers)
        watchers.forEach(function (watcher) { return watcher.close(); });
};
var exitSignals = [
    "exit",
    "SIGINT",
    "SIGUSR1",
    "SIGUSR2",
    "uncaughtException",
    "SIGTERM",
];
exitSignals.forEach(function (eventType) {
    process.on(eventType, cleanup.bind(null, eventType));
});
run();
// if (!process.argv.slice(2).length) {
//   program.outputHelp()
// }
//# sourceMappingURL=index.js.map