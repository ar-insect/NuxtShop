<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">MongoDB 商品演示</h1>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const { data: fetchedProducts, pending: fetchPending, error: fetchError } = await useFetch<Product[]>('/api/shop/products');

products.value = fetchedProducts.value;
pending.value = fetchPending.value;
error.value = fetchError.value;

</script>
