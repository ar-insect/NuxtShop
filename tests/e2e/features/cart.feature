Feature: 购物车功能

  Scenario: 添加商品到购物车
    Given 我在首页
    When 我点击第一个推荐商品进入详情页
    And 我点击"加入购物车"按钮
    Then 我应该在购物车页面看到该商品
    And 购物车中应该显示"订单总计"
