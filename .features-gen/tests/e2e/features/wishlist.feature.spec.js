// Generated from: tests/e2e/features/wishlist.feature
import { test } from "playwright-bdd";

test.describe('收藏夹功能', () => {

  test('在详情页添加商品到收藏夹', async ({ Given, When, Then, And, page }) => { 
    await Given('我在首页', null, { page }); 
    await When('我点击第一个推荐商品进入详情页', null, { page }); 
    await And('我点击"加入收藏"按钮', null, { page }); 
    await Then('收藏夹图标上的数字应该增加', null, { page }); 
    await And('我点击顶部导航栏的"收藏夹"图标', null, { page }); 
    await Then('我应该在收藏夹页面看到该商品', null, { page }); 
  });

  test('从收藏夹移除商品', async ({ Given, When, Then, And, page }) => { 
    await Given('我在收藏夹页面', null, { page }); 
    await And('收藏夹中已有商品', null, { page }); 
    await When('我点击商品的"移除"按钮', null, { page }); 
    await Then('该商品应该从收藏夹中消失', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/e2e/features/wishlist.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given 我在首页","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"When 我点击第一个推荐商品进入详情页","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"And 我点击\"加入收藏\"按钮","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then 收藏夹图标上的数字应该增加","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And 我点击顶部导航栏的\"收藏夹\"图标","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then 我应该在收藏夹页面看到该商品","stepMatchArguments":[]}]},
  {"pwTestLine":15,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":16,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given 我在收藏夹页面","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"And 收藏夹中已有商品","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When 我点击商品的\"移除\"按钮","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then 该商品应该从收藏夹中消失","stepMatchArguments":[]}]},
]; // bdd-data-end