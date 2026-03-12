<template>
  <div>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">MongoDB 商品演示</h1>
      <p class="text-gray-600 mb-4">
        此页面展示的数据通过调用后端 API (<code>/api/shop/products</code>) 获取，
        该 API 内部使用了封装后的 MongoDB CRUD 工具方法。
        首次访问时，如果 `products` 集合为空，会自动插入一条示例商品数据。
      </p>

      <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">创建新商品</h2>
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="createProduct">
          <BaseInput
            id="name"
            v-model="newProduct.name"
            label="商品名称"
            type="text"
            required
            class="col-span-1"
          />
          <BaseInput
            id="price"
            v-model.number="newProduct.price"
            label="价格"
            type="number"
            required
            class="col-span-1"
          />
          <BaseInput
            id="stock"
            v-model.number="newProduct.stock"
            label="库存"
            type="number"
            required
            class="col-span-1"
          />
          <BaseInput
            id="category"
            v-model="newProduct.category"
            label="分类"
            type="text"
            required
            class="col-span-1"
          />
          <BaseInput
            id="description"
            v-model="newProduct.description"
            label="描述"
            type="textarea"
            rows="2"
            class="md:col-span-2"
          />
          <div class="md:col-span-2 flex justify-end">
            <BaseButton type="submit" variant="success">
              添加商品
            </BaseButton>
          </div>
        </form>
      </div>

      <h2 class="text-xl font-bold mb-4">商品列表</h2>
      <div v-if="pending">加载中...</div>
      <div v-else-if="error" class="text-red-500">加载失败: {{ error.message }}</div>
      <div v-else>
        <div v-if="products && products.length > 0">
          <ul class="space-y-4">
            <li v-for="product in products" :key="product._id" class="border p-4 rounded-lg shadow-sm">
              <h2 class="text-xl font-semibold">{{ product.name }}</h2>
              <p>价格: {{ product.price }}</p>
              <p>库存: {{ product.stock }}</p>
              <p>分类: {{ product.category }}</p>
              <p>描述: {{ product.description }}</p>
              <div v-if="product.specs">
                <h3 class="font-medium mt-2">规格:</h3>
                <ul class="list-disc list-inside ml-4">
                  <li v-for="(value, key) in product.specs" :key="key">{{ key }}: {{ value }}</li>
                </ul>
              </div>
              <ClientOnly>
                <p class="text-sm text-gray-500 mt-2">创建时间: {{ new Date(product.createTime).toLocaleString() }}</p>
              </ClientOnly>
              <div class="mt-4 flex space-x-2">
                <BaseButton variant="info" size="sm" @click="startEdit(product)">
                  编辑
                </BaseButton>
                <BaseButton variant="danger" size="sm" @click="deleteProduct(product._id)">
                  删除
                </BaseButton>
              </div>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>没有找到商品数据。</p>
          <p>请确保 MongoDB 服务已启动，并且 `products` 集合中有数据。</p>
          <p>首次访问时，如果集合为空，会自动插入一条示例数据。</p>
        </div>
      </div>
    </div>

    <BaseModal v-model="isEditing" title="编辑商品" @confirm="updateProduct" @cancel="cancelEdit">
      <form v-if="currentEditingProduct" class="grid grid-cols-1 gap-4" @submit.prevent="updateProduct">
        <BaseInput
          id="edit-name"
          v-model="currentEditingProduct.name"
          label="商品名称"
          type="text"
          required
        />
        <BaseInput
          id="edit-price"
          v-model.number="currentEditingProduct.price"
          label="价格"
          type="number"
          required
        />
        <BaseInput
          id="edit-stock"
          v-model.number="currentEditingProduct.stock"
          label="库存"
          type="number"
          required
        />
        <BaseInput
          id="edit-category"
          v-model="currentEditingProduct.category"
          label="分类"
          type="text"
          required
        />
        <BaseInput
          id="edit-description"
          v-model="currentEditingProduct.description"
          label="描述"
          type="textarea"
          rows="2"
        />
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelEdit">
          取消
        </BaseButton>
        <BaseButton variant="primary" @click="updateProduct">
          保存
        </BaseButton>
      </template>
    </BaseModal>
  </div></template>

  <script setup lang="ts">
  import { ref } from 'vue'
  import { useToast } from '~/composables/useToast'
  import { useConfirm } from '~/composables/useConfirm'
  
  const toast = useToast()
  const { confirm } = useConfirm()
  
  interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    specs?: { [key: string]: any };
    createTime: string;
  }
  
  const products = ref<Product[] | null>(null);
  const pending = ref(true);
  const error = ref<Error | null>(null);
  
  // 用于创建新商品的表单数据
  const newProduct = ref({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    specs: {}
  });
  
  // 用于编辑商品的模态框状态和数据
  const isEditing = ref(false);
  const currentEditingProduct = ref<Product | null>(null);
  
  // 刷新商品列表的函数
  const refreshProducts = async () => {
    const { data: fetchedProducts, pending: fetchPending, error: fetchError } = await useFetch<Product[]>('/api/shop/products');
    products.value = fetchedProducts.value;
    pending.value = fetchPending.value;
    error.value = fetchError.value;
  };
  
  // 页面加载时立即刷新商品列表
  await refreshProducts();
  
  // 处理创建商品的函数
  const createProduct = async () => {
    try {
      await $fetch('/api/shop/products', {
        method: 'POST',
        body: newProduct.value,
      });
      toast.success('商品添加成功！');
      // 清空表单
      newProduct.value = { name: '', price: 0, stock: 0, category: '', description: '', specs: {} };
      await refreshProducts(); // 刷新列表
    } catch (e: any) {
      toast.error(`添加商品失败: ${e.message || '未知错误'}`);
      console.error('Error creating product:', e);
    }
  };
  
  // 处理删除商品的函数
  const deleteProduct = async (id: string) => {
    const isConfirmed = await confirm({
      title: '确认删除',
      message: '确定要删除此商品吗？该操作无法撤销。',
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });
    
    if (!isConfirmed) {
      return;
    }
    try {
      await $fetch(`/api/shop/products/${id}`, {
        method: 'DELETE',
      });
      toast.success('商品删除成功！');
      await refreshProducts(); // 刷新列表
    } catch (e: any) {
      toast.error(`删除商品失败: ${e.message || '未知错误'}`);
      console.error('Error deleting product:', e);
    }
  };
  
  // 启动编辑模式的函数
  const startEdit = (product: Product) => {
    currentEditingProduct.value = { ...product }; // 复制一份，避免直接修改列表数据
    isEditing.value = true;
  };
  
  // 取消编辑模式的函数
  const cancelEdit = () => {
    isEditing.value = false;
    currentEditingProduct.value = null;
  };
  
  // 处理更新商品的函数
  const updateProduct = async () => {
    if (!currentEditingProduct.value || !currentEditingProduct.value._id) {
      toast.error('没有选择要编辑的商品。');
      return;
    }
    try {
      await $fetch(`/api/shop/products/${currentEditingProduct.value._id}`, {
        method: 'PUT',
        body: currentEditingProduct.value,
      });
      toast.success('商品更新成功！');
      cancelEdit(); // 关闭模态框
      await refreshProducts(); // 刷新列表
    } catch (e: any) {
      toast.error(`更新商品失败: ${e.message || '未知错误'}`);
      console.error('Error updating product:', e);
    }
  };
  </script>
