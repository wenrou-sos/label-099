import bcrypt from 'bcryptjs'
import {
  User,
  Expert,
  Post,
  Comment,
  Product,
  Order,
  Review,
  Question,
  Watch,
  Notification,
  Favorite,
  Like,
} from './models/index.js'

const DEFAULT_PASSWORD = '123456'

export async function seed(): Promise<void> {
  console.log('[Seed] Starting database seeding...')

  const userCount = await User.count()
  if (userCount > 0) {
    console.log('[Seed] Database already has data, skipping.')
    return
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const usersData = [
    {
      username: 'lidoctor',
      email: 'lidoctor@momcare.com',
      password: hashedPassword,
      nickname: '李医生',
      role: 'expert' as const,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
      phone: '13800000001',
      bio: '三甲医院儿科副主任医师，从事儿童医疗工作15年，擅长新生儿护理、婴幼儿常见病诊治。',
      points: 8800,
      level: 8,
    },
    {
      username: 'wangnanny',
      email: 'wangnanny@momcare.com',
      password: hashedPassword,
      nickname: '王育儿师',
      role: 'expert' as const,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nanny',
      phone: '13800000002',
      bio: '高级育婴师/早教指导师，持有国家育婴师职业资格证书，专注0-3岁宝宝早期教育8年。',
      points: 6500,
      level: 6,
    },
    {
      username: 'tianxinmama',
      email: 'tianxin@momcare.com',
      password: hashedPassword,
      nickname: '甜心妈妈',
      role: 'user' as const,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tianxin',
      phone: '13800000003',
      bio: '家有2岁女宝一枚~分享育儿日常和好物',
      points: 2300,
      level: 3,
    },
    {
      username: 'doudouma',
      email: 'doudou@momcare.com',
      password: hashedPassword,
      nickname: '豆豆妈',
      role: 'user' as const,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doudou',
      phone: '13800000004',
      bio: '全职宝妈，宝宝10个月，新手妈妈一路打怪升级中！',
      points: 1500,
      level: 2,
    },
    {
      username: 'guoguomami',
      email: 'guoguo@momcare.com',
      password: hashedPassword,
      nickname: '果果妈咪',
      role: 'user' as const,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guoguo',
      phone: '13800000005',
      bio: '双胞胎妈妈，记录两个宝贝的成长足迹',
      points: 3600,
      level: 4,
    },
  ]

  const users: User[] = []
  for (const data of usersData) {
    const user = await User.create(data)
    users.push(user)
  }
  console.log(`[Seed] Created ${users.length} users`)

  const expertsData = [
    {
      userId: users[0].id,
      specialty: '儿科医疗',
      certification: '执业医师资格证',
      experienceYears: 15,
      consultPrice: 199,
      rating: 4.9,
      reviewCount: 286,
      consultCount: 532,
      verified: true,
    },
    {
      userId: users[1].id,
      specialty: '婴幼儿早教',
      certification: '高级育婴师职业资格证',
      experienceYears: 8,
      consultPrice: 129,
      rating: 4.8,
      reviewCount: 175,
      consultCount: 318,
      verified: true,
    },
  ]

  await Expert.bulkCreate(expertsData)
  console.log(`[Seed] Created ${expertsData.length} experts`)

  const postsData = [
    {
      userId: users[2].id,
      title: '宝宝6个月辅食添加全攻略，新手妈妈必看！',
      content: '宝宝6个月啦，正式开启辅食之旅！分享一下我做的攻略：\n1. 第一口辅食建议高铁米粉\n2. 循序渐进，每次只加一种新食物\n3. 观察3天无过敏再加新的\n4. 由稀到稠，由细到粗\n5. 不要加盐加糖\n我家宝宝吃的是地球最好米粉，适应得很好~',
      category: 'food' as const,
      likeCount: 328,
      commentCount: 56,
      favoriteCount: 189,
      viewCount: 2456,
      isHot: true,
    },
    {
      userId: users[3].id,
      title: '宝宝夜醒频繁怎么办？过来人分享经验',
      content: '豆豆从3个月开始夜醒，最多一晚上8次！经过一个月调整终于睡整觉了，分享几个关键点：\n\n1. 建立固定 bedtime routine\n2. 白天小睡不要超过3小时\n3. 睡前吃饱但不要过量\n4. 区分昼夜，白天窗帘拉开\n5. 夜醒先观察不要立刻抱\n现在豆豆一觉能睡8-10小时，老母亲终于解放了！',
      category: 'sleep' as const,
      likeCount: 256,
      commentCount: 89,
      favoriteCount: 312,
      viewCount: 3189,
      isHot: true,
    },
    {
      userId: users[0].id,
      title: '【儿科医生说】宝宝发烧正确处理方式',
      content: '作为儿科医生，门诊经常遇到宝宝发烧的家长，今天系统讲一下发烧怎么处理：\n\n首先：发烧是症状不是疾病，是身体对抗感染的表现！\n\n处理原则：\n- 3个月以下宝宝：任何发烧立即就医\n- 3-6个月：超过38.3度考虑用药\n- 6个月以上：超过38.5度或精神差时用药\n\n正确退烧方法：\n1. 对乙酰氨基酚（泰诺林）3个月以上可用\n2. 布洛芬（美林）6个月以上可用\n3. 不要物理降温！不要酒精擦浴！不要捂汗！\n4. 多喝水/奶，适当减少衣物\n\n什么时候必须去医院：\n- 持续高热超过3天\n- 精神差、嗜睡\n- 抽搐\n- 皮疹\n- 频繁呕吐腹泻脱水\n- 呼吸急促\n\n有问题可以评论区问我~',
      category: 'experience' as const,
      likeCount: 892,
      commentCount: 234,
      favoriteCount: 1256,
      viewCount: 15678,
      isPinned: true,
      isHot: true,
    },
    {
      userId: users[4].id,
      title: '产后42天复查经验分享，这些项目一定要做！',
      content: '刚生完双胞胎，42天复查终于过了！分享一下哪些检查必须做：\n\n妈妈这边：\n1. B超检查子宫恢复情况\n2. 盆底功能评估（非常重要！我就有点损伤，现在在做康复）\n3. 伤口检查（剖腹产看子宫切口，顺产看会阴）\n4. 血常规、尿常规\n5. 血压、体重\n\n宝宝这边：\n1. 生长发育评估（身高体重头围）\n2. 髋关节B超（排查髋关节发育不良）\n3. 听力/视力复查\n4. 神经行为评估\n5. 心脏听诊\n\n建议提前预约，人真的很多！',
      category: 'postpartum' as const,
      likeCount: 178,
      commentCount: 45,
      favoriteCount: 267,
      viewCount: 1892,
    },
    {
      userId: users[2].id,
      title: '宝宝餐椅怎么选？四款热门款真实测评',
      content: '入手了四款网红餐椅，给大家做个对比测评：\n\n1. 宜家安迪洛：¥99，便宜好清洗，但不能调节，适合6月+能坐稳的宝宝\n2. 费雪多功能：¥399，能当摇椅能当餐椅，用到3岁，但占地方\n3. Stokke Steps：¥1999，颜值高，可调节，用到成人，但贵\n4. 可优比折叠：¥299，折叠方便，小户型友好，但稳定性一般\n\n综合推荐：预算有限选宜家，想一步到位选Stokke，小户型选可优比',
      category: 'other' as const,
      likeCount: 145,
      commentCount: 67,
      favoriteCount: 98,
      viewCount: 2341,
    },
    {
      userId: users[1].id,
      title: '0-1岁宝宝绘本推荐，培养阅读兴趣从小开始',
      content: '作为早教老师，给大家推荐适合0-1岁宝宝的绘本：\n\n0-3个月：黑白卡、彩色卡，刺激视觉发育\n4-6个月：布书、触摸书，探索不同材质\n7-9个月：洞洞书、翻翻书，锻炼精细动作\n10-12个月：认知书（动物、水果、交通工具）\n\n经典推荐：\n- 《猜猜我是谁》系列\n- 《小鸡球球》系列\n- 《好饿的毛毛虫》\n- 《棕色的熊》\n- 《蹦！》《哇！》\n\n每天陪宝宝读10分钟，坚持下来你会看到变化！',
      category: 'experience' as const,
      likeCount: 421,
      commentCount: 98,
      favoriteCount: 567,
      viewCount: 6789,
      isHot: true,
    },
    {
      userId: users[3].id,
      title: '宝宝红屁屁了怎么办？我的护理心得',
      content: '豆豆红屁屁了3天终于好了，分享一下我的护理方法：\n\n判断原因：\n- 尿液粪便刺激（最常见）\n- 纸尿裤过敏\n- 腹泻\n- 念珠菌感染\n\n护理步骤：\n1. 勤换纸尿裤，2-3小时一换，拉了立刻换\n2. 温水洗屁屁，不要用湿巾（除非外出）\n3. 用柔软的棉柔巾按干，不要擦！\n4. 涂护臀膏厚厚一层，形成隔离层\n5. 每天晾屁屁15-20分钟\n6. 严重的话用氧化锌软膏\n\n我的红屁屁克星：氧化锌软膏+勤晾+勤换',
      category: 'experience' as const,
      likeCount: 287,
      commentCount: 76,
      favoriteCount: 398,
      viewCount: 4521,
    },
    {
      userId: users[4].id,
      title: '双胞胎妈妈的一天，累并快乐着',
      content: '很多人好奇双胞胎妈妈的日常，分享一下我的一天：\n\n6:00 起床，两个宝贝陆续醒了\n6:30 喂奶+换尿布\n7:30 给宝宝洗脸洗屁屁，穿衣服\n8:00 自己吃饭，趁宝宝自己玩的时间\n9:00 哄睡上午觉（能睡1小时算好的）\n10:00 给宝宝做辅食\n11:00 喂辅食\n12:00 中午奶+午睡\n14:00 起床，洗脸，带出门遛弯\n16:00 回家，小睡半小时\n17:00 准备晚饭辅食\n18:00 喂辅食，爸爸陪玩\n19:30 洗澡\n20:30 哄睡\n21:00 属于自己的时间！\n\n虽然很累，但看到两个宝贝的笑脸就什么都值了~',
      category: 'other' as const,
      likeCount: 534,
      commentCount: 123,
      favoriteCount: 234,
      viewCount: 8934,
      isHot: true,
    },
  ]

  const posts: Post[] = []
  for (const data of postsData) {
    const post = await Post.create(data as any)
    posts.push(post)
  }
  console.log(`[Seed] Created ${posts.length} posts`)

  const commentsData = [
    { postId: posts[0].id, userId: users[3].id, content: '太有用了！我家宝宝马上6个月，正需要这个攻略', likeCount: 12 },
    { postId: posts[0].id, userId: users[4].id, content: '我们吃的嘉宝米粉也不错，含铁量高', likeCount: 8 },
    { postId: posts[0].id, userId: users[1].id, content: '专业建议：第一口辅食确实应该是高铁米粉，宝宝6个月后从母体储存的铁消耗得差不多了', likeCount: 45 },
    { postId: posts[1].id, userId: users[2].id, content: '太有共鸣了！我家也是夜醒无数次，请问bedtime routine具体怎么做？', likeCount: 15 },
    { postId: posts[1].id, userId: users[1].id, content: '睡眠训练确实很重要，建议看看《百岁医师》这本书', likeCount: 23 },
    { postId: posts[2].id, userId: users[2].id, content: '谢谢李医生！我家宝宝发烧就靠这篇文章救急的', likeCount: 34 },
    { postId: posts[2].id, userId: users[4].id, content: '李医生，请问泰诺林和美林可以交替使用吗？', likeCount: 18 },
    { postId: posts[2].id, userId: users[3].id, content: '收藏了！新手妈妈必备知识', likeCount: 28 },
    { postId: posts[3].id, userId: users[2].id, content: '盆底检查真的很重要！我也在做康复训练', likeCount: 12 },
    { postId: posts[5].id, userId: users[0].id, content: '绘本阅读对宝宝大脑发育确实很有帮助，王老师推荐得很专业', likeCount: 19 },
    { postId: posts[5].id, userId: users[3].id, content: '小鸡球球我家超爱！每天都要翻', likeCount: 16 },
    { postId: posts[6].id, userId: users[2].id, content: '氧化锌yyds！我家也是用这个', likeCount: 22 },
  ]

  const comments = await Comment.bulkCreate(commentsData, { returning: true })
  console.log(`[Seed] Created ${comments.length} comments`)

  const productsData = [
    {
      sellerId: users[2].id,
      title: '99新 Stokke Tripp Trapp 成长椅 原木色',
      description: '去年双十一购入，宝宝坐了不到5次就闲置了，几乎全新，配件齐全，带原装餐椅套件和安全带。包装说明书都在。座椅可以从6个月用到成人，真的是一把椅子用到大！',
      category: '儿童家具',
      originalPrice: 1999,
      suggestedPrice: 1200,
      condition: 'like_new' as const,
      status: 'available' as const,
      favoriteCount: 34,
      viewCount: 456,
      location: '上海市浦东新区',
    },
    {
      sellerId: users[3].id,
      title: '全新未拆封 博格步C3婴儿推车 黑色',
      description: '朋友送的，但家里已经有一辆了，全新未拆封！博格步Bugaboo C3，高景观推车，避震好，颜值高。官网价4999，转让给需要的宝妈',
      category: '婴儿推车',
      originalPrice: 4999,
      suggestedPrice: 3500,
      condition: 'new' as const,
      status: 'available' as const,
      favoriteCount: 67,
      viewCount: 892,
      location: '北京市朝阳区',
    },
    {
      sellerId: users[4].id,
      title: '轻微使用 好孩子安全座椅 CS860 接口款',
      description: '用了8个月，孩子大了换增高垫了。9个月-12岁可用，ISOFIX接口，五点式安全带。有正常使用痕迹，功能完好无损，安全座椅保护孩子出行安全。',
      category: '安全座椅',
      originalPrice: 2399,
      suggestedPrice: 1080,
      condition: 'minor' as const,
      status: 'available' as const,
      favoriteCount: 23,
      viewCount: 345,
      location: '广州市天河区',
    },
    {
      sellerId: users[2].id,
      title: '费雪 Fisher-Price 钢琴健身架 九成新',
      description: '宝宝小时候最爱玩的玩具，锻炼腿部力量和手眼协调。功能完好，配件齐全，钢琴可以拆下来单独用。宝宝长大了用不上了，转给需要的家庭。',
      category: '婴儿玩具',
      originalPrice: 499,
      suggestedPrice: 299,
      condition: 'like_new' as const,
      status: 'available' as const,
      favoriteCount: 45,
      viewCount: 678,
      location: '上海市浦东新区',
    },
    {
      sellerId: users[3].id,
      title: '童泰婴儿秋冬连体衣 全新带吊牌 66码 5件打包',
      description: '买太多没来得及穿就小了，都是66码，适合3-6个月宝宝。童泰的质量真的很好，纯棉A类。5件打包出，单买也可以，15元一件。',
      category: '童装',
      originalPrice: 395,
      suggestedPrice: 158,
      condition: 'new' as const,
      status: 'available' as const,
      favoriteCount: 12,
      viewCount: 234,
      location: '北京市朝阳区',
    },
    {
      sellerId: users[4].id,
      title: '明显使用 宜家桑维婴儿床 白色 含床垫',
      description: '双胞胎宝宝用了一年多，有轻微咬痕和使用痕迹，但整体结构完好无损。床垫是宜家配套的，可调节高度，有2档。原价999+399=1398，现白菜价出。',
      category: '婴儿床',
      originalPrice: 1398,
      suggestedPrice: 420,
      condition: 'visible' as const,
      status: 'available' as const,
      favoriteCount: 18,
      viewCount: 567,
      location: '广州市天河区',
    },
    {
      sellerId: users[2].id,
      title: '巧虎乐智小天地 宝宝版绘本+玩具 13-24月龄 全套',
      description: '订购了一年巧虎，正版的。从13月龄到24月龄，共12套绘本+玩具。我们家宝宝很喜欢，养成了很多好习惯。现在转给需要的宝妈，书和玩具都保存得不错。',
      category: '绘本早教',
      originalPrice: 1800,
      suggestedPrice: 810,
      condition: 'minor' as const,
      status: 'available' as const,
      favoriteCount: 56,
      viewCount: 789,
      location: '上海市浦东新区',
    },
    {
      sellerId: users[3].id,
      title: '99新 美德乐 丝韵·翼 双边电动吸奶器',
      description: '断奶了用不上，购入半年，使用时长不超过3个月。真的是追奶神器！双边同时吸效率很高，节省时间。所有配件齐全，导管已换新，送两个全新吸乳护罩。',
      category: '母婴用品',
      originalPrice: 1599,
      suggestedPrice: 960,
      condition: 'like_new' as const,
      status: 'available' as const,
      favoriteCount: 38,
      viewCount: 654,
      location: '北京市朝阳区',
    },
    {
      sellerId: users[4].id,
      title: 'Babycare 皇室拉拉裤 XXL码 全新4包',
      description: '囤多了！宝宝已经不穿拉拉裤了，还剩4包未拆封。Babycare皇室弱酸系列，非常柔软亲肤，一夜一片没问题。XXL码，适合15kg以上宝宝，一包32片。',
      category: '母婴用品',
      originalPrice: 796,
      suggestedPrice: 557,
      condition: 'new' as const,
      status: 'available' as const,
      favoriteCount: 28,
      viewCount: 432,
      location: '广州市天河区',
    },
    {
      sellerId: users[2].id,
      title: 'babycare 学饮杯+鸭嘴杯+保温杯 3件套',
      description: '学饮杯用过几次，鸭嘴杯用了一个月，保温杯全新。都是bbc家的，质量真的好。宝宝已经用大杯子了，这一套打包出，适合学喝水阶段的宝宝。',
      category: '母婴用品',
      originalPrice: 397,
      suggestedPrice: 139,
      condition: 'minor' as const,
      status: 'available' as const,
      favoriteCount: 15,
      viewCount: 278,
      location: '上海市浦东新区',
    },
  ]

  const products: Product[] = []
  for (const data of productsData) {
    const product = await Product.create(data as any)
    products.push(product)
  }
  console.log(`[Seed] Created ${products.length} products`)

  function generateOrderNo(): string {
    const now = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MC${timestamp}${random}`
  }

  const ordersData = [
    {
      orderNo: generateOrderNo(),
      productId: products[0].id,
      buyerId: users[3].id,
      sellerId: users[2].id,
      price: 1200,
      status: 'completed' as const,
      address: '北京市朝阳区望京街道xxx小区3号楼1单元101',
      phone: '13800000004',
      remark: '请尽快发货，谢谢！',
      paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      orderNo: generateOrderNo(),
      productId: products[3].id,
      buyerId: users[4].id,
      sellerId: users[2].id,
      price: 299,
      status: 'shipped' as const,
      address: '广州市天河区珠江新城xxx花园A栋2501',
      phone: '13800000005',
      remark: '',
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      orderNo: generateOrderNo(),
      productId: products[4].id,
      buyerId: users[4].id,
      sellerId: users[3].id,
      price: 158,
      status: 'paid' as const,
      address: '广州市天河区珠江新城xxx花园A栋2501',
      phone: '13800000005',
      remark: '麻烦检查好再发货哦~',
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      orderNo: generateOrderNo(),
      productId: products[8].id,
      buyerId: users[3].id,
      sellerId: users[4].id,
      price: 557,
      status: 'pending' as const,
      address: '北京市朝阳区望京街道xxx小区3号楼1单元101',
      phone: '13800000004',
      remark: '',
    },
    {
      orderNo: generateOrderNo(),
      productId: products[5].id,
      buyerId: users[2].id,
      sellerId: users[4].id,
      price: 420,
      status: 'completed' as const,
      address: '上海市浦东新区陆家嘴xxx大厦公寓1802',
      phone: '13800000003',
      remark: '自提也可以',
      paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
  ]

  const orders: Order[] = []
  for (const data of ordersData) {
    const order = await Order.create(data as any)
    orders.push(order)
  }
  console.log(`[Seed] Created ${orders.length} orders`)

  const reviewsData = [
    {
      orderId: orders[0].id,
      fromUserId: users[3].id,
      toUserId: users[2].id,
      productId: products[0].id,
      rating: 5,
      content: '椅子非常新，和描述一致，卖家打包很仔细，物流也快。宝宝坐上很开心！非常满意的一次购物！',
      type: 'order' as const,
    },
    {
      orderId: orders[4].id,
      fromUserId: users[2].id,
      toUserId: users[4].id,
      productId: products[5].id,
      rating: 4,
      content: '床和描述一样，有使用痕迹但是不影响使用，性价比很高。卖家态度也很好，就是物流有点慢。',
      type: 'order' as const,
    },
  ]

  await Review.bulkCreate(reviewsData)
  console.log(`[Seed] Created ${reviewsData.length} reviews`)

  const questionsData = [
    {
      askerId: users[2].id,
      expertId: users[0].id,
      title: '宝宝7天没拉粑粑了，是便秘吗？需要去医院吗？',
      content: '李医生您好！我家宝宝5个月纯母乳，之前都是一天拉2-3次，这次已经7天没拉了，但是吃喝正常，精神也很好，肚子也不硬，放屁臭臭的。请问是攒肚子还是便秘？需要用开塞露吗？',
      category: '儿科医疗',
      status: 'answered' as const,
      price: 199,
      watchCount: 45,
      answer: '宝妈您好！根据您描述的情况，宝宝是典型的攒肚子，不是便秘，请放心！\n\n判断标准：\n1. 纯母乳宝宝吸收好，食物残渣少，大便间隔长是正常的\n2. 关键看精神、吃奶、肚子是否胀，您家都是正常的\n3. 攒肚便便是软糊状的，便秘是硬便\n\n处理建议：\n1. 不需要用开塞露！不要干预！\n2. 可以多做排气操、顺时针揉肚子\n3. 多趴多运动\n4. 等待自然排便即可\n\n如果出现呕吐、腹胀、精神差、食欲下降再考虑就医。',
      answeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      askerId: users[3].id,
      expertId: users[1].id,
      title: '10个月宝宝还不会爬，正常吗？怎么训练？',
      content: '王老师您好！我家宝宝10个月了还不会爬，趴一会儿就哭，喜欢站着蹦，但还不会独立站。请问发育正常吗？会不会影响走路？需要怎么训练？',
      category: '婴幼儿早教',
      status: 'answered' as const,
      price: 129,
      watchCount: 89,
      answer: '宝妈您好！首先不用太焦虑，10个月不会爬是在正常范围内的。每个宝宝发育节奏不一样！\n\n关于爬行：\n1. 爬行不是必须的，有些宝宝直接跳过爬行走路\n2. 但爬行对协调能力、大脑发育很有好处，尽量引导\n\n训练方法：\n1. 创设机会：多趴，趴是一切大运动的基础\n2. 家长示范：和宝宝一起在地上爬，让宝宝模仿\n3. 玩具诱惑：在宝宝前方放喜欢的玩具，引导去够\n4. 帮忙辅助：用手顶住宝宝脚掌，给一个支撑\n5. 减少抱的时间，给宝宝自由活动空间\n\n如果12个月还一点移动的意愿都没有，再考虑检查。现在积极引导就好！',
      answeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      askerId: users[4].id,
      title: '双胞胎宝宝总是抢玩具打架怎么办？',
      content: '各位有经验的宝妈或者专家，我家双胞胎男宝1岁3个月，最近总是抢玩具，谁拿了另一个就要，哭闹打滚都有。我试过一人买一样的也没用，就要对方的。每天劝架累死了，请问这个阶段正常吗？怎么引导？',
      category: '婴幼儿早教',
      status: 'pending' as const,
      price: 0,
      watchCount: 156,
    },
    {
      askerId: users[2].id,
      title: '宝宝长湿疹反复怎么办？',
      content: '宝宝脸颊和脖子湿疹反复，擦了药膏好几天又长，母乳喂养我已经忌口了，海鲜鸡蛋牛奶都不吃，但还是反复。大家有什么好办法吗？有没有什么好的保湿霜推荐？',
      category: '儿科医疗',
      status: 'pending' as const,
      price: 0,
      watchCount: 234,
    },
    {
      askerId: users[3].id,
      expertId: users[0].id,
      title: '宝宝血常规检查贫血怎么办？',
      content: '李医生您好！宝宝10个月体检，血常规说贫血，血红蛋白97，正常是110-140。医生开了补铁剂，但宝宝吃了拉黑便，而且很抗拒吃。请问食补可以吗？吃什么补铁效果好？',
      category: '儿科医疗',
      status: 'accepted' as const,
      price: 199,
      watchCount: 78,
    },
    {
      askerId: users[4].id,
      expertId: users[1].id,
      title: '宝宝2岁了说话很少，是语言发育迟缓吗？',
      content: '王老师您好！我家双胞胎2岁了，老大只会叫爸爸妈妈，老二会说的多一点，但跟同龄比差很多。能听懂指令，会用手势，就是不说。需要去医院检查吗？在家怎么引导？',
      category: '婴幼儿早教',
      status: 'answered' as const,
      price: 129,
      watchCount: 112,
      answer: '宝妈您好！2岁宝宝语言发育的参考标准是：能说50个以上的词，能说2-3个词的短句。\n\n根据您的描述，老大确实需要关注一下，但先别着急下发育迟缓的结论。\n\n建议：\n1. 先去医院做个专业评估，排查听力、口腔等生理问题\n2. 如果评估没问题，在家多引导\n\n家庭引导方法：\n1. 减少电子产品时间，尤其不要看手机\n2. 多和宝宝说话，描述正在做的事\n3. 读绘本，每天至少15分钟\n4. 不要替宝宝说话，让他用语言表达需求\n5. 给选择：你要苹果还是香蕉？引导开口\n6. 多和同龄小朋友玩\n7. 回应宝宝的任何发声尝试，鼓励他\n\n两个宝一起带其实有优势，他们之间会互相学习！坚持引导会有惊喜的~',
      answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]

  const questions: Question[] = []
  for (const data of questionsData) {
    const question = await Question.create(data as any)
    questions.push(question)
  }
  console.log(`[Seed] Created ${questions.length} questions`)

  const watchesData = [
    { questionId: questions[0].id, userId: users[3].id },
    { questionId: questions[0].id, userId: users[4].id },
    { questionId: questions[1].id, userId: users[2].id },
    { questionId: questions[2].id, userId: users[2].id },
    { questionId: questions[2].id, userId: users[3].id },
    { questionId: questions[3].id, userId: users[2].id },
    { questionId: questions[3].id, userId: users[3].id },
    { questionId: questions[3].id, userId: users[4].id },
    { questionId: questions[4].id, userId: users[2].id },
    { questionId: questions[5].id, userId: users[3].id },
  ]

  await Watch.bulkCreate(watchesData)
  console.log(`[Seed] Created ${watchesData.length} watches`)

  const likesData = [
    { userId: users[2].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[3].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[4].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[0].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[1].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[2].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[3].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[4].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[0].id, targetType: 'post' as const, targetId: posts[1].id },
    { userId: users[1].id, targetType: 'post' as const, targetId: posts[1].id },
    { userId: users[2].id, targetType: 'comment' as const, targetId: comments[0].id },
    { userId: users[3].id, targetType: 'comment' as const, targetId: comments[2].id },
    { userId: users[4].id, targetType: 'comment' as const, targetId: comments[2].id },
  ]

  await Like.bulkCreate(likesData)
  console.log(`[Seed] Created ${likesData.length} likes`)

  const favoritesData = [
    { userId: users[3].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[4].id, targetType: 'post' as const, targetId: posts[0].id },
    { userId: users[2].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[3].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[4].id, targetType: 'post' as const, targetId: posts[2].id },
    { userId: users[2].id, targetType: 'post' as const, targetId: posts[3].id },
    { userId: users[3].id, targetType: 'post' as const, targetId: posts[5].id },
    { userId: users[2].id, targetType: 'product' as const, targetId: products[1].id },
    { userId: users[3].id, targetType: 'product' as const, targetId: products[1].id },
    { userId: users[4].id, targetType: 'product' as const, targetId: products[0].id },
    { userId: users[2].id, targetType: 'product' as const, targetId: products[2].id },
    { userId: users[3].id, targetType: 'product' as const, targetId: products[6].id },
  ]

  await Favorite.bulkCreate(favoritesData)
  console.log(`[Seed] Created ${favoritesData.length} favorites`)

  const notificationsData = [
    {
      userId: users[2].id,
      type: 'like' as const,
      title: '点赞通知',
      content: '豆豆妈 等5人赞了你的帖子《宝宝6个月辅食添加全攻略》',
      relatedId: posts[0].id,
      relatedType: 'post',
      isRead: true,
    },
    {
      userId: users[2].id,
      type: 'comment' as const,
      title: '评论通知',
      content: '李医生 评论了你的帖子：专业建议：第一口辅食确实应该是高铁米粉...',
      relatedId: comments[2].id,
      relatedType: 'comment',
      isRead: true,
    },
    {
      userId: users[2].id,
      type: 'order' as const,
      title: '订单通知',
      content: '恭喜！你的商品《99新 Stokke Tripp Trapp 成长椅》已被购买',
      relatedId: orders[0].id,
      relatedType: 'order',
      isRead: true,
    },
    {
      userId: users[3].id,
      type: 'answer' as const,
      title: '问答已回复',
      content: '王育儿师 回复了你的提问《10个月宝宝还不会爬，正常吗？》',
      relatedId: questions[1].id,
      relatedType: 'question',
      isRead: false,
    },
    {
      userId: users[3].id,
      type: 'order' as const,
      title: '订单通知',
      content: '你的订单《费雪 Fisher-Price 钢琴健身架》已发货',
      relatedId: orders[1].id,
      relatedType: 'order',
      isRead: true,
    },
    {
      userId: users[3].id,
      type: 'order' as const,
      title: '订单通知',
      content: '你有新的待支付订单，请在30分钟内完成付款',
      relatedId: orders[3].id,
      relatedType: 'order',
      isRead: false,
    },
    {
      userId: users[4].id,
      type: 'question' as const,
      title: '提问被围观',
      content: '你的提问《双胞胎宝宝总是抢玩具打架怎么办？》已有156人关注',
      relatedId: questions[2].id,
      relatedType: 'question',
      isRead: false,
    },
    {
      userId: users[4].id,
      type: 'order' as const,
      title: '订单通知',
      content: '果果妈咪 购买了你的商品《Babycare 皇室拉拉裤》，请尽快发货',
      relatedId: orders[3].id,
      relatedType: 'order',
      isRead: false,
    },
    {
      userId: users[0].id,
      type: 'question' as const,
      title: '新的咨询',
      content: '你收到新的付费咨询《宝宝血常规检查贫血怎么办？》，请尽快回复',
      relatedId: questions[4].id,
      relatedType: 'question',
      isRead: false,
    },
    {
      userId: users[0].id,
      type: 'system' as const,
      title: '平台公告',
      content: '母婴社区平台V2.0版本已上线！新增二手交易市场和专家咨询功能，欢迎体验~',
      isRead: true,
    },
    {
      userId: users[1].id,
      type: 'system' as const,
      title: '平台公告',
      content: '母婴社区平台V2.0版本已上线！新增二手交易市场和专家咨询功能，欢迎体验~',
      isRead: true,
    },
    {
      userId: users[2].id,
      type: 'system' as const,
      title: '平台公告',
      content: '母婴社区平台V2.0版本已上线！新增二手交易市场和专家咨询功能，欢迎体验~',
      isRead: false,
    },
    {
      userId: users[3].id,
      type: 'system' as const,
      title: '平台公告',
      content: '母婴社区平台V2.0版本已上线！新增二手交易市场和专家咨询功能，欢迎体验~',
      isRead: false,
    },
    {
      userId: users[4].id,
      type: 'system' as const,
      title: '平台公告',
      content: '母婴社区平台V2.0版本已上线！新增二手交易市场和专家咨询功能，欢迎体验~',
      isRead: false,
    },
    {
      userId: users[0].id,
      type: 'like' as const,
      title: '点赞通知',
      content: '你的帖子《【儿科医生说】宝宝发烧正确处理方式》获得了892个赞！',
      relatedId: posts[2].id,
      relatedType: 'post',
      isRead: true,
    },
  ]

  await Notification.bulkCreate(notificationsData)
  console.log(`[Seed] Created ${notificationsData.length} notifications`)

  console.log('[Seed] Database seeding completed successfully!')
  console.log(`[Seed] Test accounts created (password: ${DEFAULT_PASSWORD}):`)
  users.forEach(u => {
    console.log(`  - ${u.nickname}: ${u.username} / ${u.email}`)
  })
}

export default seed
