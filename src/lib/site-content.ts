import { Bot, Boxes, Palette, PanelsTopLeft } from 'lucide-react';

export const siteSettings = {
  email: 'mo@moalagab.art',
  whatsapp: '+966561167169',
  whatsappLink: 'https://wa.me/966561167169',
  linkedin: 'https://www.linkedin.com/in/moalagab',
  location: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
};

export const serviceLines = [
  {
    key: 'brand', icon: Palette,
    title: { ar: 'Brand & Visual', en: 'Brand & Visual' },
    role: { ar: 'الأساس', en: 'Core' },
    summary: { ar: 'نحوّل الفكرة إلى موقع واضح ونظام بصري يمكن لفريقك تطبيقه بثبات.', en: 'Turn an idea into clear positioning and a visual system your team can apply consistently.' },
    packages: [
      { name: 'Brand Strategy Sprint', scope: { ar: 'تدقيق، تموضع، جمهور، رسائل، Tone of Voice واتجاه بصري.', en: 'Audit, positioning, audience, messaging, tone of voice, and visual direction.' }, timeline: { ar: '3–7 أيام', en: '3–7 days' } },
      { name: 'Identity System', scope: { ar: 'شعار، ألوان، خطوط، Grid، أسلوب الصور والأيقونات، وتطبيقات أساسية.', en: 'Logo, color, typography, grid, image and icon direction, and core applications.' }, timeline: { ar: '4–8 أسابيع', en: '4–8 weeks' } },
      { name: 'Brand Guidelines', scope: { ar: 'دليل عملي للفريق والموردين يضبط الاستخدام والتسليم.', en: 'A practical guide for teams and vendors to keep execution consistent.' }, timeline: { ar: '1–2 أسبوع', en: '1–2 weeks' } },
    ],
  },
  {
    key: 'digital', icon: PanelsTopLeft,
    title: { ar: 'Digital Products', en: 'Digital Products' },
    role: { ar: 'نمو', en: 'Growth' },
    summary: { ar: 'نصمم ونبني منتجات رقمية تربط تجربة العميل بعمليات العمل.', en: 'Design and build digital products that connect customer experience with business operations.' },
    packages: [
      { name: 'Product Definition Sprint', scope: { ar: 'المشكلة، المستخدم، رحلة الاستخدام، النطاق، وأولوية النسخة الأولى.', en: 'Problem, user, journey, scope, and first-release priorities.' }, timeline: { ar: '1–2 أسبوع', en: '1–2 weeks' } },
      { name: 'Product Design & Build', scope: { ar: 'UX/UI، Prototype، بناء الواجهة، وربط الوظائف المطلوبة.', en: 'UX/UI, prototype, frontend build, and required integrations.' }, timeline: { ar: '4–10 أسابيع', en: '4–10 weeks' } },
    ],
  },
  {
    key: 'ai', icon: Bot,
    title: { ar: 'AI Automation', en: 'AI Automation' },
    role: { ar: 'نمو', en: 'Growth' },
    summary: { ar: 'نبني أنظمة ذكية تقلل العمل اليدوي وتربط المعرفة بالفعل.', en: 'Build intelligent systems that reduce manual work and connect knowledge to action.' },
    packages: [
      { name: 'Automation Discovery', scope: { ar: 'تحليل سير العمل، فرص الأتمتة، البيانات، والمخاطر.', en: 'Workflow analysis, automation opportunities, data, and risk review.' }, timeline: { ar: '3–5 أيام', en: '3–5 days' } },
      { name: 'AI Agent Build', scope: { ar: 'تصميم Agent، الأدوات، الذاكرة، واجهة الاستخدام، والاختبار.', en: 'Agent design, tools, memory, interface, and testing.' }, timeline: { ar: '3–8 أسابيع', en: '3–8 weeks' } },
    ],
  },
  {
    key: 'experiential', icon: Boxes,
    title: { ar: 'Experiential Design', en: 'Experiential Design' },
    role: { ar: 'انتقائي', en: 'Selective' },
    summary: { ar: 'نحوّل الهوية إلى تجربة متماسكة في المعارض والفعاليات والمساحات المؤقتة.', en: 'Extend identity into cohesive exhibitions, events, and temporary physical experiences.' },
    packages: [
      { name: 'Exhibition Identity System', scope: { ar: 'الفكرة البصرية، Booth graphics، الشاشات، المطبوعات، وملفات التسليم.', en: 'Visual concept, booth graphics, screens, print assets, and handover files.' }, timeline: { ar: '3–6 أسابيع', en: '3–6 weeks' } },
    ],
  },
] as const;

export const proofLinks = [
  { name: 'LifeTent', url: 'https://lifetent.online', type: { ar: 'Digital Product', en: 'Digital Product' } },
  { name: 'Smart Field AI Agent', url: 'https://agent.smartfield.sa', type: { ar: 'AI Automation', en: 'AI Automation' } },
];

export const copy = {
  ar: {
    nav: { home: 'الرئيسية', work: 'الأعمال', services: 'الخدمات', about: 'عني', start: 'ابدأ مشروعاً' },
    hero: { label: 'Brand Designer & AI Product Builder — الرياض', title: 'من الفكرة إلى نظام يعمل.', body: 'أصمم العلامات والتجارب التي يراها العميل، وأبني المنتجات والأنظمة الذكية التي تجعل العمل يحدث خلفها.', primary: 'ابدأ مشروعاً', secondary: 'شاهد الدليل' },
    common: { proof: 'دليل العمل', selected: 'أعمال مختارة', startTitle: 'لديك فكرة تحتاج أن تتحول إلى نظام؟', startBody: 'شارك السياق والهدف وما الذي يجب أن يتغيّر. سأراجع التفاصيل وأعود إليك بالخطوة الأنسب.', startCta: 'ابدأ الـ brief' },
  },
  en: {
    nav: { home: 'Home', work: 'Work', services: 'Services', about: 'About', start: 'Start a project' },
    hero: { label: 'Brand Designer & AI Product Builder — Riyadh', title: 'From idea to a working system.', body: 'I design the brands and experiences customers see, and build the products and AI systems that make the work happen behind them.', primary: 'Start a project', secondary: 'See the proof' },
    common: { proof: 'Proof of work', selected: 'Selected work', startTitle: 'Have an idea that needs to become a working system?', startBody: 'Share the context, goal, and what needs to change. I will review it and return with the clearest next step.', startCta: 'Start the brief' },
  },
} as const;