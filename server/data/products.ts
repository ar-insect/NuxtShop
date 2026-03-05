export interface Product {
  id: number
  title: string
  price: number
  description: string
  detailHtml?: string
  category: string
  image: string
  images: string[]
  rating: {
    rate: number
    count: number
  }
}

// 丰富的图文描述模板（按分类）
const richContentTemplates = {
  "men's clothing": (title: string, image: string) => `
    <div class="space-y-8">
      <div class="bg-gray-50 p-6 rounded-xl">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          核心亮点
        </h3>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>精选优质面料，亲肤透气</li>
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>3D 立体剪裁，修身版型</li>
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>耐磨抗皱，易于打理</li>
          <li class="flex items-center gap-2"><span class="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>适合日常通勤、休闲聚会</li>
        </ul>
      </div>

      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 class="text-lg font-bold mb-3">设计理念</h3>
          <p class="text-gray-600 leading-relaxed mb-4">
            "${title}" 的设计灵感来源于都市快节奏生活与自然舒适感的平衡。我们摒弃了繁复的装饰，回归衣物本身的质感与功能。无论是面料的选择，还是缝线的处理，都经过了数十次的打磨与测试。
          </p>
          <p class="text-gray-600 leading-relaxed">
            简约而不简单，让您在各种场合都能保持自信与从容。
          </p>
        </div>
        <div class="rounded-xl overflow-hidden shadow-lg h-64">
          <img src="${image}" alt="Detail Shot" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
        </div>
      </div>

      <div class="border-t border-gray-200 pt-8">
        <h3 class="text-lg font-bold mb-4">材质与洗涤建议</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 text-center">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="font-semibold mb-1">主面料</div>
            <div>100% 棉 / 混纺</div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="font-semibold mb-1">洗涤方式</div>
            <div>30℃ 以下温水机洗</div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="font-semibold mb-1">熨烫</div>
            <div>低温熨烫</div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="font-semibold mb-1">晾晒</div>
            <div>阴凉处悬挂晾干</div>
          </div>
        </div>
      </div>
    </div>
  `,
  "jewelery": (title: string, image: string) => `
    <div class="space-y-10 text-center">
      <div class="max-w-2xl mx-auto">
        <h3 class="text-2xl font-serif text-gray-800 mb-6 italic">" 璀璨时刻，永恒珍藏 "</h3>
        <p class="text-gray-600 leading-relaxed">
          每一件珠宝都承载着一段故事。"${title}" 由经验丰富的工匠手工打造，从宝石的甄选到镶嵌的每一个细节，都追求极致的完美。它不仅是一件饰品，更是一份情感的寄托，一份值得传承的艺术品。
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="aspect-square bg-gray-50 rounded-full overflow-hidden p-8 flex items-center justify-center group">
          <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" alt="Detail 1">
        </div>
        <div class="aspect-square bg-gray-50 rounded-full overflow-hidden p-8 flex items-center justify-center group scale-110 shadow-xl z-10">
          <img src="${image}" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" alt="Main Detail">
        </div>
        <div class="aspect-square bg-gray-50 rounded-full overflow-hidden p-8 flex items-center justify-center group">
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" alt="Detail 2">
        </div>
      </div>

      <div class="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border-color)] text-left mx-auto max-w-3xl">
        <h3 class="text-lg font-bold mb-4 text-center">保养指南</h3>
        <ul class="space-y-3 text-gray-600 list-disc pl-5">
          <li>避免接触化学物品：如香水、化妆品、洗洁精等，以免腐蚀表面。</li>
          <li>避免剧烈碰撞：虽然金属坚硬，但剧烈撞击可能导致宝石松动或表面划伤。</li>
          <li>定期清洁：使用软布轻轻擦拭，保持光泽。</li>
          <li>单独存放：建议将首饰单独存放在首饰盒中，避免相互摩擦。</li>
        </ul>
      </div>
    </div>
  `,
  "electronics": (title: string, image: string) => `
    <div class="space-y-8">
      <div class="relative rounded-2xl overflow-hidden h-80">
        <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" alt="Tech Banner" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h3 class="text-3xl font-bold text-white tracking-wider">科技改变生活</h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-gray-800">产品概览</h3>
          <p class="text-gray-600 leading-relaxed">
            "${title}" 采用了最新的技术架构，旨在为您提供无与伦比的性能体验。无论是高效办公、沉浸式娱乐还是专业创作，它都能轻松应对。
          </p>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              高性能处理器，极速响应
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              持久续航，全天候陪伴
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              简约工业设计，坚固耐用
            </li>
          </ul>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl">
          <h3 class="text-xl font-bold text-gray-800 mb-4">技术规格</h3>
          <table class="w-full text-sm text-left">
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 text-gray-500">连接性</td>
                <td class="py-3 font-medium">Bluetooth 5.0, USB-C</td>
              </tr>
              <tr>
                <td class="py-3 text-gray-500">材质</td>
                <td class="py-3 font-medium">航空级铝合金 / 高强度 ABS</td>
              </tr>
              <tr>
                <td class="py-3 text-gray-500">保修</td>
                <td class="py-3 font-medium">2 年有限保修</td>
              </tr>
              <tr>
                <td class="py-3 text-gray-500">包装清单</td>
                <td class="py-3 font-medium">主机 x1, 说明书 x1, 数据线 x1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="grid grid-cols-3 gap-4 h-48">
         <img src="${image}" class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity" alt="Gallery 1">
         <img src="https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity" alt="Gallery 2">
         <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity" alt="Gallery 3">
      </div>
    </div>
  `,
  "women's clothing": (title: string, image: string) => `
    <div class="space-y-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 relative">
           <div class="absolute -top-4 -left-4 w-24 h-24 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
           <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
           <img src="${image}" alt="Fashion Shot" class="relative rounded-lg shadow-xl w-full">
        </div>
        <div class="order-1 md:order-2 space-y-4">
          <h3 class="text-2xl font-serif text-gray-800">优雅，不止于形</h3>
          <p class="text-gray-600 leading-relaxed">
            "${title}" 专为现代女性打造。我们深知，真正的时尚不仅仅是外表的华丽，更是内在自信的流露。这款服装采用了流线型剪裁，能够完美修饰身形，同时保证了穿着的舒适度。
          </p>
          <div class="flex gap-4 pt-4">
             <div class="text-center">
                <div class="text-2xl font-bold text-[var(--primary-color)]">100%</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">舒适体验</div>
             </div>
             <div class="w-px bg-gray-300"></div>
             <div class="text-center">
                <div class="text-2xl font-bold text-[var(--primary-color)]">3D</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">立体剪裁</div>
             </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 p-8 rounded-2xl">
        <h3 class="text-lg font-bold mb-4 text-center">搭配建议</h3>
        <p class="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          无论是搭配简约的牛仔裤，还是优雅的半身裙，它都能轻松驾驭。加上一条精致的项链或丝巾，瞬间提升整体造型的层次感。
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
           <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80" class="rounded-lg aspect-[3/4] object-cover" alt="Style 1">
           <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" class="rounded-lg aspect-[3/4] object-cover" alt="Style 2">
           <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80" class="rounded-lg aspect-[3/4] object-cover" alt="Style 3">
           <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80" class="rounded-lg aspect-[3/4] object-cover" alt="Style 4">
        </div>
      </div>
    </div>
  `
}

