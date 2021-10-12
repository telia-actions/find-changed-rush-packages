import {
  getAllPackages,
  getChangedPackages,
  getLastDeployedRef,
  getTagForDeployment,
  readJson,
} from './utils';
import { setOutput, setFailed, getInput, debug } from '@actions/core';

const run = (): void => {
  try {
    const environment = getInput('environment');
    const tagForDeployment = getTagForDeployment(environment);
    const lastDeployedRef = getLastDeployedRef(environment, tagForDeployment);
    const rushPackages: RushPackage[] = readJson(getInput('rushJsonPath')).projects;

    debug(JSON.stringify(rushPackages, null, 2));

    const changedProjects = lastDeployedRef
      ? getChangedPackages(lastDeployedRef, rushPackages)
      : getAllPackages(rushPackages);

    debug(JSON.stringify(changedProjects, null, 2));

    setOutput('changedProjects', changedProjects);
    setOutput('tag', tagForDeployment);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
