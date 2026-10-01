// Single source of truth for portfolio case studies.
// Mo: add a new project by appending an object to `projects` below — no component changes needed.
// Leave a field out when the information is not verified yet: it renders as
// "[PLACEHOLDER — Mo to supply]" during development and is hidden in production.
// Never add a number to `result` unless it is verified.

import ekaa01 from '@/assets/ekaa/EKAA-01.webp';
import ekaa06 from '@/assets/ekaa/EKAA-06.webp';
import ekaa07 from '@/assets/ekaa/EKAA-07.webp';
import ekaa09 from '@/assets/ekaa/EKAA-09.webp';
import ekaa10 from '@/assets/ekaa/EKAA-10.webp';
import ekaa11 from '@/assets/ekaa/EKAA-11.webp';
import ekaa12 from '@/assets/ekaa/EKAA-12.webp';

import rivers20 from '@/assets/rivers/Artboard_20.webp';
import rivers21 from '@/assets/rivers/Artboard_21.webp';
import rivers23 from '@/assets/rivers/Artboard_23.webp';
import rivers26 from '@/assets/rivers/Artboard_26.webp';
import rivers27 from '@/assets/rivers/Artboard_27.webp';
import rivers30 from '@/assets/rivers/Artboard_30.webp';
import rivers31 from '@/assets/rivers/Artboard_31.webp';

import gyptech2 from '@/assets/gyptech/Artboard_2.webp';
import gyptech3 from '@/assets/gyptech/Artboard_3.webp';
import gyptech4 from '@/assets/gyptech/Artboard_4.webp';
import gyptech5 from '@/assets/gyptech/Artboard_5.webp';
import gyptech7 from '@/assets/gyptech/Artboard_7.webp';
import gyptech8 from '@/assets/gyptech/Artboard_8.webp';
import gyptech9 from '@/assets/gyptech/Artboard_9.webp';

import diamond3 from '@/assets/diamond/Artboard_3.webp';
import diamond22 from '@/assets/diamond/Artboard_22.webp';
import diamond23 from '@/assets/diamond/Artboard_23.webp';
import diamond29 from '@/assets/diamond/Artboard_29.webp';
import diamond31 from '@/assets/diamond/Artboard_31.webp';
import diamond32 from '@/assets/diamond/Artboard_32.webp';

import talia4 from '@/assets/talia/Artboard_4.webp';
import talia5 from '@/assets/talia/Artboard_5.webp';
import talia6 from '@/assets/talia/Artboard_6.webp';
import talia7 from '@/assets/talia/Artboard_7.webp';
import talia9 from '@/assets/talia/Artboard_9.webp';
import talia10 from '@/assets/talia/Artboard_10.webp';
import talia11 from '@/assets/talia/Artboard_11.webp';
import talia14 from '@/assets/talia/Artboard_14.webp';
import talia15 from '@/assets/talia/Artboard_15.webp';

import sabaa03 from '@/assets/sabaa/Artboard_03.webp';
import sabaa04 from '@/assets/sabaa/Artboard_04.webp';
import sabaa05 from '@/assets/sabaa/Artboard_05.webp';
import sabaa08 from '@/assets/sabaa/Artboard_08.webp';
import sabaa09 from '@/assets/sabaa/Artboard_09.webp';
import sabaa10 from '@/assets/sabaa/Artboard_10.webp';
import sabaa11 from '@/assets/sabaa/Artboard_11.webp';
import sabaa13 from '@/assets/sabaa/Artboard_13.webp';
import sabaa14 from '@/assets/sabaa/Artboard_14.webp';

import mahrizi04 from '@/assets/mahrizi/Artboard_04.webp';
import mahrizi05 from '@/assets/mahrizi/Artboard_05.webp';
import mahrizi07 from '@/assets/mahrizi/Artboard_07.webp';
import mahrizi08 from '@/assets/mahrizi/Artboard_08.webp';
import mahrizi11 from '@/assets/mahrizi/Artboard_11.webp';
import mahrizi12 from '@/assets/mahrizi/Artboard_12.webp';
import mahrizi13 from '@/assets/mahrizi/Artboard_13.webp';
import mahrizi14 from '@/assets/mahrizi/Artboard_14.webp';
import mahrizi15 from '@/assets/mahrizi/Artboard_15.webp';

import asdam01 from '@/assets/asdam/Artboard_01.webp';
import asdam04 from '@/assets/asdam/Artboard_04.webp';
import asdam05 from '@/assets/asdam/Artboard_05.webp';
import asdam06 from '@/assets/asdam/Artboard_06.webp';
import asdam07 from '@/assets/asdam/Artboard_07.webp';
import asdam08 from '@/assets/asdam/Artboard_08.webp';
import asdam12 from '@/assets/asdam/Artboard_12.webp';
import asdam13 from '@/assets/asdam/Artboard_13.webp';
import asdam14 from '@/assets/asdam/Artboard_14.webp';

