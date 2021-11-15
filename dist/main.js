"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const rush_lib_1 = require("@microsoft/rush-lib");
const node_core_library_1 = require("@rushstack/node-core-library");
const core_1 = require("@actions/core");
const utils_1 = require("./utils");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    try {
        const environment = core_1.getInput('environment');
        const tagForDeployment = utils_1.getTagForDeployment(environment);
        core_1.info('Using bundle analyzer');
        const rushConfiguration = rush_lib_1.RushConfiguration.loadFromDefaultLocation({
            startingFolder: process.cwd(),
        });
        const terminalProvider = new node_core_library_1.ConsoleTerminalProvider();
        const terminal = new node_core_library_1.Terminal(terminalProvider);
        const projectChangeAnalyzer = new rush_lib_1.ProjectChangeAnalyzer(rushConfiguration);
        const changedProjects = yield projectChangeAnalyzer.getChangedProjectsAsync({
            targetBranchName: rushConfiguration.repositoryDefaultBranch,
            terminal,
        });
        const projectMap = new Map();
        try {
            for (var changedProjects_1 = __asyncValues(changedProjects), changedProjects_1_1; changedProjects_1_1 = yield changedProjects_1.next(), !changedProjects_1_1.done;) {
                const changedProject = changedProjects_1_1.value;
                for (const consumer of changedProject.consumingProjects) {
                    projectMap.set(consumer.packageName, {
                        packageName: consumer.packageName,
                        projectFolder: consumer.projectFolder,
                        reviewCategory: consumer.reviewCategory,
                        shouldPublish: consumer.shouldPublish,
                    });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (changedProjects_1_1 && !changedProjects_1_1.done && (_a = changedProjects_1.return)) yield _a.call(changedProjects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const result = projectMap.values();
        // eslint-disable-next-line no-console
        console.log(result);
        core_1.setOutput('changedProjects', Array.from(result));
        core_1.setOutput('tag', tagForDeployment);
    }
    catch (e) {
        core_1.setFailed(e.message);
    }
});
run();
