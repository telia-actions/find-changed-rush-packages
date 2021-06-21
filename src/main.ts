import { getAllPackages, getChangedPackages, getLastDeployedRef, readJson } from './utils';
import { setOutput, setFailed, getInput } from '@actions/core';

const run = (): void => {
  try {
    const lastDeployedRef = getLastDeployedRef(getInput('environment'));
    const rushPackages: RushPackage[] = readJson(getInput('rushJsonPath')).projects;
    const packagesByCategory = lastDeployedRef.sha
      ? getChangedPackages(lastDeployedRef.sha, rushPackages)
      : getAllPackages(rushPackages);
    for (const [category, packages] of Object.entries(packagesByCategory)) {
      setOutput(category, packages);
    }
    setOutput('tag', lastDeployedRef.tag);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
