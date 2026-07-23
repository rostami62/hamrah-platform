import type {
  ChildProfileInput,
  Roadmap,
  RoadmapRecommendation,
} from "@/types/roadmap";

/**
 * الگوریتم قاعده‌محور تولید نقشه راه: بر اساس مقطع تحصیلی، نوع بیماری،
 * پروگنوز و عوارض کودک، توصیه‌های آموزشی، روانی و مالی را ترکیب می‌کند.
 * این خروجی جایگزین نظر تیم درمانی/مددکار نیست و صرفاً نقطه‌ی شروع گفتگوست.
 */
export function generateRoadmap(input: ChildProfileInput): Roadmap {
  return [
    {
      key: "educational",
      label: "آموزشی",
      recommendations: buildEducationalRecommendations(input),
    },
    {
      key: "psychological",
      label: "روانی",
      recommendations: buildPsychologicalRecommendations(input),
    },
    {
      key: "financial",
      label: "مالی",
      recommendations: buildFinancialRecommendations(input),
    },
  ];
}

function buildEducationalRecommendations(
  input: ChildProfileInput
): RoadmapRecommendation[] {
  const items: RoadmapRecommendation[] = [
    {
      title: "هماهنگی با مدرسه",
      description:
        "مدیر و مشاور مدرسه را در جریان روند درمان بگذارید تا غیبت‌های درمانی به‌عنوان غیبت مجاز ثبت شود.",
    },
  ];

  if (input.educationLevel === "preschool" || input.educationLevel === "elementary") {
    items.push({
      title: "حفظ ارتباط با هم‌کلاسی‌ها",
      description:
        "تماس تصویری یا نامه‌نگاری دوره‌ای با کلاس می‌تواند حس تعلق کودک را حفظ کند.",
    });
  } else {
    items.push({
      title: "برنامه‌ی درسی جایگزین",
      description:
        "با مشاور تحصیلی درباره‌ی برنامه‌ی مطالعه‌ی فشرده یا آموزش از راه دور در دوره‌ی درمان صحبت کنید.",
    });
  }

  if (input.complications.includes("cognitive-effects")) {
    items.push({
      title: "ارزیابی نیازهای ویژه یادگیری",
      description:
        "در صورت افت تمرکز یا حافظه، از مدرسه برای ارزیابی و برنامه‌ی آموزشی فردی (IEP) کمک بگیرید.",
    });
  }

  if (input.complications.includes("fatigue") || input.complications.includes("mobility-limitation")) {
    items.push({
      title: "تعدیل حضور فیزیکی",
      description:
        "ساعت‌های حضور یا فعالیت بدنی مدرسه (ورزش، زنگ تفریح) را متناسب با انرژی کودک تعدیل کنید.",
    });
  }

  return items;
}

function buildPsychologicalRecommendations(
  input: ChildProfileInput
): RoadmapRecommendation[] {
  const items: RoadmapRecommendation[] = [
    {
      title: "گفتگوی متناسب با سن",
      description:
        "درباره‌ی بیماری و درمان، با زبانی ساده و متناسب با سن کودک صحبت کنید؛ از پنهان‌کاری کامل پرهیز کنید.",
    },
    {
      title: "روتین پایدار خانواده",
      description:
        "حفظ برخی روتین‌های آشنا (زمان خواب، بازی) در دوره‌ی درمان به احساس امنیت کودک کمک می‌کند.",
    },
  ];

  if (input.complications.includes("body-image")) {
    items.push({
      title: "پشتیبانی در برابر تغییر ظاهر",
      description:
        "پیش از تغییرات ظاهری (مثل ریزش مو) با کودک صحبت کنید و در صورت نیاز، کلاه یا روسری متناسب با سلیقه‌ی او انتخاب کنید.",
    });
  }

  if (input.prognosis === "guarded" || input.prognosis === "critical") {
    items.push({
      title: "حمایت روان‌شناسی تخصصی برای خانواده",
      description:
        "جلسه‌ی منظم با روان‌شناس بالینی برای کودک و والدین را از تیم درمانی درخواست کنید.",
    });
  }

  items.push({
    title: "تکمیل دوره‌ای پرسشنامه‌ی سلامت روان",
    description:
      "با استفاده از بخش «غربالگری سلامت روان» سامانه، وضعیت روانی کودک را به‌صورت دوره‌ای پایش کنید.",
  });

  return items;
}

function buildFinancialRecommendations(
  input: ChildProfileInput
): RoadmapRecommendation[] {
  const items: RoadmapRecommendation[] = [
    {
      title: "بررسی پوشش بیمه‌ای",
      description:
        "با مددکار اجتماعی بیمارستان درباره‌ی پوشش بیمه‌ی پایه و تکمیلی و دفترچه‌ی بیماران خاص هماهنگ کنید.",
    },
    {
      title: "مستندسازی هزینه‌ها",
      description:
        "قبض‌ها و فاکتورهای درمانی را از همان ابتدا نگه دارید؛ برای درخواست کمک از خیریه‌ها لازم می‌شود.",
    },
  ];

  if (input.diseaseType === "brain-tumor" || input.diseaseType === "solid-tumor") {
    items.push({
      title: "هزینه‌های رفت‌وآمد و اقامت",
      description:
        "در صورت نیاز به مراجعات مکرر، فهرست اقامتگاه‌های نزدیک مراکز درمانی را در بخش «منابع حمایتی» ببینید.",
    });
  }

  if (input.prognosis === "critical") {
    items.push({
      title: "اولویت‌بندی درخواست حمایت مالی",
      description:
        "از مددکار اجتماعی بخواهید پرونده را برای بررسی اولویت‌دار نزد خیریه‌های همکار ثبت کند.",
    });
  }

  return items;
}
