Feature: 用户登录

  Scenario: 使用正确账号通过弹窗登录
    Given 我在首页
    When 我点击导航栏的登录按钮
    And 我在弹窗中输入用户名 "admin" 和密码 "123456"
    And 我点击弹窗中的登录按钮
    Then 我应该看到退出登录按钮
