
/**
 * 表示商品的数据结构。
 * @interface Product
 * @property {number} id - 商品唯一标识
 * @property {string} title - 商品名称
 * @property {number} price - 商品价格
 * @property {string} description - 商品描述
 * @property {string} category - 商品分类（如 "men's clothing"）
 * @property {string} image - 商品图片 URL
 * @property {Object} rating - 评分信息
 * @property {number} rating.rate - 平均评分
 * @property {number} rating.count - 评分人数
 */
export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

/**
 * 商品数据访问组合式函数。
 * 提供一组模拟商品数据及辅助方法。
 * 
 * @returns {Object} 商品状态与方法
 * @property {Ref<Product[]>} products - 商品列表（响应式）
 * @property {Function} getProductById - 根据商品 ID 获取商品
 */
export const useProducts = () => {
  const products = ref<Product[]>([
    {
      id: 1,
      title: "北极狐 - Foldsack No. 1 背包，适配 15 英寸笔记本",
      price: 109.95,
      description: "您日常使用和森林漫步的完美背包。将您的笔记本电脑（最大 15 英寸）放入带衬垫的隔层中，满足您的日常需求。",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3.9, count: 120 }
    },
    {
      id: 2,
      title: "男士休闲高级修身 T 恤",
      price: 22.3,
      description: "修身款式，撞色插肩长袖，三扣亨利领，轻盈柔软的面料，透气舒适。坚固的缝合衬衫，圆领设计，经久耐用，非常适合休闲时尚穿着和忠实棒球迷。亨利风格圆领包含三扣门襟。",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.1, count: 259 }
    },
    {
      id: 3,
      title: "男士棉质夹克",
      price: 55.99,
      description: "春秋冬季绝佳的外套夹克，适合多种场合，如工作、徒步旅行、露营、登山/攀岩、骑行、旅行或其他户外活动。送给您或您的家人的好礼物。在这个感恩节或圣诞节送给父亲、丈夫或儿子的温暖爱意。",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.7, count: 500 }
    },
    {
      id: 4,
      title: "男士休闲修身款",
      price: 15.99,
      description: "屏幕上的颜色可能与实际略有不同。/ 请注意，体型因人而异，因此，请参阅下面的产品说明中的详细尺寸信息。",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.1, count: 430 }
    },
    {
      id: 5,
      title: "John Hardy 女士传奇 Naga 金银龙形手链",
      price: 695,
      description: "来自我们的传奇系列，Naga 的灵感来自保护海洋珍珠的神话水龙。向内佩戴可获得爱与富足，向外佩戴可获得保护。",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.6, count: 400 }
    },
    {
      id: 6,
      title: "纯金微镶小巧饰品",
      price: 168,
      description: "满意保证。30 天内退换任何订单。由美国 Hafeez Center 设计和销售。满意保证。30 天内退换任何订单。",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3.9, count: 70 }
    },
    {
      id: 7,
      title: "白金镀层公主方形戒指",
      price: 9.99,
      description: "经典创作为她打造的订婚婚礼单钻承诺戒指。在订婚、婚礼、周年纪念日、情人节宠爱您的爱人的礼物...",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3, count: 400 }
    },
    {
      id: 8,
      title: "穿孔猫头鹰玫瑰金镀层不锈钢双扩耳饰",
      price: 10.99,
      description: "玫瑰金镀层双扩耳扩耳器耳环。由 316L 不锈钢制成",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1635767798638-3e2523422e55?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 1.9, count: 100 }
    },
    {
      id: 9,
      title: "WD 2TB Elements 便携式外置硬盘 - USB 3.0",
      price: 64,
      description: "USB 3.0 和 USB 2.0 兼容性快速数据传输。提高 PC 性能高容量；兼容性 NTFS 格式适用于 Windows 10、Windows 8.1、Windows 7；可能需要为 Mac OS X 重新格式化。兼容性可能会因用户的硬件配置和操作系统而异",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1531492746076-a61b363be24d?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3.3, count: 203 }
    },
    {
      id: 10,
      title: "SanDisk SSD PLUS 1TB 内置 SSD - SATA III 6 Gb/s",
      price: 109,
      description: "简单的升级即可实现更快的启动、关机、应用程序加载和响应（与 5400 RPM SATA 2.5” 硬盘相比；基于已发布的规格和内部基准测试）。提升突发写入性能，使其成为典型 PC 工作负载的理想选择。完美的平衡性能和可靠性读/写速度高达 535MB/s/450MB/s（基于内部测试；根据驱动器容量、主机设备、操作系统和应用程序，性能可能会降低。）",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.9, count: 470 }
    },
    {
      id: 11,
      title: "广颖电通 256GB SSD 3D NAND A55 SATA III 2.5英寸固态硬盘",
      price: 109,
      description: "3D NAND 闪存用于实现超快的传输速度。读取速度高达 560MB/s，写入速度高达 530MB/s；基于内部测试；根据驱动器容量、主机设备、操作系统和应用程序，性能可能会降低。启用 SLC 缓存技术以提高性能并延长使用寿命。7mm 超薄设计，适用于超极本和超薄笔记本电脑。支持 TRIM 命令、垃圾收集技术、RAID 和 ECC（纠错码），以此提供优化的性能和增强的可靠性。",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.8, count: 319 }
    },
    {
      id: 12,
      title: "西部数据 4TB 游戏专用便携式外置硬盘 (兼容 PS4)",
      price: 114,
      description: "扩展您的 PS4 游戏体验，随处畅玩。快速简便的设置。时尚的设计，高容量，3 年制造商有限保修",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1587302912306-cf1e774a3d73?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.8, count: 400 }
    },
    {
      id: 13,
      title: "宏碁 SB220Q bi 21.5英寸全高清 IPS 超薄显示器",
      price: 599,
      description: "21. 5 英寸全高清 (1920 x 1080) 宽屏 IPS 显示器。AMD Radeon FreeSync 技术。无边框设计 | 高亮度与对比度 (250 尼特 & 1000:1)。75Hz 刷新率 - 使用 HDMI 端口。零边框设计 | 全高清 IPS 面板 | 可倾斜角度 -5 度至 15 度 | 支持 VGA 和 HDMI 端口",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.9, count: 250 }
    },
    {
      id: 14,
      title: "三星 49英寸 CHG90 144Hz 曲面游戏显示器 (QLED 超宽屏)",
      price: 999.99,
      description: "49 英寸超宽 32:9 曲面游戏显示器，具有双 27 英寸屏幕并排显示效果。量子点 (QLED) 技术，HDR 支持和出厂校准提供极其逼真且准确的色彩和对比度。144Hz 高刷新率和 1ms 超快响应时间 (MPRT) 最大限度地减少输入延迟、重影和运动模糊，带来流畅的游戏体验。",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.2, count: 140 }
    },
    {
      id: 15,
      title: "BIYLACLESEN 女士三合一滑雪夹克 冬季大衣",
      price: 56.99,
      description: "注意：这件夹克是美码，请选择您平时的尺码。材质：软壳夹克由 100% 聚酯纤维制成，衬里采用优质摇粒绒。多口袋：2 个拉链插手口袋，1 个拉链胸袋（存放护照或卡片），1 个内部大网袋，1 个内部安全拉链口袋，适合存放手机、钱包、护照和其他配件。",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1551488852-d81a2d5e2197?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.6, count: 235 }
    },
    {
      id: 16,
      title: "Lock and Love 女士可拆卸连帽人造皮机车夹克",
      price: 29.95,
      description: "100% 聚氨酯（外壳）100% 聚酯纤维（衬里）75% 聚酯纤维 25% 棉（毛衣），人造皮革材料，风格与舒适度兼备，二合一连帽皮夹克，仅手洗，不可漂白，晾干，不可熨烫",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1520183802803-06f731a2059f?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 2.9, count: 340 }
    },
    {
      id: 17,
      title: "女士防风雨条纹登山雨衣夹克",
      price: 39.99,
      description: "轻便完美贴合夹克：拉链开合，连帽，可调节抽绳腰部设计。轻盈透气，不加绒衬里。防风雨快干面料：95% 聚酯纤维，5% 氨纶。提供防风和防水保护，保持透气。",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3.8, count: 679 }
    },
    {
      id: 18,
      title: "MBJ 女士纯色短袖船领 V 领 T 恤",
      price: 9.85,
      description: "95% 人造丝 5% 氨纶，美国制造或进口，不可漂白，轻盈面料，非常适合夏季穿着，侧面褶皱设计，合身且时尚，展现曲线。",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.7, count: 130 }
    },
    {
      id: 19,
      title: "Opna 女士短袖吸湿排汗运动衫",
      price: 7.95,
      description: "100% 聚酯纤维，机洗，100% 阳离子聚酯互锁织物，机洗并预缩水，极其轻便、柔软且有光泽。",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 4.5, count: 146 }
    },
    {
      id: 20,
      title: "DANVOUY 女士 T 恤 休闲棉质短袖",
      price: 12.99,
      description: "95% 棉，5% 氨纶，特点：休闲，短袖，字母印花，V 领，时尚 T 恤，面料柔软有弹性，独特风格，让您美丽、时尚、性感和优雅。",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80",
      rating: { rate: 3.6, count: 145 }
    }
  ])

  /**
   * 根据商品 ID 获取单个商品。
   * 
   * @param {number} id - 商品 ID
   * @returns {Product | undefined} 找到则返回商品，否则返回 undefined
   */
  const getProductById = (id: number) => {
    return products.value.find(p => p.id === id)
  }

  /**
   * 获取分页商品列表（可选分类与搜索过滤）。
   * 
   * @param {number} page - 当前页码（从 1 开始）
   * @param {number} limit - 每页数量
   * @param {string} [category] - 分类过滤（可选）
   * @param {string} [query] - 搜索词（可选，匹配标题/描述）
   * @returns {Promise<{ items: Product[]; total: number }>} 分页数据与总数
   */
  const getProducts = (page: number = 1, limit: number = 16, category?: string, query?: string) => {
    return new Promise<{ items: Product[]; total: number }>((resolve) => {
      setTimeout(() => {
        const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 16

        const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : ''
        const normalizedCategory = typeof category === 'string' && category.trim() ? category : undefined

        let filtered = products.value

        if (normalizedCategory) {
          filtered = filtered.filter(p => p.category === normalizedCategory)
        }

        if (normalizedQuery) {
          filtered = filtered.filter(p => {
            const title = p.title?.toLowerCase?.() || ''
            const desc = p.description?.toLowerCase?.() || ''
            return title.includes(normalizedQuery) || desc.includes(normalizedQuery)
          })
        }

        const total = filtered.length
        const start = (safePage - 1) * safeLimit
        const items = filtered.slice(start, start + safeLimit)

        resolve({ items, total })
      }, 100)
    })
  }

  return {
    products,
    getProducts,
    getProductById
  }
}
