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

export const products: Product[] = [
  {
    id: 1,
    title: '北极狐 - Foldsack No. 1 背包，适配 15 英寸笔记本',
    price: 109.95,
    description: '您日常使用和森林漫步的完美背包。将您的笔记本电脑（最大 15 英寸）放入带衬垫的隔层中，满足您的日常需求。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 2,
    title: '男士休闲高级修身 T 恤',
    price: 22.3,
    description: '修身款式，撞色插肩长袖，三扣亨利领，轻盈柔软的面料，透气舒适。坚固的缝合衬衫，圆领设计，经久耐用，非常适合休闲时尚穿着和忠实棒球迷。亨利风格圆领包含三扣门襟。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.1, count: 259 }
  },
  {
    id: 3,
    title: '男士棉质夹克',
    price: 55.99,
    description: '春秋冬季绝佳的外套夹克，适合多种场合，如工作、徒步旅行、露营、登山/攀岩、骑行、旅行或其他户外活动。送给您或您的家人的好礼物。在这个感恩节或圣诞节送给父亲、丈夫或儿子的温暖爱意。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.7, count: 500 }
  },
  {
    id: 4,
    title: '男士休闲修身款',
    price: 15.99,
    description: '屏幕上的颜色可能与实际略有不同。/ 请注意，体型因人而异，因此，请参阅下面的产品说明中的详细尺寸信息。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.1, count: 430 }
  },
  {
    id: 5,
    title: 'John Hardy 女士传奇 Naga 金银龙形手链',
    price: 695,
    description: '来自我们的传奇系列，Naga 的灵感来自保护海洋珍珠的神话水龙。向内佩戴可获得爱与富足，向外佩戴可获得保护。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.6, count: 400 }
  },
  {
    id: 6,
    title: '纯金微镶小巧饰品',
    price: 168,
    description: '满意保证。30 天内退换任何订单。由美国 Hafeez Center 设计和销售。满意保证。30 天内退换任何订单。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3.9, count: 70 }
  },
  {
    id: 7,
    title: '白金镀层公主方形戒指',
    price: 9.99,
    description: '经典创作为她打造的订婚婚礼单钻承诺戒指。在订婚、婚礼、周年纪念日、情人节宠爱您的爱人的礼物...',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3, count: 400 }
  },
  {
    id: 8,
    title: 'Pierced Owl 玫瑰金镀层不锈钢双隧道耳塞',
    price: 10.99,
    description: '玫瑰金镀层双喇叭隧道耳钉。采用 316L 不锈钢制成。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 1.9, count: 100 }
  },
  {
    id: 9,
    title: 'WD 2TB Elements 便携式外置硬盘 - USB 3.0',
    price: 64,
    description: 'USB 3.0 和 USB 2.0 兼容。快速数据传输。提高 PC 性能。高容量；兼容 NTFS 格式（Windows）。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46f9?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3.3, count: 203 }
  },
  {
    id: 10,
    title: 'SanDisk SSD PLUS 1TB 内置固态硬盘 - SATA III 6Gb/s',
    price: 109,
    description: '提升启动、关机、应用加载和响应速度（与 5400 RPM SATA 2.5 英寸硬盘相比；基于内部基准测试）。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.9, count: 470 }
  },
  {
    id: 11,
    title: 'Silicon Power 256GB SSD 3D NAND A55 SLC 缓存性能增强',
    price: 109,
    description: '3D NAND 闪存应用提供更高的传输速度。显著提升系统启动、关闭、读写性能。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.8, count: 319 }
  },
  {
    id: 12,
    title: 'WD 4TB 游戏专用硬盘 - PlayStation 4 便携外置硬盘',
    price: 114,
    description: '兼容 PlayStation 4。即插即用，轻松扩展存储空间。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.8, count: 400 }
  },
  {
    id: 13,
    title: 'Acer SB220Q 21.5 英寸全高清 IPS 显示器',
    price: 599,
    description: '21.5 英寸全高清 (1920 x 1080) 宽屏 IPS 显示器。AMD Radeon FreeSync 技术。75Hz 刷新率。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.9, count: 250 }
  },
  {
    id: 14,
    title: '三星 49英寸 CHG90 144Hz 曲面游戏显示器',
    price: 999.99,
    description: '49 英寸超宽 32:9 曲面游戏显示器，量子点 (QLED) 技术，HDR 支持。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.2, count: 140 }
  },
  {
    id: 15,
    title: 'BIYLACLESEN 女士三合一滑雪夹克 冬季大衣',
    price: 56.99,
    description: '注意：这件夹克是美码，请选择您平时的尺码。多口袋设计，适合多场景。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1551488852-d81a2d5e2197?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.6, count: 235 }
  },
  {
    id: 16,
    title: 'Lock and Love 女士可拆卸连帽人造皮机车夹克',
    price: 29.95,
    description: '人造皮革材料，风格与舒适度兼备，二合一连帽皮夹克。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1520183802803-06f731a2059f?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 2.9, count: 340 }
  },
  {
    id: 17,
    title: '女士防风雨条纹登山雨衣夹克',
    price: 39.99,
    description: '轻便透气，防风防水快干面料，提供保护并保持透气。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3.8, count: 679 }
  },
  {
    id: 18,
    title: 'MBJ 女士纯色短袖船领 V 领 T 恤',
    price: 9.85,
    description: '轻盈面料，非常适合夏季穿着，侧面褶皱设计，合身且时尚。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.7, count: 130 }
  },
  {
    id: 19,
    title: 'Opna 女士短袖吸湿排汗运动衫',
    price: 7.95,
    description: '极其轻便、柔软且有光泽，适合运动穿着。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.5, count: 146 }
  },
  {
    id: 20,
    title: 'DANVOUY 女士 T 恤 休闲棉质短袖',
    price: 12.99,
    description: '面料柔软有弹性，独特风格，让您美丽、时尚、性感和优雅。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 3.6, count: 145 }
  }
]
