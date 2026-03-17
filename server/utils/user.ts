// server/utils/user.ts
import { getCollection } from './mongodb';
import type { User } from '~/types/user';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const COLLECTION_NAME = 'users';

/**
 * 根据用户名查找用户。
 * @param username 用户名
 * @returns 查找到的用户或 null
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  const usersCollection = await getCollection<User>(COLLECTION_NAME);
  return usersCollection.findOne({ username });
}

/**
 * 根据用户 ID 查找用户。
 * @param id 用户 ID
 * @returns 查找到的用户或 null
 */
export async function findUserById(id: string): Promise<User | null> {
  const usersCollection = await getCollection<User>(COLLECTION_NAME);
  // 确保 id 是有效的 ObjectId 字符串
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return usersCollection.findOne({ _id: new ObjectId(id) });
}

/**
 * 创建新用户。
 * 密码将进行哈希处理。
 * @param user 用户数据 (不包含 _id)
 * @returns 创建成功的用户
 */
export async function createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
  const usersCollection = await getCollection<User>(COLLECTION_NAME);
  const hashedPassword = await bcrypt.hash(user.password, 10); // 10 轮盐值
  const newUser: User = {
    ...user,
    password: hashedPassword,
    role: user.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await usersCollection.insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}

/**
 * 更新用户信息。
 * @param id 用户 ID
 * @param updates 要更新的字段
 * @returns 更新后的用户或 null
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const usersCollection = await getCollection<User>(COLLECTION_NAME);
  
  // 确保 id 是有效的 ObjectId 字符串
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const updateDoc: any = { $set: { ...updates, updatedAt: new Date() } };

  // 如果更新包含密码，则哈希密码
  if (updates.password) {
    updateDoc.$set.password = await bcrypt.hash(updates.password, 10);
  }

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    updateDoc,
    { returnDocument: 'after' } // 返回更新后的文档
  );
  
  // 直接返回 result，因为 findOneAndUpdate 在 returnDocument: 'after' 时返回文档本身。
  return result.value;
}

/**
 * 验证用户密码。
 * @param plainPassword 明文密码
 * @param hashedPassword 哈希密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
