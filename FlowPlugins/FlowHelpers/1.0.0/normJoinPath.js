"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatWindowsRootFolder = (path) => {
    // Remove '.' from end of Windows root folder mapping e.g. 'E:.'
    if (path.length === 3
        && path.charAt(1) === ':'
        && path.charAt(2) === '.') {
        // eslint-disable-next-line no-param-reassign
        path = path.slice(0, -1);
    }
    return path;
};
const normJoinPath = ({ upath, paths, }) => {
    let path = upath.joinSafe(...paths);
    path = formatWindowsRootFolder(path);
    return path;
};
exports.default = normJoinPath;
