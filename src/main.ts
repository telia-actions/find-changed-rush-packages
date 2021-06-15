import { getAllPackages, getChangedPackages, getLastDeployedRef, readJson } from './utils';
import { setOutput, setFailed, getInput } from '@actions/core';

const run = (): void => {
  try {
    const lastDeployedRef = getLastDeployedRef(getInput('environment'));
    const rushProjects: RushProjects[] = readJson(getInput('rushJsonPath')).projects;
    const outputs = lastDeployedRef
      ? getChangedPackages(lastDeployedRef, rushProjects)
      : getAllPackages(rushProjects);
    for (const [key, value] of Object.entries(outputs)) {
      setOutput(key, value);
    }
  } catch (e) {
    setFailed(e.message);
  }
};

run();
