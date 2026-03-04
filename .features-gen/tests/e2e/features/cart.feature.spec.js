// Generated from: tests/e2e/features/cart.feature
import { test } from "playwright-bdd";

test.describe('购物车功能', () => {

  test('添加商品到购物车', async ({ Given, When, Then, And, page }) => { 
    await Given('我在首页', null, { page }); 
    await When('我点击第一个推荐商品进入详情页', null, { page }); 
    await And('我点击"加入购物车"按钮', null, { page }); 
    await Then('我应该在购物车页面看到该商品', null, { page }); 
    await And('购物车中应该显示"订单总计"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/e2e/features/cart.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given 我在首页","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"When 我点击第一个推荐商品进入详情页","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"And 我点击\"加入购物车\"按钮","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then 我应该在购物车页面看到该商品","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And 购物车中应该显示\"订单总计\"","stepMatchArguments":[]}]},
]; // bdd-data-end