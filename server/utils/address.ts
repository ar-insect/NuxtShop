// server/utils/address.ts
import { getCollection } from './mongodb';
import type { Address } from '~/types/address';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'addresses';

/**
 * 根据用户 ID 查找所有收货地址。
 * @param userId 用户 ID
 * @returns 地址数组
 */
export async function findAddressesByUserId(userId: string): Promise<Address[]> {
  const addressesCollection = await getCollection<Address>(COLLECTION_NAME);
  return addressesCollection.find({ userId: new ObjectId(userId) }).toArray();
}

/**
 * 添加新地址。
 * @param address 地址数据 (不包含 _id)
 * @returns 创建成功的地址
 */
export async function addAddress(address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
  const addressesCollection = await getCollection<Address>(COLLECTION_NAME);
  const newAddress: Address = {
    ...address,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await addressesCollection.insertOne(newAddress);
  return { ...newAddress, _id: result.insertedId };
}

/**
 * 更新地址信息。
 * @param addressId 地址 ID
 * @param updates 要更新的字段
 * @returns 更新后的地址或 null
 */
export async function updateAddress(addressId: string, updates: Partial<Address>): Promise<Address | null> {
  const addressesCollection = await getCollection<Address>(COLLECTION_NAME);
  if (!ObjectId.isValid(addressId)) {
    return null;
  }
  const updateDoc: any = { $set: { ...updates, updatedAt: new Date() } };
  const result = await addressesCollection.findOneAndUpdate(
    { _id: new ObjectId(addressId) },
    updateDoc,
    { returnDocument: 'after' }
  );
  return result.value;
}

/**
 * 删除地址。
 * @param addressId 地址 ID
 * @returns 删除结果
 */
export async function deleteAddress(addressId: string): Promise<boolean> {
  const addressesCollection = await getCollection<Address>(COLLECTION_NAME);
  if (!ObjectId.isValid(addressId)) {
    return false;
  }
  const result = await addressesCollection.deleteOne({ _id: new ObjectId(addressId) });
  return result.deletedCount === 1;
}

/**
 * 设置默认地址。
 * @param userId 用户 ID
 * @param addressId 要设置为默认的地址 ID
 * @returns 操作是否成功
 */
export async function setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
  const addressesCollection = await getCollection<Address>(COLLECTION_NAME);
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(addressId)) {
    return false;
  }

  // 先将该用户所有地址的 isDefault 设置为 false
  await addressesCollection.updateMany(
    { userId: new ObjectId(userId) },
    { $set: { isDefault: false, updatedAt: new Date() } }
  );

  // 再将指定地址的 isDefault 设置为 true
  const result = await addressesCollection.updateOne(
    { _id: new ObjectId(addressId), userId: new ObjectId(userId) },
    { $set: { isDefault: true, updatedAt: new Date() } }
  );

  return result.modifiedCount === 1;
}
