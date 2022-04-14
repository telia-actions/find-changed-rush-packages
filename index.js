const { RushConfiguration, ProjectChangeAnalyzer } = require('@microsoft/rush-lib');

const run = async () => {
  const rushConfiguration = RushConfiguration.loadFromDefaultLocation({
    startingFolder: '../../telia-se',
  });

  const projectChangeAnalyzer = new ProjectChangeAnalyzer(rushConfiguration);

  const changedProjects = await projectChangeAnalyzer.getChangedProjectsAsync({
    targetBranchName: rushConfiguration.repositoryDefaultBranch,
  });

  const recurse = (projects, acc = []) => {
    for (const project of projects) {
      acc.push(project);

      if (project.consumingProjects.size) {
        recurse(project.consumingProjects);
      }
    }
  };

  const result = recurse(changedProjects);

  const distinctNames = new Set(result.map((item) => item.packageName));

  console.log(distinctNames);
};

run();
