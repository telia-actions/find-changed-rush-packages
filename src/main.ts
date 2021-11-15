import { RushConfiguration, ProjectChangeAnalyzer } from '@microsoft/rush-lib';
import { Terminal, ConsoleTerminalProvider } from '@rushstack/node-core-library';
import { info, setOutput, setFailed, getInput } from '@actions/core';
import { getTagForDeployment } from './utils';

const run = async (): Promise<void> => {
  try {
    const environment = getInput('environment');
    const tagForDeployment = getTagForDeployment(environment);

    info('Using bundle analyzer');

    const rushConfiguration = RushConfiguration.loadFromDefaultLocation({
      startingFolder: process.cwd(),
    });

    const terminalProvider = new ConsoleTerminalProvider();

    const terminal = new Terminal(terminalProvider);

    const projectChangeAnalyzer = new ProjectChangeAnalyzer(rushConfiguration);

    const changedProjects = await projectChangeAnalyzer.getChangedProjectsAsync({
      targetBranchName: rushConfiguration.repositoryDefaultBranch,
      terminal,
    });

    const projectMap = new Map();

    for await (const changedProject of changedProjects) {
      projectMap.set(changedProject.packageName, changedProject);

      for (const consumer of changedProject.consumingProjects) {
        projectMap.set(consumer.packageName, consumer);
      }
    }

    const result = Array.from(
      projectMap.values(),
      ({ packageName, projectFolder, reviewCategory, shouldPublish }) => ({
        packageName,
        projectFolder,
        reviewCategory,
        shouldPublish,
      })
    );

    setOutput('changedProjects', result);
    setOutput('tag', tagForDeployment);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
