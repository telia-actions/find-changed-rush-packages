type DeployCategory = 'aws' | 'k8s';

interface ActionOutputs {
  aws: string[];
  k8s: string[];
}

interface RushProjects {
  packageName: string;
  projectFolder: string;
}
