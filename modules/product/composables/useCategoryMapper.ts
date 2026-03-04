
/**
 * Composable for mapping product category keys to human-readable labels.
 * Provides a mapping of English category names to Chinese labels.
 * 
 * @returns {Object} Category mapping utilities
 * @property {Record<string, string>} categoryLabels - Object containing category key-to-label mappings
 * @property {Function} getCategoryLabel - Function to retrieve a label for a given category key
 */
export const useCategoryMapper = () => {
  const categoryLabels: Record<string, string> = {
    "men's clothing": '男装',
    'jewelery': '珠宝配饰',
    'electronics': '电子产品',
    "women's clothing": '女装'
  }

  /**
   * Returns the translated label for a given category key.
   * If no mapping exists, returns the original key.
   * 
   * @param {string} key - The category key to map (e.g., "electronics")
   * @returns {string} The translated label (e.g., "电子产品")
   */
  const getCategoryLabel = (key: string): string => {
    return categoryLabels[key] || key
  }

  return {
    categoryLabels,
    getCategoryLabel
  }
}
