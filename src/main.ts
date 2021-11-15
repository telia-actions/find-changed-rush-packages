import { getChangedPackages, getLastDeployedRef, getTagForDeployment, readJson } from './utils';
import { info, setOutput, setFailed, getInput, debug } from '@actions/core';

const run = (): void => {
  try {
    const environment = getInput('environment');
    const rushJsonPath = getInput('rushJsonPath');

    info('Merge base testing');

    const tagForDeployment = getTagForDeployment(environment);
    const lastDeployedRef = getLastDeployedRef(tagForDeployment);
    const rushPackages: RushPackage[] = readJson(rushJsonPath).projects;

    debug(JSON.stringify(rushPackages, null, 2));

    const changedProjects = getChangedPackages(lastDeployedRef, rushPackages);

    debug(JSON.stringify(changedProjects, null, 2));

    setOutput('changedProjects', changedProjects);
    setOutput('tag', tagForDeployment);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