export const products: Product[] = [
  {
    id: 1,
    title: '北极狐 - Foldsack No. 1 背包，适配 15 英寸笔记本',
    price: 109.95,
    description: '您日常使用和森林漫步的完美背包。将您的笔记本电脑（最大 15 英寸）放入带衬垫的隔层中，满足您的日常需求。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1581605405669-fdaf81177145?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["men's clothing"]('北极狐 - Foldsack No. 1 背包', 'https://images.unsplash.com/photo-1581605405669-fdaf81177145?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1581605405669-fdaf81177145?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 2,
    title: '男士休闲高级修身 T 恤',
    price: 22.3,
    description: '修身款式，撞色插肩长袖，三扣亨利领，轻盈柔软的面料，透气舒适。坚固的缝合衬衫，圆领设计，经久耐用，非常适合休闲时尚穿着和忠实棒球迷。亨利风格圆领包含三扣门襟。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["men's clothing"]('男士休闲高级修身 T 恤', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.1, count: 259 }
  },
  {
    id: 3,
    title: '男士棉质夹克',
    price: 55.99,
    description: '春秋冬季绝佳的外套夹克，适合多种场合，如工作、徒步旅行、露营、登山/攀岩、骑行、旅行或其他户外活动。送给您或您的家人的好礼物。在这个感恩节或圣诞节送给父亲、丈夫或儿子的温暖爱意。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["men's clothing"]('男士棉质夹克', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551488852-d81a2d5e2197?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.7, count: 500 }
  },
  {
    id: 4,
    title: '男士休闲修身款',
    price: 15.99,
    description: '屏幕上的颜色可能与实际略有不同。/ 请注意，体型因人而异，因此，请参阅下面的产品说明中的详细尺寸信息。',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["men's clothing"]('男士休闲修身款', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.1, count: 430 }
  },
  {
    id: 5,
    title: 'John Hardy 女士传奇 Naga 金银龙形手链',
    price: 695,
    description: '来自我们的传奇系列，Naga 的灵感来自保护海洋珍珠的神话水龙。向内佩戴可获得爱与富足，向外佩戴可获得保护。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["jewelery"]('John Hardy 女士传奇 Naga 金银龙形手链', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-cd71b1802317?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.6, count: 400 }
  },
  {
    id: 6,
    title: '纯金微镶小巧饰品',
    price: 168,
    description: '满意保证。30 天内退换任何订单。由美国 Hafeez Center 设计和销售。满意保证。30 天内退换任何订单。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1603561591411-cd71b1802317?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["jewelery"]('纯金微镶小巧饰品', 'https://images.unsplash.com/photo-1603561591411-cd71b1802317?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1603561591411-cd71b1802317?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3.9, count: 70 }
  },
  {
    id: 7,
    title: '白金镀层公主方形戒指',
    price: 9.99,
    description: '经典创作为她打造的订婚婚礼单钻承诺戒指。在订婚、婚礼、周年纪念日、情人节宠爱您的爱人的礼物...',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["jewelery"]('白金镀层公主方形戒指', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-cd71b1802317?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3, count: 400 }
  },
  {
    id: 8,
    title: 'Pierced Owl 玫瑰金镀层不锈钢双隧道耳塞',
    price: 10.99,
    description: '玫瑰金镀层双喇叭隧道耳钉。采用 316L 不锈钢制成。',
    category: 'jewelery',
    image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["jewelery"]('Pierced Owl 玫瑰金镀层不锈钢双隧道耳塞', 'https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 1.9, count: 100 }
  },
  {
    id: 9,
    title: 'WD 2TB Elements 便携式外置硬盘 - USB 3.0',
    price: 64,
    description: 'USB 3.0 和 USB 2.0 兼容。快速数据传输。提高 PC 性能。高容量；兼容 NTFS 格式（Windows）。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1531492391342-e91166b74828?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('WD 2TB Elements 便携式外置硬盘', 'https://images.unsplash.com/photo-1531492391342-e91166b74828?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1531492391342-e91166b74828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611078489935-0cb964de46f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597872252721-24642f83247d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3.3, count: 203 }
  },
  {
    id: 10,
    title: 'SanDisk SSD PLUS 1TB 内置固态硬盘 - SATA III 6Gb/s',
    price: 109,
    description: '提升启动、关机、应用加载和响应速度（与 5400 RPM SATA 2.5 英寸硬盘相比；基于内部基准测试）。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1597872252721-24642f83247d?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('SanDisk SSD PLUS 1TB 内置固态硬盘', 'https://images.unsplash.com/photo-1597872252721-24642f83247d?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1597872252721-24642f83247d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558486012-81714731557f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.9, count: 470 }
  },
  {
    id: 11,
    title: 'Silicon Power 256GB SSD 3D NAND A55 SLC 缓存性能增强',
    price: 109,
    description: '3D NAND 闪存应用提供更高的传输速度。显著提升系统启动、关闭、读写性能。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1558486012-81714731557f?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('Silicon Power 256GB SSD', 'https://images.unsplash.com/photo-1558486012-81714731557f?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1558486012-81714731557f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597872252721-24642f83247d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.8, count: 319 }
  },
  {
    id: 12,
    title: 'WD 4TB 游戏专用硬盘 - PlayStation 4 便携外置硬盘',
    price: 114,
    description: '兼容 PlayStation 4。即插即用，轻松扩展存储空间。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('WD 4TB 游戏专用硬盘', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531492391342-e91166b74828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611078489935-0cb964de46f9?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.8, count: 400 }
  },
  {
    id: 13,
    title: 'Acer SB220Q 21.5 英寸全高清 IPS 显示器',
    price: 599,
    description: '21.5 英寸全高清 (1920 x 1080) 宽屏 IPS 显示器。AMD Radeon FreeSync 技术。75Hz 刷新率。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('Acer SB220Q 21.5 英寸全高清 IPS 显示器', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.9, count: 250 }
  },
  {
    id: 14,
    title: '三星 49英寸 CHG90 144Hz 曲面游戏显示器',
    price: 999.99,
    description: '49 英寸超宽 32:9 曲面游戏显示器，量子点 (QLED) 技术，HDR 支持。',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["electronics"]('三星 49英寸 CHG90 144Hz 曲面游戏显示器', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.2, count: 140 }
  },
  {
    id: 15,
    title: 'BIYLACLESEN 女士三合一滑雪夹克 冬季大衣',
    price: 56.99,
    description: '注意：这件夹克是美码，请选择您平时的尺码。多口袋设计，适合多场景。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('BIYLACLESEN 女士三合一滑雪夹克', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551488852-d81a2d5e2197?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520183802803-06f731a2059f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.6, count: 235 }
  },
  {
    id: 16,
    title: 'Lock and Love 女士可拆卸连帽人造皮机车夹克',
    price: 29.95,
    description: '人造皮革材料，风格与舒适度兼备，二合一连帽皮夹克。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('Lock and Love 女士可拆卸连帽人造皮机车夹克', 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520183802803-06f731a2059f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591369822096-35c9389e46eb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 2.9, count: 340 }
  },
  {
    id: 17,
    title: '女士防风雨条纹登山雨衣夹克',
    price: 39.99,
    description: '轻便透气，防风防水快干面料，提供保护并保持透气。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1591369822096-35c9389e46eb?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('女士防风雨条纹登山雨衣夹克', 'https://images.unsplash.com/photo-1591369822096-35c9389e46eb?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1591369822096-35c9389e46eb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3.8, count: 679 }
  },
  {
    id: 18,
    title: 'MBJ 女士纯色短袖船领 V 领 T 恤',
    price: 9.85,
    description: '轻盈面料，非常适合夏季穿着，侧面褶皱设计，合身且时尚。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('MBJ 女士纯色短袖船领 V 领 T 恤', 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.7, count: 130 }
  },
  {
    id: 19,
    title: 'Opna 女士短袖吸湿排汗运动衫',
    price: 7.95,
    description: '极其轻便、柔软且有光泽，适合运动穿着。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('Opna 女士短袖吸湿排汗运动衫', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 4.5, count: 146 }
  },
  {
    id: 20,
    title: 'DANVOUY 女士 T 恤 休闲棉质短袖',
    price: 12.99,
    description: '面料柔软有弹性，独特风格，让您美丽、时尚、性感和优雅。',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
    detailHtml: richContentTemplates["women's clothing"]('DANVOUY 女士 T 恤 休闲棉质短袖', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80'),
    images: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=800&q=80'
    ],
    rating: { rate: 3.6, count: 145 }
  }
]
