import {
  getAllPackages,
  getChangedPackages,
  getLastDeployedRef,
  getTagForDeployment,
  readJson,
} from './utils';
import { setOutput, setFailed, getInput } from '@actions/core';

const run = (): void => {
  try {
    const environment = getInput('environment');
    const tagForDeployment = getTagForDeployment(environment);
    const lastDeployedRef = getLastDeployedRef(environment, tagForDeployment);
    const rushPackages: RushPackage[] = readJson(getInput('rushJsonPath')).projects;
    const packagesByCategory = lastDeployedRef
      ? getChangedPackages(lastDeployedRef, rushPackages)
      : getAllPackages(rushPackages);
    for (const [category, packages] of Object.entries(packagesByCategory)) {
      setOutput(category, packages);
    }
    setOutput('tag', tagForDeployment);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
