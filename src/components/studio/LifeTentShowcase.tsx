import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  FolderKanban,
  ListTodo,
  Sparkles,
  Target,
  Timer,
  Wallet,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const modules = [
  {
    id: "goals",
    icon: Target,
    ar: "الأهداف",
    en: "Goals",
    title: ["ابدأ من الصورة الكبيرة.", "Start with the bigger picture."],
    body: [
      "حدد وجهتك، ثم تابع تقدمك بمؤشرات واضحة.",
      "Define your direction and follow your progress with clear indicators.",
    ],
    items: [
      ["حدد هدفك", "قسّم الطريق", "تابع التقدم"],
      ["Set your goal", "Map the journey", "Track progress"],
    ],
  },
  {
    id: "tasks",
    icon: ListTodo,
    ar: "المهام",
    en: "Tasks",
    title: ["حوّل النية إلى خطوة.", "Turn intention into action."],
    body: [
      "مهام يومية مرتبة بالأولوية، مع تذكيرات تساعدك على المتابعة.",
      "Prioritised daily tasks with reminders to help you stay on track.",
    ],
    items: [
      ["خطط ليومك", "رتّب الأولويات", "أنجز الأهم"],
      ["Plan your day", "Set priorities", "Do what matters"],
    ],
  },
  {
    id: "calendar",
    icon: CalendarDays,
    ar: "التقويم",
    en: "Calendar",
    title: ["وقتك، في سياقك.", "Your time, in your context."],
    body: [
      "تقويم هجري وميلادي يجمع المواعيد والمناسبات وأوقات الصلاة.",
      "Hijri and Gregorian calendars bring appointments, occasions and prayer times together.",
    ],
    items: [
      ["هجري وميلادي", "مواعيد ومناسبات", "أوقات الصلاة"],
      ["Hijri & Gregorian", "Events & appointments", "Prayer times"],
    ],
  },
  {
    id: "finance",
    icon: Wallet,
    ar: "المالية",
    en: "Finances",
    title: ["شاهد أين يذهب مالك.", "Know where your money goes."],
    body: [
      "اجمع الميزانية والدخل والنفقات والاستثمارات في نظرة منظمة.",
      "Bring your budget, income, expenses and investments into an organised view.",
    ],
    items: [
      ["الميزانية", "الدخل والنفقات", "الاستثمارات"],
      ["Budget", "Income & expenses", "Investments"],
    ],
  },
  {
    id: "knowledge",
    icon: BookOpen,
    ar: "المعرفة",
    en: "Knowledge",
    title: ["ما تتعلمه، يبقى معك.", "Keep what you learn."],
    body: [
      "مساحة للدورات والملاحظات وبطاقات الحفظ، حتى تجد معرفتك حين تحتاجها.",
      "A home for courses, notes and flashcards, so your knowledge is there when you need it.",
    ],
    items: [
      ["الدورات", "الملاحظات", "بطاقات الحفظ"],
      ["Courses", "Notes", "Flashcards"],
    ],
  },
  {
    id: "projects",
    icon: FolderKanban,
    ar: "المشاريع",
    en: "Projects",
    title: ["من فكرة إلى مسار واضح.", "From idea to a clear path."],
    body: [
      "لوحة كانبان وأهداف OKRs وتقارير تساعدك على متابعة المشروع.",
      "Kanban boards, OKRs and reports help you keep your project moving.",
    ],
    items: [
      ["كانبان", "الأهداف والنتائج", "تقارير الأداء"],
      ["Kanban", "Objectives & results", "Performance reports"],
    ],
  },
  {
    id: "focus",
    icon: Timer,
    ar: "التركيز",
    en: "Focus",
    title: ["امنح المهمة وقتها.", "Give the task your attention."],
    body: [
      "جلسات بومودورو تمنح وقت العمل والاستراحة إيقاعًا واضحًا.",
      "Pomodoro sessions give work and breaks a clear rhythm.",
    ],
    items: [
      ["اختر المهمة", "ابدأ جلسة تركيز", "خذ استراحة"],
      ["Pick a task", "Start a focus session", "Take a break"],
    ],
  },
  {
    id: "habits",
    icon: CircleCheck,
    ar: "العادات والمزاج",
    en: "Habits & mood",
    title: ["التغيير يبدأ بما تكرره.", "Change starts with repetition."],
    body: [
      "تابع العادات والمزاج بإحصائيات تساعدك على ملاحظة أنماط يومك.",
      "Track habits and mood with statistics that help reveal the patterns in your day.",
    ],
    items: [
      ["العادات اليومية", "الحالة المزاجية", "الإحصائيات"],
      ["Daily habits", "Mood", "Statistics"],
    ],
  },
];

