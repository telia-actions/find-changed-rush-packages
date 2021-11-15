"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChangeInPath = exports.getTagSha = exports.isMainBranch = exports.getPullRequestNumber = void 0;
const github_1 = require("@actions/github");
const child_process_1 = require("child_process");
const getPullRequestNumber = () => {
    var _a;
    return ((_a = github_1.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number) || 0;
};
exports.getPullRequestNumber = getPullRequestNumber;
const isMainBranch = () => {
    return github_1.context.ref === 'refs/heads/main';
};
exports.isMainBranch = isMainBranch;
const getTagSha = (tagName) => {
    return child_process_1.spawnSync('git', ['rev-list', '-n', '1', tagName]).stdout.toString().trim();
};
exports.getTagSha = getTagSha;
const isChangeInPath = (commitSha, path) => {
    return child_process_1.spawnSync('git', ['diff', '--quiet', commitSha, '--', path]).status ? true : false;
};
exports.isChangeInPath = isChangeInPath;
