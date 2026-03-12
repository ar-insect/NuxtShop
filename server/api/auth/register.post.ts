// server/api/auth/register.post.ts
import { findUserByUsername, createUser } from '~/server/utils/user';
import type { User } from '~/types/user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, confirmPassword } = body;

  if (!username || !password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入用户名和密码',
    });
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '两次输入的密码不一致',
    });
  }

  // 基础密码强度校验
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: '密码长度至少需要6位',
    });
  }

  // 检查用户是否已存在
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: '用户名已存在',
    });
  }

  // 创建新用户
  const newUser: Omit<User, '_id' | 'createdAt' | 'updatedAt'> & { password: string } = {
    username,
    password,
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
    name: username, // 默认名称为用户名
  };

  const createdUser = await createUser(newUser);

  // 返回部分用户数据，不包含密码
  return {
    success: true,
    message: '注册成功',
    user: {
      _id: createdUser._id,
      username: createdUser.username,
      name: createdUser.name,
      role: createdUser.role,
      avatar: createdUser.avatar,
      createdAt: createdUser.createdAt,
    },
  };
});
