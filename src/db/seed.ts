import "dotenv/config";
import { db } from "@/db";
import {
  admins,
  blogPosts,
  businesses,
  categories,
  cities,
  designerPortfolios,
  designers,
  owners,
  plans,
  referrals,
  reports,
  showcaseItems,
  subscriptions,
  orders,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

type CatDef = { name: string; slug: string; icon: string; color: string };
const CATS: CatDef[] = [
  { name: "رستوران و کافه", slug: "restaurant", icon: "utensils", color: "amber" },
  { name: "آرایشگاه و زیبایی", slug: "beauty", icon: "scissors", color: "rose" },
  { name: "کلینیک و دندانپزشکی", slug: "clinic", icon: "stethoscope", color: "sky" },
  { name: "دیجیتال و موبایل", slug: "digital", icon: "smartphone", color: "indigo" },
  { name: "پوشاک و مد", slug: "fashion", icon: "shirt", color: "violet" },
  { name: "بدنسازی و ورزش", slug: "fitness", icon: "dumbbell", color: "emerald" },
  { name: "خودرو و خدمات", slug: "automotive", icon: "car", color: "teal" },
  { name: "آموزشگاه", slug: "training", icon: "graduation", color: "primary" },
  { name: "لوازم خانگی", slug: "home-appliances", icon: "home", color: "primary" },
  { name: "عکاسی و استودیو", slug: "studio", icon: "camera", color: "rose" },
];

type CityDef = { name: string; slug: string; province: string };
const CITIES: CityDef[] = [
  { name: "تهران", slug: "tehran", province: "استان تهران" },
  { name: "اصفهان", slug: "isfahan", province: "استان اصفهان" },
  { name: "شیراز", slug: "shiraz", province: "استان فارس" },
  { name: "مشهد", slug: "mashhad", province: "استان خراسان رضوی" },
  { name: "تبریز", slug: "tabriz", province: "استان آذربایجان شرقی" },
  { name: "کرج", slug: "karaj", province: "استان البرز" },
  { name: "اهواز", slug: "ahvaz", province: "استان خوزستان" },
  { name: "قم", slug: "qom", province: "استان قم" },
];

const IMG: Record<string, string[]> = {
  restaurant: [
    "https://images.pexels.com/photos/31125216/pexels-photo-31125216.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/31125218/pexels-photo-31125218.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/28732300/pexels-photo-28732300.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/12181619/pexels-photo-12181619.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8585881/pexels-photo-8585881.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  beauty: [
    "https://images.pexels.com/photos/7195805/pexels-photo-7195805.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/7195799/pexels-photo-7195799.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/7195811/pexels-photo-7195811.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/7195796/pexels-photo-7195796.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  clinic: [
    "https://images.pexels.com/photos/6502543/pexels-photo-6502543.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/4269268/pexels-photo-4269268.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/532786/pexels-photo-532786.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  digital: [
    "https://images.pexels.com/photos/12968298/pexels-photo-12968298.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/28919443/pexels-photo-28919443.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/5699374/pexels-photo-5699374.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6214362/pexels-photo-6214362.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  fashion: [
    "https://images.pexels.com/photos/8387807/pexels-photo-8387807.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8386641/pexels-photo-8386641.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/13532891/pexels-photo-13532891.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8311880/pexels-photo-8311880.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  fitness: [
    "https://images.pexels.com/photos/38882512/pexels-photo-38882512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/3916766/pexels-photo-3916766.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/11075080/pexels-photo-11075080.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/35215421/pexels-photo-35215421.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  automotive: [
    "https://images.pexels.com/photos/33814734/pexels-photo-33814734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/474/black-and-white-car-vehicle-vintage.jpg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8985923/pexels-photo-8985923.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/4116170/pexels-photo-4116170.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  training: [
    "https://images.pexels.com/photos/31125218/pexels-photo-31125218.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  "home-appliances": [
    "https://images.pexels.com/photos/6214362/pexels-photo-6214362.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  studio: [
    "https://images.pexels.com/photos/8387807/pexels-photo-8387807.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
};

type ItemDef = {
  type: "photo" | "product";
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  unit?: string;
};

type BizDef = {
  name: string;
  slug: string;
  cat: string;
  city: string;
  district: string;
  tagline: string;
  desc: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  verified?: boolean;
  license?: boolean;
  union?: boolean;
  guarantee?: boolean;
  showcase?: boolean;
  items?: ItemDef[];
};

const BIZ: BizDef[] = [
  {
    name: "رستوران سنتی اصغر",
    slug: "asghar-traditional-restaurant",
    cat: "restaurant", city: "tehran", district: "سعادت‌آباد",
    tagline: "ذائقه اصیل ایرانی با بیش از ۲۰ سال سابقه",
    desc: "بیش از ۲۰ سال سابقه در پخت غذاهای سنتی ایرانی\nمواد اولیه ارگانیک و کاملاً تازه\nفضای دنج و خانوادگی با ظرفیت بالا\nامکان رزرو میز و پذیرایی در محل\nپارکینگ اختصاصی برای مهمانان",
    rating: 5, reviews: 248, featured: true, verified: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "فضای داخلی رستوران", imageUrl: IMG.restaurant[0] },
      { type: "photo", title: "سالن پذیرایی", imageUrl: IMG.restaurant[1], description: "فضایی گرم و دلنشین برای تجربه‌ای به‌یادماندنی در کنار خانواده." },
      { type: "product", title: "چلوکباب مخصوص اصغر", description: "دو سیخ کباب کوبیده با برنج زعفرانی", price: "385000", unit: "تومان", imageUrl: IMG.restaurant[2] },
      { type: "product", title: "قورمه‌سبزی سنتی", price: "320000", unit: "تومان", imageUrl: IMG.restaurant[4] },
    ],
  },
  {
    name: "کافه‌رستوران چوبین",
    slug: "choobin-cafe-restaurant",
    cat: "restaurant", city: "tehran", district: "ولنجک",
    tagline: "کافه‌ای دنج با نوشیدنی‌های دست‌ساز",
    desc: "نوشیدنی‌های دمی و سرد دست‌ساز\nصبحانه‌های مجلسی و دسرهای خانگی\nمحیطی آرام برای کار و مطالعه\nوای‌فای رایگان و پریز برق در تمام میزها",
    rating: 4, reviews: 132, featured: true, license: true, union: true, showcase: true,
    items: [
      { type: "photo", title: "محیط کافه", imageUrl: IMG.restaurant[1] },
      { type: "photo", title: "نوشیدنی‌ها", imageUrl: IMG.restaurant[3] },
      { type: "product", title: "لاته کارامل", price: "85000", unit: "تومان", imageUrl: IMG.restaurant[2] },
    ],
  },
  {
    name: "آشپزخانه مامان پزی",
    slug: "mamanpazi-kitchen",
    cat: "restaurant", city: "isfahan", district: "چهارباغ",
    tagline: "غذای خانگی با طعم مادر",
    desc: "منوی متشکل از غذاهای خانگی محلی\nتحویل در محل و ارسال به منزل\nوعده‌های رژیمی و گیاهی",
    rating: 5, reviews: 76, license: true, union: true,
  },
  {
    name: "سالن زیبایی رویال",
    slug: "royal-beauty-salon",
    cat: "beauty", city: "tehran", district: "میرداماد",
    tagline: "پیشرفته‌ترین خدمات آرایشی و پوستی",
    desc: "تیم متخصص و باتجربه در زمینه رنگ و لایت\nخدمات لیزر و پاکسازی پوست با دستگاه‌های روز\nکاشت ناخن و طراحی ناخن هنری\nمحیطی بهداشتی و کاملاً استریل",
    rating: 5, reviews: 189, featured: true, verified: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "فضای سالن", imageUrl: IMG.beauty[0] },
      { type: "photo", title: "بخش رنگ و لایت", imageUrl: IMG.beauty[1] },
      { type: "product", title: "کراتینه مو", price: "950000", unit: "تومان", imageUrl: IMG.beauty[2] },
      { type: "product", title: "لیزر دئودور", price: "1500000", unit: "تومان (هر جلسه)" },
    ],
  },
  {
    name: "کلینیک لبخند",
    slug: "labsand-dental-clinic",
    cat: "clinic", city: "shiraz", district: "معالی‌آباد",
    tagline: "دندانپزشکی تخصصی با تکنولوژی روز",
    desc: "ارائه خدمات کامپوزیت و لمینت دندان\nایمپلنت و ارتودنسی توسط متخصصین\nرادیولوژی دیجیتال در محل\nنوبت‌دهی آنلاین و پیامکی",
    rating: 5, reviews: 145, featured: true, verified: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "اتاق معاینه", imageUrl: IMG.clinic[0] },
      { type: "photo", title: "تجهیزات تخصصی", imageUrl: IMG.clinic[1], description: "استفاده از بهروزترین تجهیزات دندانپزشکی برای درمانی بدون درد." },
      { type: "product", title: "جوهایگنی (دیدن دندان)", price: "450000", unit: "تومان" },
      { type: "product", title: "کامپوزیت (هر دندان)", price: "1200000", unit: "تومان", imageUrl: IMG.clinic[2] },
    ],
  },
  {
    name: "مرکز تندرستی آریا",
    slug: "aria-fitness-center",
    cat: "fitness", city: "tehran", district: "جردن",
    tagline: "باشگاهی مجهز با مربیان حرفه‌ای",
    desc: "سالن مجهز بدنسازی با دستگاه‌های استاندارد\nکلاس‌های گروهی ایروبیک و پیلاتس\nمشاوره تغذیه و برنامه تمرینی اختصاصی\nسونای خشک و مرطوب و ماساژ",
    rating: 4, reviews: 98, featured: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "سالن بدنسازی", imageUrl: IMG.fitness[0] },
      { type: "photo", title: "بخش دستگاه‌های هوازی", imageUrl: IMG.fitness[3] },
      { type: "product", title: "اشتراک ماهانه ویژه", price: "850000", unit: "تومان / ماه", imageUrl: IMG.fitness[1] },
    ],
  },
  {
    name: "موبایل‌سنتر پارس",
    slug: "pars-mobile-center",
    cat: "digital", city: "tehran", district: "علاءالدین",
    tagline: "مرکز تخصصی فروش و تعمیر موبایل",
    desc: "نمایندگی رسمی برندهای معتبر\nتعمیرات تخصصی سخت‌افزاری و نرم‌افزاری\nگارانتی معتبر و خدمات پس از فروش\nخرید اقساطی بدون پیش‌پرداخت",
    rating: 4, reviews: 210, featured: true, verified: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "محیط فروشگاه", imageUrl: IMG.digital[0] },
      { type: "photo", title: "ویترین محصولات", imageUrl: IMG.digital[1] },
      { type: "product", title: "گوشی هوشمند پرچمدار", price: "48900000", unit: "تومان", imageUrl: IMG.digital[1] },
      { type: "product", title: "تعویض صفحه نمایش", price: "3500000", unit: "تومان", imageUrl: IMG.digital[2] },
    ],
  },
  {
    name: "بوتیک مد پلاس",
    slug: "mod-plus-boutique",
    cat: "fashion", city: "isfahan", district: "چهارباغ بالا",
    tagline: "مد روز و پوشاک باکیفیت",
    desc: "مجموعه‌ای از پوشاک مردانه و زنانه\nبرندهای معتبر داخلی و خارجی\nتخفیف‌های فصلی و کلوب مشتریان",
    rating: 4, reviews: 64, license: true, union: true, showcase: true,
    items: [
      { type: "photo", title: "فضای بوتیک", imageUrl: IMG.fashion[0] },
      { type: "photo", title: "نمونه لباس‌ها", imageUrl: IMG.fashion[2] },
      { type: "product", title: "کمدی رسمی", price: "1850000", unit: "تومان", imageUrl: IMG.fashion[1] },
    ],
  },
  {
    name: "مرکز خدماتی خودرو آسا",
    slug: "asa-auto-service",
    cat: "automotive", city: "karaj", district: "وهین‌شهر",
    tagline: "تعمیرگاه تخصصی و عیب‌یابی کامپیوتری",
    desc: "عیب‌یابی کامپیوتری تمام خودروها\nتعویض روغن و خدمات دوره‌ای\nقطعات اصلی و با گارانتی\nکارشناسان مجرب و صادق",
    rating: 5, reviews: 87, featured: true, verified: true, license: true, union: true, guarantee: true,
    items: [
      { type: "photo", title: "تعمیرگاه", imageUrl: IMG.automotive[0] },
      { type: "photo", title: "بخش عیب‌یابی", imageUrl: IMG.automotive[3] },
      { type: "product", title: "تعویض روغن کامل", price: "450000", unit: "تومان", imageUrl: IMG.automotive[1] },
    ],
  },
  {
    name: "آرایشگاه مردانه امپریال",
    slug: "imperial-barber",
    cat: "beauty", city: "mashhad", district: "سجاد",
    tagline: "اصلاح و خدمات مردانه VIP",
    desc: "اصلاح صورت و سر توسط آرایشگران حرفه‌ای\nرنگ و مش و خدمات ریش\nمحیطی مدرن و مجهز\nرزرو نوبت آنلاین",
    rating: 5, reviews: 54, license: true, union: true,
  },
  {
    name: "استودیو عکاسی پرشین",
    slug: "persian-photo-studio",
    cat: "studio", city: "tehran", district: "ولنجک",
    tagline: "عکاسی تخصصی پرتره و محصولات",
    desc: "عکاسی پرتره و عکس خانوادگی\nعکاسی محصولات برای فروشگاه‌های آنلاین\nتدوین و روتوش حرفه‌ای\nلوکیشن‌های متنوع",
    rating: 4, reviews: 41, license: true, union: true, showcase: true,
    items: [
      { type: "photo", title: "نمونه کار پرتره", imageUrl: IMG.studio[0] },
    ],
  },
  {
    name: "آموزشگاه زبان گویا",
    slug: "goya-language-institute",
    cat: "training", city: "tabriz", district: "آبرسان",
    tagline: "یادگیری زبان با اساتید مجرب",
    desc: "دوره‌های زبان انگلیسی، آلمانی و فرانسوی\nکلاس‌های حضوری و آنلاین\nآمادگی آزمون‌های بین‌المللی\nپایه‌های کودک تا بزرگسال",
    rating: 5, reviews: 112, featured: true, verified: true, license: true, union: true,
  },
  {
    name: "فروشگاه لوازم خانگی نوین",
    slug: "novin-home-appliances",
    cat: "home-appliances", city: "ahvaz", district: "کیانپارس",
    tagline: "تجهیزات خانگی با گارانتی معتبر",
    desc: "نمایندگی برندهای معتبر لوازم خانگی\nارسال و نصب رایگان در شهر\nتسهیلات خرید اقساطی\nخدمات پس از فروش سریع",
    rating: 4, reviews: 73, license: true, union: true, guarantee: true,
  },
  {
    name: "قهوه‌خانه کهن",
    slug: "kohan-coffeehouse",
    cat: "restaurant", city: "qom", district: "سالاریه",
    tagline: "قهوه تخصصی و دمنوش‌های سنتی",
    desc: "انواع قهوه دمی و اسپرسو\nدمنوش‌های گیاهی سنتی\nشیرینی و کیک خانگی\nفضایی دنج و سنتی",
    rating: 4, reviews: 38, license: true, union: true,
  },
  {
    name: "کلینیک پوست درماتیست",
    slug: "dermatist-skin-clinic",
    cat: "clinic", city: "isfahan", district: "توحید",
    tagline: "درمان تخصصی مشکلات پوست و مو",
    desc: "تزریق بوتاکس و ژل توسط پزشک متخصص\nدرمان جوش و لک با لیزر\nمیکرودرم و مزوتراپی\nمشاوره تخصصی پوست",
    rating: 5, reviews: 67, verified: true, license: true, union: true, guarantee: true, showcase: true,
    items: [
      { type: "photo", title: "اتاق درمان", imageUrl: IMG.clinic[3] },
      { type: "product", title: "مشاوره و معاینه پوست", price: "350000", unit: "تومان" },
    ],
  },
  {
    name: "باشگاه زنان فیتو",
    slug: "fitu-women-gym",
    cat: "fitness", city: "shiraz", district: "زند",
    tagline: "باشگاه اختصاصی بانوان",
    desc: "فضایی کاملاً بانوان با مربیان زن\nکلاس‌های ایروبیک و بدنسازی\nمشاوره تغذیه\nساعت کاری منعطف",
    rating: 5, reviews: 49, license: true, union: true, guarantee: true,
  },
  {
    name: "تک‌سرویس موبایل",
    slug: "takservice-mobile",
    cat: "digital", city: "mashhad", district: "احمدآباد",
    tagline: "تعمیر سریع موبایل و تبلت",
    desc: "تعمیرات نرم‌افزاری و سخت‌افزاری\nتعویض باتری و صفحه\nبازیابی اطلاعات\nگارانتی خدمات",
    rating: 4, reviews: 58, license: true, union: true, guarantee: true,
  },
  {
    name: "گالری لباس لاکچری",
    slug: "luxury-fashion-gallery",
    cat: "fashion", city: "tehran", district: "فرشته",
    tagline: "پوشاک لوکس و طراحان ایرانی",
    desc: "مجموعه‌ای از طراحان برتر ایرانی\nلباس‌های شب و مجلسی\nمشاور استایل اختصاصی\nخیاطی و اصلاح اندازه",
    rating: 5, reviews: 34, verified: true, license: true, union: true, showcase: true,
    items: [
      { type: "photo", title: "گالری", imageUrl: IMG.fashion[3] },
      { type: "product", title: "لباس مجلسی", price: "8500000", unit: "تومان", imageUrl: IMG.fashion[1] },
    ],
  },
  {
    name: "کارواش و دیتیلینگ شاین",
    slug: "shine-detailing",
    cat: "automotive", city: "tehran", district: "دزاشیب",
    tagline: "سفارشی‌سازی و پولیش حرفه‌ای خودرو",
    desc: "صفرشویی و پولیش کامل بدنه\nسرامیک و لاستیک‌پوشی\nنمای داخلی و ضدبوی\nخدمات موبایل در محل",
    rating: 5, reviews: 92, featured: true, license: true, union: true, guarantee: true,
  },
  {
    name: "مرکز رز فرش",
    slug: "rez-carpet-center",
    cat: "home-appliances", city: "tabriz", district: "باغمیشه",
    tagline: "شستشوی تخصصی فرش و موکت",
    desc: "شستشوی فرش دستبافت و ماشینی\nرفتگيري و ترمیم فرش\nتحویل رایگان در شهر\nضمانت کیفیت شستشو",
    rating: 4, reviews: 45, license: true, union: true, guarantee: true,
  },
  {
    name: "سفره‌خانه هفت‌سین",
    slug: "haftsin-traditional-restaurant",
    cat: "restaurant", city: "shiraz", district: "معالی‌آباد",
    tagline: "غذاهای محلی فارس در فضایی سنتی",
    desc: "غذاهای محلی استان فارس\nفضای سنتی با تزئینات اصیل\nمواد اولیه بومی و تازه\nپذیرایی توریست‌ها",
    rating: 5, reviews: 119, featured: true, verified: true, license: true, union: true, showcase: true,
    items: [
      { type: "photo", title: "فضای سنتی", imageUrl: IMG.restaurant[3] },
      { type: "product", title: "آبگوشت محلی", price: "295000", unit: "تومان", imageUrl: IMG.restaurant[4] },
    ],
  },
  {
    name: "سالن زیبایی نگار",
    slug: "negar-beauty-salon",
    cat: "beauty", city: "karaj", district: "گوهردشت",
    tagline: "خدمات زیبایی تخصصی بانوان",
    desc: "شینیون و آرایش عروس\nاکستنشن مژه و ابرو\nچسب و لاک ژل\nمشاور پوست و مو",
    rating: 4, reviews: 67, license: true, union: true,
  },
  {
    name: "آکادمی کامپیوتر دیتا",
    slug: "data-computer-academy",
    cat: "training", city: "ahvaz", district: "کوی نفت",
    tagline: "آموزش تخصصی برنامه‌نویسی و شبکه",
    desc: "دوره‌های برنامه‌نویسی و طراحی وب\nشبکه و امنیت\nصدور گواهینامه معتبر\nپشتیبانی شغلی",
    rating: 5, reviews: 53, license: true, union: true,
  },
  {
    name: "کلینیک دندانپزشکی مهر",
    slug: "mehr-dental-clinic",
    cat: "clinic", city: "qom", district: "آزادگان",
    tagline: "دندانپزشکی کودکان و بزرگسالان",
    desc: "ارائه خدمات در تمام شاخه‌های دندانپزشکی\nبخش ویژه کودکان\nپذیرش بیمه‌های تکمیلی\nنوبت‌دهی راحت",
    rating: 4, reviews: 41, license: true, union: true,
  },
];

