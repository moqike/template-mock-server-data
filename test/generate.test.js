const assert = require('assert');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const sinon = require('sinon');
const inquirer = require('inquirer');
const generate = require('../lib/generate');
const testFolderPath = path.resolve(__dirname, '../_test');
const mockHomeDataPath = path.resolve(testFolderPath, './mock_home/data');

const sandbox = sinon.createSandbox();

describe('Generate data files', function() {
  describe('generate()', function() {
    before(function(done) {
      // clean up _test folder
      rimraf(testFolderPath, function (err) {
        fs.mkdirSync(testFolderPath);
        fs.mkdirSync(mockHomeDataPath, {
          recursive: true
        });
        done();
      });
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should generate data folder', async function() {
      const promptStub = sandbox.stub(inquirer, 'prompt');
      promptStub.onCall(0).resolves({
        dataPath: 'api/product/price'
      });
      promptStub.onCall(1).resolves({
        scenario: 'normal'
      });
      promptStub.onCall(2).resolves({
        proxy: 'yes'
      });
      await generate(mockHomeDataPath);
      assert.ok(
        fs.existsSync(path.resolve(mockHomeDataPath, 'api/product/price/_default.ts'))
        && fs.existsSync(path.resolve(mockHomeDataPath, 'api/product/price/normal.ts'))
        && fs.existsSync(path.resolve(mockHomeDataPath, 'api/product/price/proxy.ts'))
      );
    });
  });
});