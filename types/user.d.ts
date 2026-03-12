// types/user.d.ts
import type { ObjectId } from 'mongodb';
import type { ThemeConfig } from '~/stores/theme'; // 导入 ThemeConfig

export interface User {
  _id?: ObjectId; // MongoDB 的 ObjectId
  username: string;
  password?: string; // 密码字段，在查询时可能不返回
  role: 'admin' | 'user';
  avatar?: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date;
  preferences?: ThemeConfig; // 添加偏好设置字段
}
