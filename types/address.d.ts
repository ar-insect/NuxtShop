// types/address.d.ts
import type { ObjectId } from 'mongodb';

export interface Address {
  _id?: ObjectId; // MongoDB 的 ObjectId
  userId: ObjectId; // 关联的用户 ID
  name: string;
  phone: string;
  region: string; // 省市区信息，例如 "上海市 上海市 浦东新区"
  detail: string; // 详细地址，例如 "陆家嘴环路1000号"
  isDefault: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
