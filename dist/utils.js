"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = exports.getAllPackages = exports.getChangedPackages = exports.getLastDeployedRef = exports.getTagForDeployment = void 0;
const fs_1 = __importDefault(require("fs"));
const github_1 = require("./github");
const core_1 = require("@actions/core");
const getTagForDeployment = (environment) => {
    const pullRequestNumber = github_1.getPullRequestNumber();
    if (pullRequestNumber) {
        return `preview-${pullRequestNumber}`;
    }
    if (github_1.isMainBranch()) {
        return environment;
    }
    throw new Error('This action only supports push event on main branch or pull request events');
};
exports.getTagForDeployment = getTagForDeployment;
const getLastDeployedRef = (environment, tagName) => {
    core_1.debug(`Looking for last deployed ref - "${tagName}"`);
    const tagSha = github_1.getTagSha(tagName);
    if (tagSha) {
        return tagSha;
    }
    core_1.debug(`Tag was not found, deploy based on environment - "${environment}" `);
    return github_1.getTagSha(environment);
};
exports.getLastDeployedRef = getLastDeployedRef;
const getChangedPackages = (lastDeployedRef, rushPackages) => {
    return rushPackages.reduce((changes, _package) => {
        if (github_1.isChangeInPath(lastDeployedRef, _package.projectFolder)) {
            updatePackageCategories(_package, changes);
        }
        return changes;
    }, []);
};
exports.getChangedPackages = getChangedPackages;
const getAllPackages = (rushPackages) => {
    return rushPackages.reduce((changes, _package) => {
        updatePackageCategories(_package, changes);
        return changes;
    }, []);
};
exports.getAllPackages = getAllPackages;
const readJson = (jsonPath) => {
    return JSON.parse(fs_1.default
        .readFileSync(jsonPath, 'utf-8')
        .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (jsonKeyOrValue, comment) => comment ? '' : jsonKeyOrValue));
};
exports.readJson = readJson;
const updatePackageCategories = (project, output) => {
    output.push(project);
};
