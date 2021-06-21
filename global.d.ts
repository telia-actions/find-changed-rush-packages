type DeployCategory = 'aws' | 'k8s';

interface PackageCategories {
  aws: string[];
  k8s: string[];
}

interface RushPackage {
  packageName: string;
  projectFolder: string;
}
