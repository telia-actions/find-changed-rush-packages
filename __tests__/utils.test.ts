import { getAllPackages, getChangedPackages, getLastDeployedRef, readJson } from '../src/utils';
import * as github from '../src/github';
import mockedRushJson from '../__mocks__/rush';

jest.mock('@actions/core');

const mockedCommitSha = 'mocksha';
const mockedEnvironment = 'mockenv';
const mockedPullRequestNumber = 1;
const mockedGetTagSHACallback = (tag: string): string => {
  if (tag === mockedEnvironment) {
    return mockedCommitSha;
  }
  return '';
};

describe('Utilities', () => {
  describe('readRushJson method', () => {
    describe('given that rush.json exist', () => {
      it('should return valid rush.json file', () => {
        const rushJson = readJson('./__mocks__/rush.json');
        expect(rushJson).toEqual(mockedRushJson);
      });
    });
    describe('given that rush.json does not exist', () => {
      it('should throw an error', () => {
        expect(() => readJson('')).toThrowError('ENOENT: no such file or directory, open');
      });
    });
  });
  describe('getLastDeployedRef method', () => {
    describe('given that pull request number exist', () => {
      beforeEach(() => {
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValueOnce(mockedPullRequestNumber);
      });
      describe('given that PR branch has deployment tag', () => {
        beforeEach(() => {
          jest.spyOn(github, 'getPullRequestNumber').mockReturnValueOnce(mockedPullRequestNumber);
        });
        it('should call getTagSHA with feature branch tag', () => {
          const spy = jest.spyOn(github, 'getTagSHA').mockReturnValueOnce(mockedCommitSha);
          getLastDeployedRef(mockedEnvironment);
          expect(spy).toHaveBeenCalledWith(`preview-${mockedPullRequestNumber}`);
          expect(spy).toHaveBeenCalledTimes(1);
        });
        it('should return SHA of tag', () => {
          jest.spyOn(github, 'getTagSHA').mockReturnValueOnce(mockedCommitSha);
          const commitRef = getLastDeployedRef(mockedEnvironment);
          expect(commitRef.sha).toBe(mockedCommitSha);
        });
        it('should return tag name in feature branch', () => {
          jest.spyOn(github, 'getTagSHA').mockReturnValueOnce(mockedCommitSha);
          const commitRef = getLastDeployedRef(mockedEnvironment);
          expect(commitRef.tag).toBe(`refs/tags/preview-${mockedPullRequestNumber}`);
        });
      });
      describe('given that PR branch does not have deployment tag', () => {
        it('should call getTagSHA with environment tag', () => {
          const spy = jest.spyOn(github, 'getTagSHA').mockImplementation(mockedGetTagSHACallback);
          getLastDeployedRef(mockedEnvironment);
          expect(spy).toHaveBeenCalledWith(mockedEnvironment);
          expect(spy).toHaveBeenCalledTimes(2);
        });
        it('should return sha of tagged commit from main branch', () => {
          jest.spyOn(github, 'getTagSHA').mockImplementation(mockedGetTagSHACallback);
          const commitRef = getLastDeployedRef(mockedEnvironment);
          expect(commitRef.sha).toBe(mockedCommitSha);
        });
        it('should return sha of tagged commit from main branch', () => {
          jest.spyOn(github, 'getTagSHA').mockImplementation(mockedGetTagSHACallback);
          const commitRef = getLastDeployedRef(mockedEnvironment);
          expect(commitRef.tag).toBe(`refs/tags/${mockedEnvironment}`);
        });
      });
    });
    describe('given that pull request number does not exist and is on main branch', () => {
      beforeEach(() => {
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValueOnce(0);
        jest.spyOn(github, 'isMainBranch').mockReturnValueOnce(true);
      });
      it('should return commit sha of environment', () => {
        const spy = jest.spyOn(github, 'getTagSHA').mockReturnValueOnce(mockedCommitSha);
        const commitRef = getLastDeployedRef(mockedEnvironment);
        expect(commitRef.sha).toBe(mockedCommitSha);
        expect(spy).toHaveBeenNthCalledWith(1, mockedEnvironment);
      });
    });
    describe('given that pull request number does not exist and is not on main branch', () => {
      beforeEach(() => {
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValueOnce(0);
        jest.spyOn(github, 'isMainBranch').mockReturnValueOnce(false);
      });
      it('should throw an error', () => {
        expect(() => getLastDeployedRef(mockedEnvironment)).toThrowError(
          'This action only supports push event on main branch or pull request events'
        );
      });
    });
  });
  describe('getChangedPackages method', () => {
    describe('given that changes exists for all packages', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(true);
      });
      it('should have foo project path in aws deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
        expect(deployCategories.aws).toContain(fooProject?.projectFolder);
      });
      it('should have bar project path in k8s deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
        expect(deployCategories.k8s).toContain(barProject?.projectFolder);
      });
    });
    describe('given that changes does not exists in any package', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(false);
      });
      it('should not have foo project path in aws deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
        expect(deployCategories.aws).not.toContain(fooProject?.projectFolder);
      });
      it('should not have bar project path in k8s deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
        expect(deployCategories.k8s).not.toContain(barProject?.projectFolder);
      });
    });
  });
  describe('getAllPackages method', () => {
    it('should have foo project path in aws deploy category', () => {
      const deployCategories = getAllPackages(mockedRushJson.projects);
      const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
      expect(deployCategories.aws).toContain(fooProject?.projectFolder);
    });
    it('should have bar project path in k8s deploy category', () => {
      const deployCategories = getAllPackages(mockedRushJson.projects);
      const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
      expect(deployCategories.k8s).toContain(barProject?.projectFolder);
    });
  });
});
