Feature: 订单管理

  Scenario: 用户可以查看我的订单
    Given 我已经登录
    And 我已清空数据
    And 我已经创建了一个订单
    When 我访问"我的订单"页面
    Then 我应该看到订单列表中包含刚刚创建的订单

  Scenario: 用户在没有订单时看到空状态
    Given 我已经登录
    And 我已清空数据
    When 我访问"我的订单"页面
    Then 我应该看到"暂无订单"的提示信息

  Scenario: 用户可以删除订单
    Given 我已经登录
    And 我已清空数据
    And 我已经创建了一个订单
    When 我访问"我的订单"页面
    And 我点击"删除订单"按钮
    Then 我应该看到订单被成功删除
