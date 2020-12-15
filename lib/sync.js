"use strict";
exports.__esModule = true;
exports.watch = void 0;
var tslib_1 = require("tslib");
var cpx_1 = tslib_1.__importDefault(require("cpx"));
var watch = function (syncer) {
    // TODO: make this blob configurable
    var initialLoad = false;
    var srcBlob = syncer.source + "/**/*.*";
    console.log("watch: ", srcBlob, syncer.destination);
    var watcher = cpx_1["default"].watch(srcBlob, syncer.destination, { clean: true, initialCopy: true }, function () {
        console.log("init watcher");
    });
    watcher.on("copy", function (e) {
        if (initialLoad) {
            console.log(e.srcPath + " -> " + e.dstPath);
        }
    });
    watcher.on("watch-ready", function () {
        console.log("watch ready for " + syncer.name);
        initialLoad = true;
    });
    return Promise.resolve(watcher);
};
exports.watch = watch;
//# sourceMappingURL=sync.js.map