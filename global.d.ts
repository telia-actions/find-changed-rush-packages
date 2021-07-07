type DeployCategory = 'aws' | 'k8s';

interface PackageCategories {
  [key: string]: string[];
}

interface RushPackage {
  packageName: string;
  projectFolder: string;
}
