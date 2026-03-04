// Generated from: tests/e2e/features/orders.feature
import { test } from "playwright-bdd";

test.describe('订单管理', () => {

  test('用户可以查看我的订单', async ({ Given, When, Then, And, page }) => { 
    await Given('我已经登录', null, { page }); 
    await And('我已清空数据', null, { page }); 
    await And('我已经创建了一个订单', null, { page }); 
    await When('我访问"我的订单"页面', null, { page }); 
    await Then('我应该看到订单列表中包含刚刚创建的订单', null, { page }); 
  });

  test('用户在没有订单时看到空状态', async ({ Given, When, Then, And, page }) => { 
    await Given('我已经登录', null, { page }); 
    await And('我已清空数据', null, { page }); 
    await When('我访问"我的订单"页面', null, { page }); 
    await Then('我应该看到"暂无订单"的提示信息', null, { page }); 
  });

  test('用户可以删除订单', async ({ Given, When, Then, And, page }) => { 
    await Given('我已经登录', null, { page }); 
    await And('我已清空数据', null, { page }); 
    await And('我已经创建了一个订单', null, { page }); 
    await When('我访问"我的订单"页面', null, { page }); 
    await And('我点击"删除订单"按钮', null, { page }); 
    await Then('我应该看到订单被成功删除', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/e2e/features/orders.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given 我已经登录","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And 我已清空数据","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"And 我已经创建了一个订单","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When 我访问\"我的订单\"页面","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then 我应该看到订单列表中包含刚刚创建的订单","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"Given 我已经登录","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"And 我已清空数据","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When 我访问\"我的订单\"页面","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then 我应该看到\"暂无订单\"的提示信息","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":22,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given 我已经登录","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"And 我已清空数据","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":19,"keywordType":"Context","textWithKeyword":"And 我已经创建了一个订单","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When 我访问\"我的订单\"页面","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"And 我点击\"删除订单\"按钮","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then 我应该看到订单被成功删除","stepMatchArguments":[]}]},
]; // bdd-data-end