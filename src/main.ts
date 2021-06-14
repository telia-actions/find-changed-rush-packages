import { getPackagesToDeploy, getLastDeployedRef, readJson } from './utils';
import { setOutput, setFailed, getInput } from '@actions/core';

const run = (): void => {
  try {
    const rushProjects: RushProjects[] = readJson(getInput('rushJsonPath')).projects;
    const lastDeployedRef = getLastDeployedRef(getInput('environment'));
    const outputs = getPackagesToDeploy(lastDeployedRef, rushProjects);
    for (const [key, value] of Object.entries(outputs)) {
      setOutput(key, value);
    }
  } catch (e) {
    setFailed(e.message);
  }
};

run();
