# Mo Alagab — Local website

نسخة محلية مطوّرة من مشروع Cosmic Portfolio، نُقلت من Lovable بتاريخ 1 أكتوبر 2026، ثم أُعيد تصميم تجربة الموقع لجذب عملاء ومشاريع نوعية مع الحفاظ على ألوان الهوية وخط Lama.

التغييرات ونتائج التحقق في [ملخص التطوير](DESIGN-NOTES.md).

## التشغيل

```sh
cp .env.example .env
# ضع عنوان مشروع Supabase والمفتاح العام في ملف .env
npm ci
npm run dev
```

المعاينة: http://127.0.0.1:5173

## التحقق والبناء

```sh
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

المخرجات في `dist/`. يحتاج نشر الملفات الثابتة إلى إعادة توجيه مسارات التطبيق إلى `index.html`.

## ما نُقل

الصفحات العربية والإنجليزية، اتجاه RTL/LTR، خط Lama، الصور، معرض الأعمال وتفاصيل المشاريع، الخدمات والمنتجات، نموذج الطلب، لوحة الإدارة، وسياسة الخصوصية مع تطوير الواجهات والتنقل والحركات.

## الخدمات الخارجية

ملفات البيئة لا تُرفع إلى GitHub. انسخ `.env.example` إلى `.env` وأدخل `VITE_SUPABASE_URL` و`VITE_SUPABASE_PUBLISHABLE_KEY` و`VITE_TURNSTILE_SITE_KEY`. لا تضع مفتاح service-role في الواجهة.

### مسار الطلبات

النموذج في `/start` يرسل إلى دالة `submit-lead` فقط، ولا يكتب المتصفح في قاعدة البيانات مباشرة. الدالة تتحقق من البيانات ومن Cloudflare Turnstile، وتحفظ الطلب في جدول `leads`، ثم ترسل إيميلًا عبر Resend. إذا فشل الإيميل يبقى الطلب محفوظًا ويظهر في `/admin`.

أسرار الدالة (تُضبط في Supabase):

| السر | القيمة |
|---|---|
| `TURNSTILE_SECRET_KEY` | المفتاح السري من Cloudflare Turnstile |
| `RESEND_API_KEY` | مفتاح Resend |
| `RESEND_FROM` | مثل `Mo Alagab <hello@moalagab.art>` بعد توثيق الدومين في Resend |
| `LEAD_NOTIFY_EMAIL` | البريد الذي تصله التنبيهات |
| `ALLOWED_ORIGINS` | مثل `https://moalagab.art,https://www.moalagab.art,http://localhost:5173` |

المشروع الحالي: `moalagab-site` (ref `ogrsjrixowkogasgjajb`، فرانكفورت) في منظمة "MO Alagab Personal". مشروع Lovable القديم (`sgregfxztnalerugkrba`) لم يعد مستخدمًا. عند النشر من الدالة في لوحة Supabase، أبقِ "Verify JWT with legacy secret" مغلقًا.

ترتيب النشر مهم: الأسرار والدالة أولًا، ثم الـ migration (لأنها تمنع الإدخال المباشر من المتصفح)، ثم الواجهة.

```sh
supabase secrets set TURNSTILE_SECRET_KEY=... RESEND_API_KEY=... RESEND_FROM="..." LEAD_NOTIFY_EMAIL=... ALLOWED_ORIGINS=...
supabase functions deploy submit-lead
supabase db push
supabase functions delete notify-lead
supabase functions delete notify-service-request
```

اختبارات الدالة: `deno test supabase/functions/submit-lead/`.

لوحة الإدارة في `/admin` تعرض الطلبات مع حالة لكل طلب (جديد، تم التواصل، عرض سعر، مغلق). التسجيل العام أُزيل من الواجهة؛ أوقفه أيضًا من إعدادات Supabase Auth. صلاحية المدير تُمنح بإضافة صف في جدول `user_roles`.

## تغييرات النقل

أزيلت أداة تعليم العناصر الخاصة بمعاينة Lovable من إعدادات Vite. شُغلت المعاينة على عنوان محلي فقط. حُفظت الهوية والأصول والمحتوى الحقيقي، وطُوّر التصميم بالكامل. تُخفى الحقول غير المتوفرة لبعض المشاريع بدل إظهار نصوص مؤقتة. أُضيف التحميل المرحلي للصفحات وعارض PDF، وتحسين النموذج والوصول بلوحة المفاتيح، وموافقة الزائر قبل تحميل التحليلات.