import feaalCover from '@/assets/feaal/cover.webp';
import tamalukCover from '@/assets/tamaluk/cover.webp';

export type ServiceLine = 'brand' | 'digital' | 'ai' | 'experiential';

export type Localized = { ar: string; en: string };

export interface GalleryImage {
  src: string;
  /** Required: every gallery image needs descriptive alt text in both languages. */
  alt: Localized;
}

export interface ProofItem {
  label: Localized;
  url?: string;
}

export interface Project {
  slug: string;
  /** Legacy numeric id, kept so older links keep resolving. */
  legacyId?: number;
  title_ar: string;
  title_en: string;
  client?: Localized;
  /** Set true when the client name is under NDA or not approved for display. */
  hideClient?: boolean;
  year?: string;
  serviceLine: ServiceLine;
  cover: string;
  gallery: GalleryImage[];
  context?: Localized;
  problem?: Localized;
  role?: Localized;
  decision?: Localized;
  /** What was actually delivered. */
  system?: Localized;
  /** Qualitative only unless the number is verified. */
  result?: Localized;
  proof?: ProofItem[];
  pdfUrl?: string;
  /** Package name that fits a similar client. */
  nextService?: string;
  featured?: boolean;
}

export const PLACEHOLDER = '[PLACEHOLDER — Mo to supply]';

/** Localized value, or the dev-only placeholder (null in production). */
export const localizedField = (value: Localized | undefined, lang: 'ar' | 'en'): string | null => {
  if (value) return value[lang];
  return null;
};

const gallery = (images: string[], titleAr: string, titleEn: string): GalleryImage[] =>
  images.map((src, index) => ({
    src,
    alt: {
      ar: `${titleAr} — لقطة ${index + 1}`,
      en: `${titleEn} — view ${index + 1}`,
    },
  }));

