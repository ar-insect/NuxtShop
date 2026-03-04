Feature: 用户登录

  Scenario: 使用正确账号登录
    Given 我在登录页面
    When 我输入用户名 "admin" 和密码 "123456"
    And 我点击登录按钮
    Then 我应该跳转到首页
