"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class URL {
    static getPath(url) {
        var ofs = url.lastIndexOf('/');
        return ofs > 0 ? url.substr(0, ofs + 1) : "";
    }
}
exports.default = URL;
