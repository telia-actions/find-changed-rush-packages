import {
  getAllPackages,
  getChangedPackages,
  getDiffTargetMain,
  getDiffTargetPullRequest,
  getTagForDeployment,
  readJson,
} from '../src/utils';
import * as github from '../src/github';
import mockedRushJson from '../__mocks__/rush';

jest.mock('@actions/core');

const mockedCommitSha = 'mocksha';
const mockedEnvironment = 'mockenv';
const mockedPullRequestNumber = 1;
const mockedTagName = 'preview-1';

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
  describe('getTagForDeployment method', () => {
    describe('given that we are on the main branch', () => {
      it('should return a tag matching the given environment name', () => {
        const tagName = getTagForDeployment(0, mockedEnvironment);
        expect(tagName).toBe(mockedEnvironment);
      });
    });
    describe('given that we are in a branch which is part of a pull request', () => {
      it('should return a tag matching the current pull requests number', () => {
        const tagName = getTagForDeployment(mockedPullRequestNumber, mockedEnvironment);
        expect(tagName).toBe(`preview-${mockedPullRequestNumber}`);
      });
    });
  });
  describe('getDiffTargetPullRequest method', () => {
    describe('given tag exists', () => {
      it('should return a tag', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue(mockedCommitSha);
        const diffTarget = getDiffTargetPullRequest(mockedTagName);

        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);

        expect(diffTarget).toBe(mockedTagName);
      });
    });
    describe(`given tag doesn't exist`, () => {
      it('should return main branch fallback', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue('');

        const diffTarget = getDiffTargetPullRequest(mockedTagName);

        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);

        expect(diffTarget).toBe('origin/main');
      });
    });
  });
  describe('getDiffTargetMain method', () => {
    describe('given tag exists', () => {
      it('should return a tag', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue(mockedCommitSha);
        const diffTarget = getDiffTargetMain(mockedTagName);

        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);

        expect(diffTarget).toBe(mockedTagName);
      });
    });
    describe(`given tag doesn't exist`, () => {
      it('should return null', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue('');

        const diffTarget = getDiffTargetMain(mockedTagName);

        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);

        expect(diffTarget).toBe(null);
      });
    });
  });
  describe('getChangedPackages method', () => {
    describe('given that changes exists for all packages', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(true);
      });
      it('should have foo project path in aws deploy category', () => {
        const changedPackages = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
        expect(changedPackages).toContain(fooProject);
      });
      it('should have bar project path in k8s deploy category', () => {
        const changedPackages = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
        expect(changedPackages).toContain(barProject);
      });
    });
    describe('given that changes does not exists in any package', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(false);
      });
      it('should return no changed projects', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        expect(deployCategories).toHaveLength(0);
      });
    });
  });
  describe('getAllPackages method', () => {
    it('should have foo project path in aws deploy category', () => {
      const changedPackages = getAllPackages(mockedRushJson.projects);
      const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
      expect(changedPackages).toContain(fooProject);
    });
    it('should have bar project path in k8s deploy category', () => {
      const changedPackages = getAllPackages(mockedRushJson.projects);
      const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
      expect(changedPackages).toContain(barProject);
    });
  });
});
