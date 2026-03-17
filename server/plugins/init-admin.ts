// server/plugins/init-admin.ts
import { findUserByUsername, createUser } from '~/server/utils/user';
import type { User } from '~/types/user';
import { connectToMongoDB } from '~/server/utils/mongodb'; // 导入 connectToMongoDB

export default defineNitroPlugin(async ({}) => {
  // 确保 MongoDB 已连接，然后再进行管理员初始化
  await connectToMongoDB(); // 添加这一行

  const config = useRuntimeConfig();

  const adminUsername = config.admin?.username;
  const adminPassword = config.admin?.password;

  if (!adminUsername || !adminPassword) {
    console.warn('Admin username or password not set in runtimeConfig. Skipping admin initialization.');
    return;
  }

  try {
    const existingAdmin = await findUserByUsername(adminUsername);

    if (!existingAdmin) {
      console.log(`Initializing admin user: ${adminUsername}`);
      const newAdmin: Omit<User, '_id' | 'createdAt' | 'updatedAt'> & { password: string } = {
        username: adminUsername,
        password: adminPassword,
        role: 'admin',
        name: 'Admin',
        avatar: `https://ui-avatars.com/api/?name=${adminUsername}&background=random`,
      };
      await createUser(newAdmin);
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
});