export default function LifeTentShowcase() {
  const { lang, isRtl } = useLanguage();
  const ar = lang === "ar";
  const l = ar ? 0 : 1;
  return (
    <section
      className="lifetent-showcase studio-section"
      id="lifetent"
      aria-labelledby="lifetent-title"
    >
      <div className="studio-container">
        <div className="lt-intro">
          <div>
            <p className="studio-eyebrow" dir="ltr">
              01 / LIFETENT · PERSONAL OPERATING SYSTEM
            </p>
            <h2 id="lifetent-title">
              {ar ? (
                <>
                  حياة كثيرة.
                  <br />
                  <span>مكان واحد.</span>
                </>
              ) : (
                <>
                  A full life.
                  <br />
                  <span>One place.</span>
                </>
              )}
            </h2>
          </div>
          <div className="lt-intro-copy">
            <p>
              {ar
                ? "الأهداف التي تطمح لها، والمهام التي تشغل يومك، وما تتعلمه وتديره وتكرره. LifeTent يجمعها في تجربة صُمّمت بالعربية أولًا."
                : "The goals you aspire to, the tasks that fill your day, and what you learn, manage and repeat. LifeTent brings them together in an Arabic-first experience."}
            </p>
            <a
              className="studio-button"
              href="https://www.lifetent.online/"
              target="_blank"
              rel="noreferrer"
            >
              {ar ? "اكتشف LifeTent" : "Discover LifeTent"}
              <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
            </a>
          </div>
        </div>
        <div className="lt-facts">
          <span>
            <b>08</b>
            {ar ? "أقسام متكاملة" : "Connected modules"}
          </span>
          <span>
            <b>AR / EN</b>
            {ar ? "تجربة بلغتين" : "Two languages"}
          </span>
          <span>
            <CalendarDays size={22} />
            {ar ? "هجري + ميلادي" : "Hijri + Gregorian"}
          </span>
          <span>
            <Sparkles size={22} />
            {ar ? "مساعد يفهم العربية" : "Arabic-aware assistant"}
          </span>
        </div>
        <Tabs.Root
          defaultValue="goals"
          dir={isRtl ? "rtl" : "ltr"}
          className="lt-explorer"
        >
          <div className="lt-explorer-heading">
            <p>
              {ar
                ? "ثمانية جوانب. تجربة مترابطة."
                : "Eight dimensions. One connected experience."}
            </p>
            <span>
              {ar ? "اختر قسمًا لاستكشافه" : "Choose a module to explore"}
            </span>
          </div>
          <Tabs.List
            className="lt-tabs"
            aria-label={ar ? "أقسام LifeTent" : "LifeTent modules"}
            loop
          >
            {modules.map((m) => (
              <Tabs.Trigger value={m.id} key={m.id} className="lt-tab">
                <m.icon size={18} />
                <span>{ar ? m.ar : m.en}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {modules.map((m, i) => (
            <Tabs.Content value={m.id} key={m.id} className="lt-panel">
              <div className="lt-panel-copy">
                <span className="studio-eyebrow" dir="ltr">
                  {String(i + 1).padStart(2, "0")} / 08
                </span>
                <h3>{m.title[l]}</h3>
                <p>{m.body[l]}</p>
                <div className="lt-connected">
                  <span />
                  <span />
                  {ar
                    ? "جزء من نظام حياتك المتكامل"
                    : "Part of your connected life system"}
                </div>
              </div>
              <div
                className={`lt-concept lt-concept--${m.id}`}
                aria-label={
                  ar ? "تصوّر توضيحي للقسم" : "Illustrative module concept"
                }
              >
                <div className="lt-concept-top">
                  <span dir="ltr">LIFE TENT /</span>
                  <span>{ar ? "تصوّر توضيحي" : "Illustrative concept"}</span>
                </div>
                <div className="lt-concept-core">
                  <div className="lt-concept-orbit" />
                  <m.icon size={42} strokeWidth={1.1} />
                  <strong>{ar ? m.ar : m.en}</strong>
                </div>
                <div className="lt-concept-items">
                  {m.items[l].map((item, n) => (
                    <div key={item}>
                      <span>{String(n + 1).padStart(2, "0")}</span>
                      <p>{item}</p>
                      <Check size={15} />
                    </div>
                  ))}
                </div>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
        <div className="lt-outro">
          <p>
            {ar
              ? "من تطبيقات متفرقة، إلى رؤية واحدة ليومك."
              : "From scattered apps to a single view of your day."}
          </p>
          <a
            href="https://www.lifetent.online/"
            target="_blank"
            rel="noreferrer"
          >
            {ar ? "جرّب المنتج" : "Try the product"}
            <ArrowUpRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