async function main() {
  console.log("🧹 پاک‌سازی داده‌های قدیمی…");
  await db.delete(showcaseItems);
  await db.delete(orders);
  await db.delete(reports);
  await db.delete(referrals);
  await db.delete(subscriptions);
  await db.delete(businesses);
  await db.delete(owners);
  await db.delete(designerPortfolios);
  await db.delete(designers);
  await db.delete(plans);
  await db.delete(blogPosts);
  await db.delete(admins);
  await db.delete(categories);
  await db.delete(cities);

  console.log("🏙️  درج شهرها…");
  await db.insert(cities).values(CITIES);

  console.log("🏷️  درج دسته‌ها…");
  await db.insert(categories).values(CATS);

  console.log("🛡️  ساخت مدیر سامانه…");
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@kasbyab.ir";
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "Admin@1234");
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD باید حداقل ۸ کاراکتر باشد.");
  }
  await db.insert(admins).values({
    name: "مدیر کل سامانه",
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: "superadmin",
    active: true,
  });

  console.log("👤 ساخت مالکان نمونه…");
  const [owner] = await db
    .insert(owners)
    .values([
      {
        name: "کاربر نمونه",
        phone: "09120000000",
        passwordHash: hashPassword("123456"),
        approved: true,
      },
      {
        name: "کاربر در انتظار تأیید",
        phone: "09121111111",
        passwordHash: hashPassword("123456"),
        approved: false,
      },
    ])
    .returning({ id: owners.id });
  const ownerId = owner?.id ?? null;

  console.log("📦 درج پلن‌های اشتراک…");
  await db.insert(plans).values([
    {
      name: "رایگان",
      slug: "free",
      priceMonthly: 0,
      sortOrder: 0,
      features: JSON.stringify([
        "پروفایل و کارت معرفی",
        "لینک اختصاصی و QR",
        "تماس و مسیریابی",
        "۴ آیتم در ویترین",
      ]),
    },
    {
      name: "پایه",
      slug: "basic",
      priceMonthly: 99_000,
      sortOrder: 1,
      features: JSON.stringify([
        "گالری تصاویر بیشتر (تا ۳۰)",
        "معرفی محصولات و خدمات",
        "درج قیمت‌ها",
        "نشان ویترین حرفه‌ای",
      ]),
    },
    {
      name: "حرفه‌ای",
      slug: "pro",
      priceMonthly: 249_000,
      sortOrder: 2,
      features: JSON.stringify([
        "همه امکانات پایه",
        "گالری نامحدود",
        "توضیحات کامل‌تر خدمات",
        "جایگاه ویژه در نتایج",
        "آمار بازدید پروفایل",
      ]),
    },
    {
      name: "طلایی",
      slug: "gold",
      priceMonthly: 499_000,
      sortOrder: 3,
      features: JSON.stringify([
        "همه امکانات حرفه‌ای",
        "ویدئوی معرفی (فاز بعدی)",
        "پشتیبانی اختصاصی",
        "نشان کسب‌وکار ویژه",
      ]),
    },
  ]);

  console.log("🎨 ساخت طراحان نمونه…");
  await db.insert(designers).values([
    {
      name: "آرش طراح‌نژاد",
      phone: "09123334444",
      passwordHash: hashPassword("123456"),
      slug: "arash-tarrahi",
      bio: "طراح کارت‌ویزیت با ۸ سال سابقه؛ متخصص هویت بصری کسب‌وکارهای خدماتی.",
      referralCode: "arash20",
      points: 40,
      approved: true,
      featured: true,
    },
    {
      name: "نگین هنری",
      phone: "09125556666",
      passwordHash: hashPassword("123456"),
      slug: "negin-honari",
      bio: "گرافیست و طراح کارت‌ویزیت مینیمال؛ نمونه‌کارهای متعدد برای کافه‌ها و رستوران‌ها.",
      referralCode: "negin15",
      points: 30,
      approved: true,
      featured: true,
    },
    {
      name: "استودیو طرح‌مهر",
      phone: "09127778888",
      passwordHash: hashPassword("123456"),
      slug: "tarh-mehr-studio",
      bio: "استودیو تخصصی طراحی کارت‌ویزیت و اقلام چاپی.",
      referralCode: "mehr10",
      points: 0,
      approved: false,
      featured: false,
    },
  ]);

  const designerRows = await db.select().from(designers);
  const d1Id = designerRows.find((d) => d.slug === "arash-tarrahi")?.id;
  const d2Id = designerRows.find((d) => d.slug === "negin-honari")?.id;
  const d3Id = designerRows.find((d) => d.slug === "tarh-mehr-studio")?.id;

  await db.insert(designerPortfolios).values([
    { designerId: d1Id!, title: "کارت‌ویزیت رستوران سنتی", imageUrl: IMG.restaurant[2], approved: true, points: 10 },
    { designerId: d1Id!, title: "کارت‌ویزیت کلینیک زیبایی", imageUrl: IMG.beauty[2], approved: true, points: 10 },
    { designerId: d1Id!, title: "کارت‌ویزیت استودیو عکاسی", imageUrl: IMG.studio[0], approved: true, points: 10 },
    { designerId: d1Id!, title: "کارت‌ویزیت کافه", imageUrl: IMG.restaurant[3], approved: true, points: 10 },
    { designerId: d2Id!, title: "کارت‌ویزیت بوتیک", imageUrl: IMG.fashion[1], approved: true, points: 10 },
    { designerId: d2Id!, title: "کارت‌ویزیت باشگاه", imageUrl: IMG.fitness[1], approved: true, points: 10 },
    { designerId: d2Id!, title: "کارت‌ویزیت موبایل‌سنتر", imageUrl: IMG.digital[1], approved: true, points: 10 },
    { designerId: d3Id!, title: "نمونه‌کار جدید (در انتظار تأیید)", imageUrl: IMG.fashion[0], approved: false, points: 10 },
  ]);

  console.log("📝 درج مطالب بلاگ…");
  await db.insert(blogPosts).values([
    {
      title: "چرا کسب‌وکار شما به یک لینک اختصاصی و QR نیاز دارد؟",
      slug: "why-business-needs-qr-link",
      excerpt: "در دنیایی که همه‌چیز دیجیتال شده، کارت معرفی آنلاین سریع‌ترین مسیر ارتباط با مشتری است.",
      coverUrl: IMG.digital[0],
      published: true,
      content:
        "لینک اختصاصی و QR کسب‌وکار یعنی مشتری با یک اسکن، به‌جای جست‌وجوی طولانی، مستقیم به صفحه معرفی شما می‌رسد؛ تماس می‌گیرد، مسیر را پیدا می‌کند و شبکه‌های اجتماعی شما را می‌بیند.\n\nاین صفحه همیشه به‌روز است؛ برخلاف کارت چاپی که با تغییر شماره یا آدرس باطل می‌شود، لینک شما همیشه معتبر می‌ماند.",
    },
    {
      title: "نشان‌های اعتماد کسب‌یاب چگونه کار می‌کنند؟",
      slug: "how-trust-badges-work",
      excerpt: "تفاوت «تأیید پلتفرم» با نشان‌های اظهاری مانند جواز و اتحادیه چیست؟",
      coverUrl: IMG.clinic[0],
      published: true,
      content:
        "در کسب‌یاب شفافیت حرف اول را می‌زند. نشان «تأیید پلتفرم» یعنی تیم ما هویت و مدارک کسب‌وکار را بررسی کرده است؛ اما نشان‌هایی مانند جواز کسب، عضویت در اتحادیه یا ضمانت، بر اساس اظهار خود کسب‌وکار نمایش داده می‌شوند.\n\nاین تفکیک باعث می‌شود کاربر با آگاهی کامل تصمیم بگیرد.",
    },
    {
      title: "ویترین حرفه‌ای چه مزیتی برای کسب‌وکار من دارد؟",
      slug: "why-professional-showcase",
      excerpt: "با فعال‌سازی ویترین، محصولات و قیمت‌های خود را مستقیم در نتایج جست‌وجو نمایش دهید.",
      coverUrl: IMG.restaurant[0],
      published: true,
      content:
        "کسب‌وکارها بدون اشتراک هم پروفایل و کارت معرفی دارند؛ اما ویترین حرفه‌ای یعنی گالری تصاویر بیشتر، معرفی محصول و خدمات، درج قیمت‌ها و جایگاه بهتر در نتایج.\n\nاین امکانات برای کاربران به‌معنای تصمیم‌گیری سریع‌تر و برای شما به‌معنای مشتری بیشتر است.",
    },
    {
      title: "راهنمای شروع برای صاحبان کسب‌وکار",
      slug: "getting-started-for-owners",
      excerpt: "در پنج گام ساده کسب‌وکار خود را در کسب‌یاب ثبت و معرفی کنید.",
      coverUrl: IMG.training[0],
      published: false,
      content: "این مطلب به‌زودی منتشر می‌شود.",
    },
  ]);

  const cityRows = await db.select().from(cities);
  const catRows = await db.select().from(categories);
  const planRows = await db.select().from(plans);
  const proPlan = planRows.find((p) => p.slug === "pro");
  const basicPlan = planRows.find((p) => p.slug === "basic");

  // مختصات تقریبی مراکز شهرها برای پیوند مسیریابی
  const CITY_COORDS: Record<string, [string, string]> = {
    tehran: ["35.715298", "51.404343"],
    isfahan: ["32.654627", "51.667983"],
    shiraz: ["29.591768", "52.583698"],
    mashhad: ["36.260462", "59.616755"],
    tabriz: ["38.080266", "46.291219"],
    karaj: ["35.840019", "50.939091"],
    ahvaz: ["31.318327", "48.670619"],
    qom: ["34.639999", "50.875942"],
  };

  console.log(`🏢 درج ${BIZ.length} کسب‌وکار…`);
  // سه کسب‌وکار نخست به مالک نمونه اختصاص می‌یابند
  let firstBizId: number | null = null;
  let secondBizId: number | null = null;
  for (let i = 0; i < BIZ.length; i++) {
    const d = BIZ[i];
    const catId = catRows.find((c) => c.slug === d.cat)?.id;
    const cityId = cityRows.find((c) => c.slug === d.city)?.id;
    if (!catId || !cityId) {
      console.warn(`⚠️  رد شد: ${d.name}`);
      continue;
    }
    const images = IMG[d.cat] ?? IMG.restaurant;
    const cover = images[i % images.length];
    const coords = CITY_COORDS[d.city] ?? null;
    const [created] = await db
      .insert(businesses)
      .values({
        name: d.name,
        slug: d.slug,
        categoryId: catId,
        cityId,
        district: d.district,
        tagline: d.tagline,
        description: d.desc,
        address: `${d.district}، ${cityRows.find((c) => c.id === cityId)?.name}`,
        phone: `021${Math.floor(10000000 + Math.random() * 89999999)}`,
        mobile: `0912${Math.floor(1000000 + Math.random() * 8999999)}`,
        email: `info@${d.slug.replace(/-/g, "")}.ir`,
        website: null,
        logoUrl: null,
        coverUrl: cover,
        lat: coords ? coords[0] : null,
        lng: coords ? coords[1] : null,
        instagram: d.slug.replace(/-/g, "_"),
        telegram: d.slug.replace(/-/g, "_"),
        whatsapp: `98912${Math.floor(1000000 + Math.random() * 8999999)}`,
        workHours: "شنبه تا پنجشنبه ۹ تا ۲۲",
        hasLicense: !!d.license,
        unionMember: !!d.union,
        hasGuarantee: !!d.guarantee,
        hasShowcase: !!d.showcase,
        rating: d.rating,
        reviewCount: d.reviews,
        featured: !!d.featured,
        verified: !!d.verified,
        // دهمین کسب‌وکار به‌عنوان «در انتظار تأیید» نمونه باقی می‌ماند
        status: i === 9 ? "pending" : "active",
        ownerId: i < 3 ? ownerId : null,
      })
      .returning({ id: businesses.id });

    if (created) {
      if (i === 0) firstBizId = created.id;
      if (i === 1) secondBizId = created.id;
      if (d.items?.length) {
        for (const it of d.items) {
          await db.insert(showcaseItems).values({
            businessId: created.id,
            type: it.type,
            title: it.title,
            description: it.description ?? null,
            imageUrl: it.imageUrl ?? null,
            price: it.price ?? null,
            unit: it.unit ?? null,
          });
        }
      }
    }
  }

  console.log("💳 درج اشتراک‌ها…");
  if (firstBizId && proPlan) {
    await db.insert(subscriptions).values({
      businessId: firstBizId,
      planId: proPlan.id,
      status: "active",
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }
  if (secondBizId && basicPlan) {
    await db.insert(subscriptions).values({
      businessId: secondBizId,
      planId: basicPlan.id,
      status: "pending",
    });
  }

  console.log("🤝 درج معرفی‌ها…");
  if (secondBizId && d1Id) {
    const [sub] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.businessId, secondBizId))
      .limit(1);
    if (sub) {
      await db.insert(referrals).values({
        designerId: d1Id,
        businessId: secondBizId,
        subscriptionId: sub.id,
        status: "pending",
        commissionRate: 10,
      });
    }
  }

  console.log("🚩 درج گزارش‌های نمونه…");
  if (firstBizId) {
    await db.insert(reports).values([
      {
        businessId: firstBizId,
        reporterName: "رضا محمدی",
        category: "wrong-info",
        message: "شماره تماس درج‌شده در صفحه این کسب‌وکار پاسخگو نیست.",
        status: "pending",
      },
    ]);
  }
  if (secondBizId) {
    await db.insert(reports).values([
      {
        businessId: secondBizId,
        reporterName: "مریم احمدی",
        category: "closed",
        message: "این مجموعه مدتی است تعطیل شده است.",
        status: "resolved",
        adminNote: "با صاحب کسب‌وکار تماس گرفته شد؛ اطلاعات به‌روزرسانی شد.",
        resolvedAt: new Date(),
      },
    ]);
  }

  console.log("🛒 درج سفارش‌های نمونه…");
  if (firstBizId) {
    await db.insert(orders).values({
      orderNumber: "KSB-DEMO-1001",
      businessId: firstBizId,
      itemTitle: "چلوکباب مخصوص اصغر",
      unitPrice: 385000,
      totalAmount: 770000,
      customerName: "علی رضایی",
      customerPhone: "09121234567",
      customerEmail: "ali@example.com",
      service: "چلوکباب مخصوص اصغر",
      quantity: 2,
      requestedDate: "1405/01/18",
      preferredTime: "۱۳:۰۰ تا ۱۴:۰۰",
      deliveryAddress: "تهران، سعادت‌آباد، خیابان سرو",
      note: "لطفاً قاشق و چنگال اضافه ارسال شود.",
      status: "pending",
    });
  }
  if (secondBizId) {
    await db.insert(orders).values({
      orderNumber: "KSB-DEMO-1002",
      businessId: secondBizId,
      customerName: "سارا کریمی",
      customerPhone: "09129876543",
      service: "رزرو وقت مشاوره",
      quantity: 1,
      requestedDate: "1405/01/20",
      preferredTime: "۱۷:۳۰",
      note: "برای خدمات رنگ و لایت وقت می‌خواهم.",
      status: "confirmed",
    });
  }

  console.log("✅ دانه‌کاری پایان یافت.");
  console.log(`   مدیر: ${adminEmail} / رمز تنظیم‌شده در ADMIN_PASSWORD`);
  console.log("   مالک نمونه: 09120000000 / 123456");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ خطا در دانه‌کاری:", e);
  process.exit(1);
});
