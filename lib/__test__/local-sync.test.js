"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var packages_1 = require("../packages");
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var config_1 = require("../config");
var sync_1 = require("../sync");
var sleep = function (time) { return new Promise(function (r) { return setTimeout(r, time); }); };
describe("Local Sync", function () {
    var sourcePath = path_1["default"].join(__dirname, "./data/source-project");
    var externalPath = path_1["default"].join(__dirname, "./data/external-project");
    var currentPackageJSON = fs_1["default"].readFileSync(sourcePath + "/package.json", "utf-8");
    var buttonSourcePath = externalPath + "/src/Button.js";
    var buttonSourceCode = fs_1["default"].readFileSync(buttonSourcePath, "utf-8");
    var config;
    afterAll(function (done) {
        fs_1["default"].rmdirSync(sourcePath + "/lib", { recursive: true });
        fs_1["default"].writeFileSync(sourcePath + "/package.json", currentPackageJSON, "utf-8");
        fs_1["default"].writeFileSync(buttonSourcePath, buttonSourceCode, "utf-8");
        done();
    });
    it("should parse config", function () {
        config = config_1.loadConfig(sourcePath + "/local-sync.json");
        expect(config).toBeDefined();
        expect(config.syncers.length).toEqual(1);
        expect(config.syncers[0].name).toEqual("ui-lib");
    });
    it("should load a package", function () {
        var pkg = packages_1.loadPackage(sourcePath + "/package.json");
        expect(pkg).toBeDefined();
        expect(pkg.name).toEqual("some-website");
    });
    it("should diff packages", function () {
        var remotePackagePath = externalPath + "/package.json";
        var diff = packages_1.diffPackages(sourcePath + "/package.json", remotePackagePath);
        expect(diff).toBeDefined();
        expect(diff.conflicts.length).toEqual(3);
        expect(diff.additions.length).toEqual(1);
        // the local version has newest copy
        expect(diff.conflicts[0].resolution.source).toEqual("local");
    });
    it("should sync package.json", function () {
        var sourcePackagePath = sourcePath + "/package.json";
        var remotePackagePath = externalPath + "/package.json";
        packages_1.syncDependencies(sourcePath, config.syncers);
        var diff = packages_1.diffPackages(sourcePackagePath, remotePackagePath);
        // 2 here because the react versions still don't match (the ones from UI are older)
        // TODO: figure out how this should work?
        expect(diff.conflicts.length).toEqual(2);
        expect(diff.additions.length).toEqual(0);
        expect(packages_1.needsPackageSync(diff)).toEqual(false);
    });
    var buttonLocalPath = sourcePath + "/lib/ui-lib/Button.js";
    it("should sync external files", function (done) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var watcher;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sync_1.watch(config.syncers[0])];
                case 1:
                    watcher = _a.sent();
                    expect(fs_1["default"].existsSync(buttonLocalPath)).toEqual(true);
                    watcher.close();
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should detect source changes", function () {
        var code = fs_1["default"].readFileSync(buttonLocalPath, "utf-8");
        var updatedCode = code.replace("// TODO: ", "// DONE: ");
        fs_1["default"].writeFileSync(buttonLocalPath, updatedCode, "utf-8");
        var diffs = sync_1.diffLocalChanges(config.syncers[0]);
        expect(diffs.length).toEqual(1);
    });
    it("should copy source changes back to external", function () {
        var diffs = sync_1.diffLocalChanges(config.syncers[0]);
        var results = sync_1.syncDiffSetBackToExternal(diffs);
        expect(results.length).toEqual(1);
        diffs = sync_1.diffLocalChanges(config.syncers[0]);
        expect(diffs.length).toEqual(0);
    });
});
//# sourceMappingURL=local-sync.test.js.map