export const projects: Project[] = [
  {
    slug: 'ekka-rebranding',
    legacyId: 1,
    title_ar: 'إعادة بناء هوية إيكا',
    title_en: 'EKKA Re-Branding',
    serviceLine: 'brand',
    cover: ekaa01,
    featured: true,
    gallery: gallery([ekaa01, ekaa06, ekaa07, ekaa09, ekaa10, ekaa11, ekaa12], 'إعادة بناء هوية إيكا', 'EKKA Re-Branding'),
    context: {
      ar: 'علامة قائمة تحتاج تحديثاً بصرياً يحافظ على ما يعرفه جمهورها.',
      en: 'An existing brand that needed a visual update while keeping what its audience already recognized.',
    },
    system: {
      ar: 'إعادة بناء كاملة للهوية البصرية: الشعار، النظام اللوني، الخطوط، والتطبيقات الأساسية.',
      en: 'A full visual identity rebuild: logo, color system, typography, and core applications.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/207576679/EKKA-RE-BRANDING' }],
    nextService: 'Identity System',
  },
  {
    slug: 'logofolio-2',
    legacyId: 2,
    title_ar: 'مجموعة شعارات #2',
    title_en: 'Logofolio #2',
    serviceLine: 'brand',
    cover: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/90186d177552385.64d8893542e7e.jpg',
    gallery: gallery(
      [
        'https://mir-s3-cdn-cf.behance.net/project_modules/1400/90186d177552385.64d8893542e7e.jpg',
        'https://mir-s3-cdn-cf.behance.net/project_modules/1400/484cc4177552385.64d889354a4a0.jpg',
        'https://mir-s3-cdn-cf.behance.net/project_modules/1400/1d2a09177552385.64d8893546a49.jpg',
        'https://mir-s3-cdn-cf.behance.net/project_modules/1400/f731bf177552385.64d8893545c19.jpg',
      ],
      'مجموعة شعارات #2',
      'Logofolio #2',
    ),
    context: {
      ar: 'مجموعة شعارات من مشاريع مختلفة تعرض التعامل مع صناعات وشخصيات متعددة.',
      en: 'A collection of marks from different projects, showing work across varied industries and brand personalities.',
    },
    proof: [{ label: { ar: 'المجموعة على Behance', en: 'Collection on Behance' }, url: 'https://www.behance.net/gallery/177552385/LOGOFOLIO-2' }],
    nextService: 'Essential Identity',
  },
  {
    slug: 'rivers-essential-oils',
    legacyId: 3,
    title_ar: 'زيوت ريفرز الأساسية',
    title_en: 'Rivers Essential Oils',
    serviceLine: 'brand',
    cover: rivers20,
    gallery: gallery([rivers20, rivers21, rivers23, rivers26, rivers27, rivers30, rivers31], 'زيوت ريفرز الأساسية', 'Rivers Essential Oils'),
    context: {
      ar: 'علامة زيوت أساسية تحتاج حضوراً بصرياً يعبّر عن الطبيعة والعناية على العبوة والرف.',
      en: 'An essential oils brand that needed a visual presence expressing nature and care on pack and on shelf.',
    },
    system: {
      ar: 'هوية بصرية وتطبيقات على العبوات والملصقات.',
      en: 'Visual identity with packaging and label applications.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/172135195/Rivers-Essentials-Oils' }],
    nextService: 'Core Identity',
  },
  {
    slug: 'gyptech-brand',
    legacyId: 4,
    title_ar: 'علامة جيبتك',
    title_en: 'Gyptech Brand',
    serviceLine: 'brand',
    cover: gyptech2,
    gallery: gallery([gyptech2, gyptech3, gyptech4, gyptech5, gyptech7, gyptech8, gyptech9], 'علامة جيبتك', 'Gyptech Brand'),
    context: {
      ar: 'شركة في مجال مواد البناء تحتاج هوية تقنية واضحة تعمل في السياق الصناعي.',
      en: 'A building materials company that needed a clear, technical identity that works in an industrial context.',
    },
    system: {
      ar: 'هوية بصرية وتطبيقات مؤسسية ومطبوعات.',
      en: 'Visual identity with corporate applications and print assets.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/162292719/GYPTECH-BRAND' }],
    nextService: 'Core Identity',
  },
  {
    slug: 'talia-bakery',
    legacyId: 5,
    title_ar: 'مخبز تاليا',
    title_en: 'Talia Bakery',
    serviceLine: 'brand',
    cover: talia4,
    gallery: gallery([talia4, talia5, talia6, talia7, talia9, talia10, talia11, talia14, talia15], 'مخبز تاليا', 'Talia Bakery'),
    context: {
      ar: 'مخبز يحتاج هوية دافئة قابلة للتطبيق على العبوات والفرع ووسائل التواصل.',
      en: 'A bakery that needed a warm identity applicable across packaging, the store, and social channels.',
    },
    system: {
      ar: 'هوية بصرية، نظام عبوات، وتطبيقات الفرع.',
      en: 'Visual identity, packaging system, and in-store applications.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/143498007/TALIA-BAKERY' }],
    nextService: 'Core Identity',
  },
  {
    slug: 'diamond-style',
    legacyId: 6,
    title_ar: 'دايموند ستايل',
    title_en: 'Diamond Style',
    serviceLine: 'brand',
    cover: diamond22,
    gallery: gallery([diamond22, diamond23, diamond29, diamond31, diamond32, diamond3], 'دايموند ستايل', 'Diamond Style'),
    context: {
      ar: 'علامة أزياء تحتاج نظاماً بصرياً هادئاً يعمل على المطبوعات والمساحات والمحتوى.',
      en: 'A fashion brand that needed a calm visual system working across print, space, and content.',
    },
    system: {
      ar: 'هوية بصرية وتطبيقات مطبوعة وتجارية.',
      en: 'Visual identity with print and retail applications.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/141461189/DIAMOND-STYLE' }],
    nextService: 'Core Identity',
  },
  {
    slug: 'nasaq-branding',
    legacyId: 8,
    title_ar: 'علامة نساق',
    title_en: 'Nasaq Branding',
    serviceLine: 'brand',
    cover: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/2bae2f132925191.61b2671429233.png',
    gallery: gallery(
      [
        'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/2bae2f132925191.61b2671429233.png',
        'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/3168e7132925191.61b2671429f98.png',
        'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/fd9875132925191.61b267142c057.png',
        'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/d8e4e5132925191.61b26714297f8.png',
      ],
      'علامة نساق',
      'Nasaq Branding',
    ),
    context: {
      ar: 'علامة عربية تحتاج معالجة تجمع الحرف العربي مع بناء بصري معاصر.',
      en: 'An Arabic brand that needed a treatment joining Arabic letterforms with a contemporary structure.',
    },
    system: {
      ar: 'شعار عربي ونظام بصري مرافق.',
      en: 'Arabic wordmark and the supporting visual system.',
    },
    proof: [{ label: { ar: 'المشروع على Behance', en: 'Project on Behance' }, url: 'https://www.behance.net/gallery/132925191/NASAQ-BRANDING' }],
    nextService: 'Core Identity',
  },
  {
    slug: 'sabaa-construction',
    legacyId: 9,
    title_ar: 'سبأ للمقاولات',
    title_en: 'Sabaa Construction',
    serviceLine: 'brand',
    cover: sabaa05,
    featured: true,
    gallery: gallery([sabaa03, sabaa04, sabaa05, sabaa08, sabaa09, sabaa10, sabaa11, sabaa13, sabaa14], 'سبأ للمقاولات', 'Sabaa Construction'),
    context: {
      ar: 'شركة مقاولات تحتاج هوية تعمل على المواقع والمعدات والمستندات الرسمية.',
      en: 'A construction company that needed an identity working across sites, equipment, and formal documents.',
    },
    system: {
      ar: 'هوية بصرية كاملة وتطبيقات مؤسسية وتشغيلية.',
      en: 'A full visual identity with corporate and operational applications.',
    },
    nextService: 'Identity System',
  },
  {
    slug: 'al-mahrizi-group',
    legacyId: 10,
    title_ar: 'مجموعة المحرزي',
    title_en: 'Al Mahrizi Group',
    serviceLine: 'brand',
    cover: mahrizi11,
    featured: true,
    gallery: gallery([mahrizi04, mahrizi05, mahrizi07, mahrizi08, mahrizi11, mahrizi12, mahrizi13, mahrizi14, mahrizi15], 'مجموعة المحرزي', 'Al Mahrizi Group'),
    context: {
      ar: 'مجموعة بعدة أنشطة تحتاج هوية أم تربط الوحدات دون فقدان وضوح كل واحدة.',
      en: 'A multi-activity group that needed a parent identity linking its units without losing each unit’s clarity.',
    },
    system: {
      ar: 'هوية مؤسسية وتطبيقات على المستندات والمساحات.',
      en: 'Corporate identity with document and environment applications.',
    },
    nextService: 'Strategy + Identity',
  },
  {
    slug: 'asdam-al-jabal-laundry',
    legacyId: 11,
    title_ar: 'مغسلة أسدام الجبل',
    title_en: 'Asdam Al Jabal Laundry',
    serviceLine: 'brand',
    cover: asdam07,
    featured: true,
    gallery: gallery([asdam01, asdam04, asdam05, asdam06, asdam07, asdam08, asdam12, asdam13, asdam14], 'مغسلة أسدام الجبل', 'Asdam Al Jabal Laundry'),
    context: {
      ar: 'خدمة محلية تحتاج هوية واضحة وسريعة التمييز على الفرع والأكياس والتوصيل.',
      en: 'A local service that needed a clear, quickly recognizable identity across store, bags, and delivery.',
    },
    system: {
      ar: 'هوية بصرية وتطبيقات الفرع والتغليف.',
      en: 'Visual identity with store and packaging applications.',
    },
    nextService: 'Essential Identity',
  },
  {
    slug: 'feaal-industry-profile',
    legacyId: 12,
    title_ar: 'بروفايل شركة فعّال للصناعة',
    title_en: 'Feaal Industry Profile',
    serviceLine: 'brand',
    cover: feaalCover,
    featured: true,
    gallery: [],
    pdfUrl: '/profiles/Feaal_Arabic_Profile.pdf',
    context: {
      ar: 'شركة صناعية تحتاج ملفاً تعريفياً يشرح القدرات التصنيعية للعملاء والموردين.',
      en: 'An industrial company that needed a profile explaining its manufacturing capabilities to clients and suppliers.',
    },
    system: {
      ar: 'ملف تعريفي كامل بالعربية: بناء المحتوى، التصميم، وملفات الطباعة والعرض.',
      en: 'A complete Arabic profile: content structure, design, and print/screen-ready files.',
    },
    proof: [{ label: { ar: 'ملف البروفايل (PDF)', en: 'Profile document (PDF)' }, url: '/profiles/Feaal_Arabic_Profile.pdf' }],
    nextService: 'Brand Guidelines',
  },
  {
    slug: 'tamaluk-platform-profile',
    legacyId: 13,
    title_ar: 'بروفايل منصة تملُك',
    title_en: 'Tamaluk Platform Profile',
    serviceLine: 'brand',
    cover: tamalukCover,
    featured: true,
    gallery: [],
    pdfUrl: '/profiles/Tamaluk_Profile.pdf',
    context: {
      ar: 'منصة تمويل جماعي للاستثمار العقاري في عُمان تحتاج مستنداً يشرح النموذج للمستثمرين.',
      en: 'A real-estate crowdfunding platform in Oman that needed a document explaining its model to investors.',
    },
    system: {
      ar: 'بروفايل مؤسسي: بناء المحتوى، الرسوم التوضيحية، والتصميم النهائي.',
      en: 'A corporate profile: content structure, explanatory graphics, and final design.',
    },
    proof: [{ label: { ar: 'ملف البروفايل (PDF)', en: 'Profile document (PDF)' }, url: '/profiles/Tamaluk_Profile.pdf' }],
    nextService: 'Brand Guidelines',
  },
];

export const findProject = (key: string | undefined): Project | undefined => {
  if (!key) return undefined;
  return projects.find((project) => project.slug === key || String(project.legacyId) === key);
};
