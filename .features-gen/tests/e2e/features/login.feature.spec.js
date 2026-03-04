// Generated from: tests/e2e/features/login.feature
import { test } from "playwright-bdd";

test.describe('用户登录', () => {

  test('使用正确账号登录', async ({ Given, When, Then, And, page }) => { 
    await Given('我在登录页面', null, { page }); 
    await When('我输入用户名 "admin" 和密码 "123456"', null, { page }); 
    await And('我点击登录按钮', null, { page }); 
    await Then('我应该跳转到首页', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/e2e/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given 我在登录页面","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"When 我输入用户名 \"admin\" 和密码 \"123456\"","stepMatchArguments":[{"group":{"start":7,"value":"\"admin\"","children":[{"start":8,"value":"admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":19,"value":"\"123456\"","children":[{"start":20,"value":"123456","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"And 我点击登录按钮","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then 我应该跳转到首页","stepMatchArguments":[]}]},
]; // bdd-data-end