import prisma from "../src/lib/prisma";
import { MOCK_PRODUCTS } from "../src/data/mock-products";
import bcrypt from "bcryptjs";
import { CategoryTranslations, ProductTranslations } from "../src/types/product";

const CATEGORY_TRANSLATIONS: Record<string, CategoryTranslations> = {
  keyboards: {
    uz: { name: "Klaviaturalar" },
    en: { name: "Keyboards" },
  },
  mice: {
    uz: { name: "Sichqonchalar" },
    en: { name: "Mice" },
  },
  headsets: {
    uz: { name: "Quloqchinlar" },
    en: { name: "Headsets" },
  },
  monitors: {
    uz: { name: "Monitorlar" },
    en: { name: "Monitors" },
  },
  storage: {
    uz: { name: "Xotira disklari" },
    en: { name: "Storage" },
  },
  accessories: {
    uz: { name: "Aksessuarlar" },
    en: { name: "Accessories" },
  },
};

const PRODUCT_TRANSLATIONS: Record<string, ProductTranslations> = {
  // 1. Клавиатуры
  "prod-kb-01": {
    uz: {
      name: "CyberKeys Pro RGB Mexanik klaviaturasi",
      shortDescription: "Gateron Red svitchlari va PBT tugmachali premium mexanik klaviatura.",
      description: "Hot-Swap almashtirish funksiyasi, moylangan stabilizatorlar va shovqin izolyatsiyasiga ega simsiz mexanik klaviatura.",
      characteristics: {
        "Svitch turi": "Gateron Red (Chiziqli)",
        "Form-faktor": "75% (84 tugma)",
        "Ulanish": "2.4GHz / Bluetooth 5.1 / Type-C",
        "Keykap materiali": "PBT Doubleshot",
      },
    },
    en: {
      name: "CyberKeys Pro RGB Mechanical Keyboard",
      shortDescription: "Premium custom mechanical keyboard with Gateron Red switches and PBT keycaps.",
      description: "Wireless mechanical keyboard featuring Hot-Swap switches, pre-lubed stabilizers, and noise-dampening foam.",
      characteristics: {
        "Switch Type": "Gateron Red (Linear)",
        "Form Factor": "75% (84 keys)",
        "Connectivity": "2.4GHz / Bluetooth 5.1 / Type-C",
        "Keycap Material": "PBT Doubleshot",
      },
    },
  },
  "prod-kb-02": {
    uz: {
      name: "Apex Master TKL O'yin klaviaturasi",
      shortDescription: "Optik-mexanik svitchli o'ta tezkor kibersport klaviaturasi.",
      description: "Aviatsiya darajasidagi alyuminiy korpus, sozlanuvchi bosish nuqtasi va RGB-yoritish tizimi.",
      characteristics: {
        "Svitch turi": "Optical Linear Pro",
        "Form-faktor": "TKL (80%)",
        "So'rov chastotasi": "8000 Hz",
        "Yoritish": "Per-Key RGB 16.8M",
      },
    },
    en: {
      name: "Apex Master TKL Gaming Keyboard",
      shortDescription: "Ultra-fast esports keyboard with optical-mechanical switches.",
      description: "Aircraft-grade aluminum chassis, adjustable actuation points, and synchronized RGB backlighting.",
      characteristics: {
        "Switch Type": "Optical Linear Pro",
        "Form Factor": "TKL (80%)",
        "Polling Rate": "8000 Hz",
        "Backlight": "Per-Key RGB 16.8M",
      },
    },
  },
  "prod-kb-03": {
    uz: {
      name: "NanoSlim Wireless Simsiz klaviaturasi",
      shortDescription: "Ish va samaradorlik uchun past profilli ultra yupqa klaviatura.",
      description: "Qaychi mexanizmli ixcham dizayn, bir vaqtning o'zida 3 ta qurilmaga ulanish imkoniyati.",
      characteristics: {
        "Svitch turi": "Scissor Low-Profile",
        "Form-faktor": "Compact (65%)",
        "Ishlash vaqti": "300 soatgacha",
        "Material": "Anodlangan alyuminiy",
      },
    },
    en: {
      name: "NanoSlim Wireless Keyboard",
      shortDescription: "Low-profile ultra-slim keyboard designed for work and productivity.",
      description: "Compact scissor-switch design with simultaneous multi-device pairing for up to 3 devices.",
      characteristics: {
        "Switch Type": "Scissor Low-Profile",
        "Form Factor": "Compact (65%)",
        "Battery Life": "Up to 300 hours",
        "Material": "Anodized Aluminum",
      },
    },
  },

  // 2. Мыши
  "prod-ms-01": {
    uz: {
      name: "Phantom Strike Simsiz sichqonchasi",
      shortDescription: "49 gramm og'irlikdagi 26K DPI optik sensorli ultra-yengil ergonomik sichqoncha.",
      description: "PixArt PAW3395 flagman sensori, 100% PTFE teflon oyoqchalar va 90 soatgacha avtonom ishlash muddati.",
      characteristics: {
        "Sensor": "PixArt PAW3395 (26000 DPI)",
        "Og'irligi": "49 gramm",
        "Ulanish": "Wireless 2.4GHz / Type-C",
        "Tugmalar soni": "6 ta dasturlanuvchi",
      },
    },
    en: {
      name: "Phantom Strike Wireless Gaming Mouse",
      shortDescription: "Ultra-lightweight 49g ergonomic mouse with a 26K DPI optical sensor.",
      description: "Flagship PixArt PAW3395 sensor, 100% PTFE skates, and up to 90 hours of continuous battery life.",
      characteristics: {
        "Sensor": "PixArt PAW3395 (26000 DPI)",
        "Weight": "49 grams",
        "Connectivity": "Wireless 2.4GHz / Type-C",
        "Button Count": "6 programmable",
      },
    },
  },
  "prod-ms-02": {
    uz: {
      name: "Velocity X 8K Kibersport sichqonchasi",
      shortDescription: "Simmetrik shakl, 90 mln marta bosishga chidamli optik mikroswitchlar.",
      description: "8000 Hz so'rov chastotasi va o'ta egiluvchan parakord kabeliga ega simli kibersport sichqonchasi.",
      characteristics: {
        "Sensor": "Focus Pro 30K",
        "So'rov chastotasi": "8000 Hz",
        "Og'irligi": "54 gramm",
        "Kabel": "SpeedFlex 2.0m",
      },
    },
    en: {
      name: "Velocity X 8K Esports Mouse",
      shortDescription: "Symmetrical shape with optical switches rated for 90 million clicks.",
      description: "Wired esports gaming mouse with true 8000 Hz polling rate support and ultra-flexible paracord cable.",
      characteristics: {
        "Sensor": "Focus Pro 30K",
        "Polling Rate": "8000 Hz",
        "Weight": "54 grams",
        "Cable": "SpeedFlex 2.0m",
      },
    },
  },
  "prod-ms-03": {
    uz: {
      name: "ErgoGlide Vertical Ergonomik sichqonchasi",
      shortDescription: "Qo'l charchog'ini kamaytirish uchun vertikal anatomik sichqoncha.",
      description: "Qo'lning tabiiy holati uchun 57 gradusli qulay burchak, sokin tugmalar va Bluetooth qo'llab-quvvatlashi.",
      characteristics: {
        "Turi": "Vertikal anatomik",
        "Sensor": "Optik 4000 DPI",
        "Quvvat": "Akkumulyator Type-C 500mAh",
        "Ulanish": "Bluetooth / Radio kanal",
      },
    },
    en: {
      name: "ErgoGlide Vertical Ergonomic Mouse",
      shortDescription: "Vertical anatomical mouse designed to reduce wrist strain and fatigue.",
      description: "Optimal 57-degree angle for natural hand posture, quiet-click buttons, and multi-device Bluetooth support.",
      characteristics: {
        "Type": "Vertical anatomical",
        "Sensor": "Optical 4000 DPI",
        "Power": "Rechargeable Type-C 500mAh",
        "Connectivity": "Bluetooth / 2.4GHz Wireless",
      },
    },
  },

  // 3. Гарнитуры
  "prod-hs-01": {
    uz: {
      name: "SonicPulse Pro 7.1 O'yin quloqchini",
      shortDescription: "Fazoviy 7.1 ovoz, 53 mm drayverlar va olinuvchi studiya sifatidagi mikrofon.",
      description: "Sovutuvchi gelli xotira ko'pikli ambushuralar, mustahkam alyuminiy tasma va barcha platformalar bilan moslik.",
      characteristics: {
        "Drayver diametri": "53 mm (Neodim)",
        "Chastota diapazoni": "15 – 25 000 Hz",
        "Ovoz sxemasi": "Virtual 7.1 Surround",
        "Mikrofon": "Shovqinni bekor qiluvchi olinuvchi",
      },
    },
    en: {
      name: "SonicPulse Pro 7.1 Gaming Headset",
      shortDescription: "Spatial 7.1 surround sound, 53mm neodymium drivers, and detachable studio-grade microphone.",
      description: "Memory foam ear cushions infused with cooling gel, durable aluminum frame, and universal platform compatibility.",
      characteristics: {
        "Driver Diameter": "53mm (Neodymium)",
        "Frequency Range": "15 – 25,000 Hz",
        "Audio Scheme": "Virtual 7.1 Surround",
        "Microphone": "Detachable Noise-Cancelling",
      },
    },
  },
  "prod-hs-02": {
    uz: {
      name: "Aurora Wireless ANC Simsiz quloqchini",
      shortDescription: "Faol ANC shovqinni bekor qilish tizimi va 50 soatgacha zaryadsiz ishlash.",
      description: "Hi-Res Audio yuqori ovoz sifati, 15 ms ultra-past kechikishli radio kanal va yumshoq eko-teri qoplamasi.",
      characteristics: {
        "Shovqinni bekor qilish": "Hybrid Active Noise Cancelling",
        "Avtonomlik": "50 soatgacha",
        "Ulanish": "2.4GHz / Bluetooth 5.3 / 3.5mm",
        "Og'irligi": "270 g",
      },
    },
    en: {
      name: "Aurora Wireless ANC Headset",
      shortDescription: "Hybrid ANC active noise cancellation with up to 50 hours of wireless playback.",
      description: "Hi-Res Audio sound fidelity, ultra-low 15ms wireless latency, and plush memory foam leatherette.",
      characteristics: {
        "Noise Cancellation": "Hybrid Active Noise Cancelling",
        "Battery Life": "Up to 50 hours",
        "Connectivity": "2.4GHz / Bluetooth 5.3 / 3.5mm",
        "Weight": "270 g",
      },
    },
  },
  "prod-hs-03": {
    uz: {
      name: "StudioCraft Hi-Fi Studiya quloqchini",
      shortDescription: "Maksimal darajada aniq ovoz sahnasi uchun ochiq akustik konstruksiya.",
      description: "Kontent yaratuvchilar va strimerlar uchun maxsus yaratilgan. Toza bo'yalmagan ovoz va baxmal havo o'tkazuvchi ambushuralar.",
      characteristics: {
        "Turi": "Ochiq monitor quloqchin",
        "Impedans": "80 Om",
        "Chastota diapazoni": "5 – 35 000 Hz",
        "Ulagich": "Tilla qoplangan 3.5mm + 6.3mm adapter",
      },
    },
    en: {
      name: "StudioCraft Hi-Fi Studio Headset",
      shortDescription: "Open-back acoustic design for an expansive soundstage and neutral response.",
      description: "Engineered for creators and audiophiles. Pure uncolored sound reproduction with breathable velour ear cushions.",
      characteristics: {
        "Type": "Open-Back Monitor",
        "Impedance": "80 Ohm",
        "Frequency Range": "5 – 35,000 Hz",
        "Connector": "Gold-plated 3.5mm + 6.3mm adapter",
      },
    },
  },

  // 4. Мониторы
  "prod-mon-01": {
    uz: {
      name: "Horizon Ultra 27\" 165Hz O'yin monitori",
      shortDescription: "QHD (2560x1440) aniqlikdagi 27 dyuymli Fast IPS panel va 1 ms javob berish vaqti.",
      description: "AMD FreeSync Premium va G-Sync Compatible qo'llab-quvvatlashi, 99% sRGB rang qamrovi va balandligi sozlanuvchi stend.",
      characteristics: {
        "Diagonal": "27 dyuym (68.5 sm)",
        "Ruxsat": "2560 × 1440 (2K QHD)",
        "Yangilanish chastotasi": "165 Hz (1ms GtG)",
        "Matritsa turi": "Fast IPS",
      },
    },
    en: {
      name: "Horizon Ultra 27\" 165Hz Gaming Monitor",
      shortDescription: "27-inch Fast IPS panel with QHD (2560x1440) resolution and 1ms response time.",
      description: "AMD FreeSync Premium & G-Sync Compatible, 99% sRGB color gamut, and fully height-adjustable ergonomic stand.",
      characteristics: {
        "Screen Size": "27 inch (68.5 cm)",
        "Resolution": "2560 × 1440 (2K QHD)",
        "Refresh Rate": "165 Hz (1ms GtG)",
        "Panel Type": "Fast IPS",
      },
    },
  },
  "prod-mon-02": {
    uz: {
      name: "Curved Vision 34\" Ultrawide Botiq monitori",
      shortDescription: "34 dyuymli 21:9 WQHD, 1500R egrilik radiusi va HDR400.",
      description: "Simulyatorlarga to'liq sho'ng'ish va bir vaqtning o'zida bir nechta oynada ishlash uchun ideal yechim. O'rnatilgan dinamiklar va USB-hab.",
      characteristics: {
        "Tomonlar nisbati": "21:9 (3440 × 1440)",
        "Egrilik": "1500R",
        "Chastota": "144 Hz",
        "Interfeyslar": "2x HDMI 2.1, 2x DisplayPort 1.4, USB-Hub",
      },
    },
    en: {
      name: "Curved Vision 34\" Ultrawide Monitor",
      shortDescription: "34-inch 21:9 WQHD curved display with 1500R curvature and HDR400.",
      description: "Immersion for gaming simulators and multitasking with dual windows. Built-in stereo speakers and USB hub.",
      characteristics: {
        "Aspect Ratio": "21:9 (3440 × 1440)",
        "Curvature": "1500R",
        "Refresh Rate": "144 Hz",
        "Interfaces": "2x HDMI 2.1, 2x DisplayPort 1.4, USB-Hub",
      },
    },
  },
  "prod-mon-03": {
    uz: {
      name: "Spectra Pro 32\" 4K 240Hz OLED Monitori",
      shortDescription: "Cheksiz kontrast va 0.03 ms o'ta tezkor javob berishga ega flagman QD-OLED displey.",
      description: "Mukammal qora rang, 240 Gts ajoyib ravonlik va professional grafika hamda talabchan geyming uchun Delta E < 1 standart kalibratsiyasi.",
      characteristics: {
        "Matritsa": "QD-OLED 4K (3840 × 2160)",
        "Chastota": "240 Hz",
        "Javob vaqti": "0.03 ms (GtG)",
        "Yorqinlik": "1000 nit (HDR Peak)",
      },
    },
    en: {
      name: "Spectra Pro 32\" 4K 240Hz OLED Monitor",
      shortDescription: "Flagship QD-OLED display with infinite contrast and blazing-fast 0.03ms response time.",
      description: "Absolute inky blacks, fluid 240Hz refresh rate, and factory Delta E < 1 color calibration for mastering and pro esports.",
      characteristics: {
        "Panel Type": "QD-OLED 4K (3840 × 2160)",
        "Refresh Rate": "240 Hz",
        "Response Time": "0.03 ms (GtG)",
        "Brightness": "1000 nits (HDR Peak)",
      },
    },
  },

  // 5. Накопители
  "prod-st-01": {
    uz: {
      name: "TurboDrive Gen4 2TB NVMe SSD",
      shortDescription: "Sovutish radiatori bilan 7450 MB/s gacha o'qish va 6900 MB/s gacha yozish tezligi.",
      description: "PCIe 4.0 x4 interfeysi, LPDDR4 kesh-xotirasi va yangi avlod o'yinlari hamda og'ir yuklamalar uchun kafolatlangan 1200 TBW resursi.",
      characteristics: {
        "Hajm": "2 TB (2000 GB)",
        "Interfeys": "PCIe 4.0 NVMe M.2 2280",
        "O'qish tezligi": "7450 MB/s gacha",
        "Resurs (TBW)": "1200 TBW",
      },
    },
    en: {
      name: "TurboDrive Gen4 2TB NVMe SSD",
      shortDescription: "Read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s with heatsink.",
      description: "PCIe 4.0 x4 interface, discrete LPDDR4 cache, and 1,200 TBW endurance for next-gen gaming and creative workflows.",
      characteristics: {
        "Capacity": "2 TB (2000 GB)",
        "Interface": "PCIe 4.0 NVMe M.2 2280",
        "Read Speed": "Up to 7450 MB/s",
        "Endurance (TBW)": "1200 TBW",
      },
    },
  },
  "prod-st-02": {
    uz: {
      name: "PocketSpeed 1TB USB-C Tashqi SSD",
      shortDescription: "Zarbaga chidamli ixcham disk, 1050 MB/s gacha uzatish tezligi.",
      description: "Kauchuk bamperli alyuminiy korpus, 2 metrgacha balandlikdan tushishdan himoya va AES 256-bit apparat shifrlash tizimi.",
      characteristics: {
        "Hajm": "1 TB",
        "Interfeys": "USB 3.2 Gen 2 (Type-C)",
        "Uzatish tezligi": "1050 MB/s gacha",
        "Himoya": "IP55 namlik va changdan",
      },
    },
    en: {
      name: "PocketSpeed 1TB USB-C External SSD",
      shortDescription: "Shock-resistant compact solid state drive with transfer speeds up to 1050 MB/s.",
      description: "Ruggedized aluminum body with rubber bumper, 2-meter drop protection, and AES 256-bit hardware encryption.",
      characteristics: {
        "Capacity": "1 TB",
        "Interface": "USB 3.2 Gen 2 (Type-C)",
        "Transfer Speed": "Up to 1050 MB/s",
        "Protection": "IP55 water and dust resistance",
      },
    },
  },
  "prod-st-03": {
    uz: {
      name: "Extreme Gen5 4TB Pro NVMe SSD",
      shortDescription: "Faol kulerli 12400 MB/s gacha rekord darajadagi PCIe Gen5 tezligi.",
      description: "Professional 8K video montaji va sun'iy intellekt hisob-kitoblari uchun 232-qatlamli 3D TLC xotirali eng yangi kontroller.",
      characteristics: {
        "Hajm": "4 TB",
        "Interfeys": "PCIe 5.0 NVMe M.2 2280",
        "O'qish tezligi": "12 400 MB/s gacha",
        "Sovutish": "Kulerli alyuminiy radiator",
      },
    },
    en: {
      name: "Extreme Gen5 4TB Pro NVMe SSD",
      shortDescription: "Flagship PCIe Gen5 read speeds up to 12,400 MB/s with active cooling fan.",
      description: "Next-gen 232-layer 3D TLC NAND designed for 8K video editing, heavy content creation, and AI workloads.",
      characteristics: {
        "Capacity": "4 TB",
        "Interface": "PCIe 5.0 NVMe M.2 2280",
        "Read Speed": "Up to 12400 MB/s",
        "Cooling": "Aluminum heatsink with active fan",
      },
    },
  },

  // 6. Аксессуары
  "prod-acc-01": {
    uz: {
      name: "DeskMat XL Speed 900x400 O'yin gilamchasi",
      shortDescription: "Suv o'tkazmaydigan Jacquard qoplamasi, tikilgan qirralar va sirpanmaydigan taglik.",
      description: "900×400 mm keng o'lchami klaviatura va sichqonchani erkin joylashtirish imkonini beradi. 4 mm qalinlik stol notekisliklarini mukammal tekislaydi.",
      characteristics: {
        "O'lchami": "900 × 400 × 4 mm",
        "Qoplama": "Speed/Control Jacquard matosi",
        "Asosi": "Tabiiy kauchuk",
        "Xususiyatlari": "Suv o'tkazmaydigan qoplama",
      },
    },
    en: {
      name: "DeskMat XL Speed 900x400 Gaming Desk Mat",
      shortDescription: "Water-repellent Jacquard fabric, anti-fray stitched edges, and non-slip natural rubber base.",
      description: "Generous 900×400mm dimensions comfortably hold both keyboard and mouse. 4mm plush thickness smooths out desk imperfections.",
      characteristics: {
        "Dimensions": "900 × 400 × 4 mm",
        "Surface": "Speed/Control Jacquard fabric",
        "Base": "Natural anti-slip rubber",
        "Features": "Water-repellent coating",
      },
    },
  },
  "prod-acc-02": {
    uz: {
      name: "DualArm GasSpring Ikkita monitor kronshteyni",
      shortDescription: "Gazlift mexanizmi, 32\" gacha monitorlarni qo'llab-quvvatlash va kabel boshqaruvi.",
      description: "Bir harakat bilan 360 daraja burish, egish va balandlikni sozlash imkoniyati. Stol chetiga qisqich (strubtsina) bilan mahkamlanadi.",
      characteristics: {
        "Mosligi": "17\" dan 32\" gacha monitorlar",
        "VESA standarti": "75×75, 100×100 mm",
        "Maksimal yuklama": "Bir yelkaga 9 kg gacha",
        "Sozlash": "Og'ish, burilish, portret rejimi",
      },
    },
    en: {
      name: "DualArm GasSpring Dual Monitor Mount",
      shortDescription: "Gas spring mechanical arms supporting dual monitors up to 32\" with cable routing.",
      description: "Full 360-degree rotation, tilt, and height adjustment with one hand. Heavy-duty desk clamp installation.",
      characteristics: {
        "Compatibility": "Monitors from 17\" to 32\"",
        "VESA Standard": "75×75, 100×100 mm",
        "Max Load": "Up to 9 kg per arm",
        "Adjustment": "Tilt, swivel, 360° portrait rotation",
      },
    },
  },
  "prod-acc-03": {
    uz: {
      name: "Aviator Coiled Cable Klaviatura uchun o'ralgan kabel",
      shortDescription: "GX16 Aviator konnektori va Paracord o'ramiga ega maxsus spiral kabel.",
      description: "Kastom mexanik klaviatura uchun zamonaviy aksessuar. Ikki qavatli neylon o'ram va tilla suvi yugurtirilgan Type-C ulagichlari.",
      characteristics: {
        "Uzunligi": "1.5 m (spiral qismi 15 sm)",
        "Konnektor": "GX16 5-Pin Aviator",
        "Interfeys": "USB Type-A dan Type-C ga",
        "O'ram": "Paracord + TechFlex",
      },
    },
    en: {
      name: "Aviator Coiled Cable for Keyboards",
      shortDescription: "Custom coiled keyboard cable wrapped in Paracord with quick-release GX16 Aviator connector.",
      description: "Stylish aesthetic accessory for custom mechanical keyboards. Double-sleeved nylon with gold-plated USB-C connectors.",
      characteristics: {
        "Length": "1.5 m (15 cm coiled section)",
        "Connector": "GX16 5-Pin Aviator",
        "Interface": "USB Type-A to Type-C",
        "Sleeving": "Paracord + TechFlex",
      },
    },
  },
};

