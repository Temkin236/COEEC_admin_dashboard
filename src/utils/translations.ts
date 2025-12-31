export type LanguageKey = "en" | "am" | "af"

export const SIDEBAR_TEXT: Record<
  LanguageKey,
  {
    dashboard: string
    content: string
    homepage: string
    about: string
    departments: string
    staff: string
    staffAll: string
    staffAdd: string
    research: string
    researchProjects: string
    researchPublications: string
    students: string
    studentsAll: string
    studentsAlumni: string
    studentsLife: string
    studentsClubs: string
    studentsCareers: string
    academic: string
    downloads: string
    contact: string
    approvals: string
    news: string
    events: string
  }
> = {
  en: {
    dashboard: "Dashboard",
    content: "Content",
    homepage: "Homepage",
    about: "About",
    departments: "Departments",
    staff: "Staff",
    staffAll: "All Staff",
    staffAdd: "Add Staff",
    research: "Research",
    researchProjects: "Projects",
    researchPublications: "Publications",
    students: "Students",
    studentsAll: "Students",
    studentsAlumni: "Alumni",
    studentsLife: "Student Life",
    studentsClubs: "Clubs",
    studentsCareers: "Career Opportunities",
    academic: "Academic Info",
    downloads: "Downloads",
    contact: "Contact & Feedback",
    approvals: "Approvals",
    news: "News",
    events: "Events",
  },
  am: {
    dashboard: "ዳሽቦርድ",
    content: "ይዘት",
    homepage: "መነሻ ገጽ",
    about: "ስለ እኛ",
    departments: "ዲፓርትመንቶች",
    staff: "ሰራተኞች",
    staffAll: "ሁሉም ሰራተኞች",
    staffAdd: "ሰራተኛ ጨምር",
    research: "ምርምር",
    researchProjects: "ፕሮጀክቶች",
    researchPublications: "ህትመቶች",
    students: "ተማሪዎች",
    studentsAll: "ተማሪዎች",
    studentsAlumni: "አለማማች",
    studentsLife: "የተማሪዎች ኑሮ",
    studentsClubs: "ክበቦች",
    studentsCareers: "የስራ እድሎች",
    academic: "የትምህርት መረጃ",
    downloads: "ዳውንሎድ",
    contact: "እውቂያ & አስተያየት",
    approvals: "አጽድቆ ማጽደቅ",
    news: "ዜና",
    events: "ዝግጅቶች",
  },
  af: {
    dashboard: "Daashboordii",
    content: "Qabiyyee",
    homepage: "Fuula Jalqabaa",
    about: "Waa'ee Keenya",
    departments: "Kutaaalee",
    staff: "Hojjettoota",
    staffAll: "Hojjettoota Hundaa",
    staffAdd: "Hojjetaa Dabaluu",
    research: "Qorannoo",
    researchProjects: "Projektoota",
    researchPublications: "Maxxansoota",
    students: "Barattoota",
    studentsAll: "Barattoota",
    studentsAlumni: "Alamni",
    studentsLife: "Jireenya Barattoota",
    studentsClubs: "Garee",
    studentsCareers: "Carraa Hojii",
    academic: "Odeeffannoo Barnootaa",
    downloads: "Buufannoowwan",
    contact: "Quunnamtii & Yaada",
    approvals: "Hayyama",
    news: "Oduu",
    events: "Taateewwan",
  },
}
