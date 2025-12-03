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
    academic: string
    downloads: string
    contact: string
    approvals: string
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
    academic: "Academic Info",
    downloads: "Downloads",
    contact: "Contact & Feedback",
    approvals: "Approvals",
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
    academic: "የትምህርት መረጃ",
    downloads: "ዳውንሎድ",
    contact: "እውቂያ & አስተያየት",
    approvals: "አጽድቆ ማጽደቅ",
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
    academic: "Odeeffannoo Barnootaa",
    downloads: "Buufannoowwan",
    contact: "Quunnamtii & Yaada",
    approvals: "Hayyama",
  },
}
