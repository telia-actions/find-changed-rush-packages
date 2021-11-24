import child_process, { SpawnSyncReturns } from 'child_process';
import { isChangeInPath, getTagSha } from '..';
const mockedPullRequestNumber = 1;
const mockedCommitSha = 'mocksha';
const mockedPath = '/__mocks__';

describe('github client', () => {
  describe('getTagSha method', () => {
    it('should call spawnSync with git rev-list command', () => {
      const spy = jest
        .spyOn(child_process, 'spawnSync')
        .mockReturnValueOnce({ stdout: Buffer.from(mockedCommitSha) } as SpawnSyncReturns<Buffer>);
      const commitSha = getTagSha(`preview-${mockedPullRequestNumber}`);
      expect(commitSha).toBe(mockedCommitSha);
      expect(spy).toHaveBeenCalledWith('git', [
        'rev-list',
        '-n',
        '1',
        `preview-${mockedPullRequestNumber}`,
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('isChangeInPath method', () => {
    it('should call spawnSync with git diff command', () => {
      const spy = jest
        .spyOn(child_process, 'spawnSync')
        .mockReturnValueOnce({ status: 0 } as SpawnSyncReturns<Buffer>);
      isChangeInPath(mockedCommitSha, mockedPath);
      expect(spy).toHaveBeenCalledWith('git', [
        'diff',
        '--quiet',
        `${mockedCommitSha}...`,
        '--',
        mockedPath,
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    describe('given that git diff status is 0', () => {
      it('should return false', () => {
        jest
          .spyOn(child_process, 'spawnSync')
          .mockReturnValueOnce({ status: 0 } as SpawnSyncReturns<Buffer>);
        const isChanged = isChangeInPath(mockedCommitSha, mockedPath);
        expect(isChanged).toBe(false);
      });
    });
    describe('given that git diff status is 1', () => {
      it('should return true', () => {
        jest
          .spyOn(child_process, 'spawnSync')
          .mockReturnValueOnce({ status: 1 } as SpawnSyncReturns<Buffer>);
        const isChanged = isChangeInPath(mockedCommitSha, mockedPath);
        expect(isChanged).toBe(true);
      });
    });
    describe('given that git diff status is nor 1 neither 0', () => {
      it('should throw', () => {
        jest
          .spyOn(child_process, 'spawnSync')
          .mockReturnValueOnce({ status: 129 } as SpawnSyncReturns<Buffer>);
        expect(() => isChangeInPath(mockedCommitSha, mockedPath)).toThrow(
          `Git returned a non-success code for path: ${mockedPath}`
        );
      });
    });
  });
});
