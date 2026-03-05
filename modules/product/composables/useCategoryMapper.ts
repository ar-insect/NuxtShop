
/**
 * 商品分类映射组合式函数。
 * 将英文分类 key 映射为更友好的中文展示文案。
 * 
 * @returns {Object} 分类映射工具
 * @property {Record<string, string>} categoryLabels - 分类 key 到展示文案的映射表
 * @property {Function} getCategoryLabel - 根据分类 key 获取展示文案
 */
export const useCategoryMapper = () => {
  const categoryLabels: Record<string, string> = {
    "men's clothing": '男装',
    'jewelery': '珠宝配饰',
    'electronics': '电子产品',
    "women's clothing": '女装'
  }

  /**
   * 获取分类 key 对应的中文展示文案。
   * 若不存在映射，则返回原始 key。
   * 
   * @param {string} key - 分类 key（如 "electronics"）
   * @returns {string} 展示文案（如 "电子产品"）
   */
  const getCategoryLabel = (key: string): string => {
    return categoryLabels[key] || key
  }

  return {
    categoryLabels,
    getCategoryLabel
  }
}