async function main() {
  console.log("🌱 Starting seeding database...");

  // 1. Очистка старых данных (в порядке внешних ключей)
  console.log("🧹 Clearing old data...");
  await prisma.passwordResetToken.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Создание тестовых пользователей
  console.log("👤 Creating test users...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      id: "user-admin-01",
      name: "Администратор TechGear",
      email: "admin@techgear.ru",
      passwordHash: adminPasswordHash,
      phone: "+7 (999) 111-22-33",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      id: "user-customer-01",
      name: "Иван Иванов",
      email: "customer@techgear.ru",
      passwordHash: customerPasswordHash,
      phone: "+7 (999) 444-55-66",
      role: "CUSTOMER",
    },
  });

  console.log(`Created users: admin (${admin.email}), customer (${customer.email})`);

  // 3. Создание категорий на основе MOCK_PRODUCTS
  console.log("📂 Creating categories...");
  const categoriesMap = new Map<string, { id: string; name: string; slug: string }>();
  for (const p of MOCK_PRODUCTS) {
    if (!categoriesMap.has(p.categoryId)) {
      categoriesMap.set(p.categoryId, {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug,
      });
    }
  }

  for (const cat of categoriesMap.values()) {
    const translations = CATEGORY_TRANSLATIONS[cat.slug] || null;
    const createdCat = await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        translations: translations as any,
      },
    });
    console.log(`- Category: ${createdCat.name} (${createdCat.slug})`);
  }

  // 4. Создание продуктов со всеми переводами
  console.log("📦 Creating products...");
  for (const p of MOCK_PRODUCTS) {
    const translations = PRODUCT_TRANSLATIONS[p.id] || null;
    const createdProd = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        price: p.price,
        image: p.image,
        images: p.images,
        shortDescription: p.shortDescription,
        description: p.description,
        stock: p.stock,
        brand: p.brand,
        characteristics: p.characteristics as any,
        translations: translations as any,
        createdAt: new Date(p.createdAt),
      },
    });
    console.log(`- Product: ${createdProd.name} (${createdProd.brand})`);
  }

  console.log("✅ Seeding successfully finished!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
