Feature: 收藏夹功能

  Scenario: 在详情页添加商品到收藏夹
    Given 我在首页
    When 我点击第一个推荐商品进入详情页
    And 我点击"加入收藏"按钮
    Then 收藏夹图标上的数字应该增加
    And 我点击顶部导航栏的"收藏夹"图标
    Then 我应该在收藏夹页面看到该商品

  Scenario: 从收藏夹移除商品
    Given 我在收藏夹页面
    And 收藏夹中已有商品
    When 我点击商品的"移除"按钮
    Then 该商品应该从收藏夹中消失
