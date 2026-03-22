export type AccumSource = "school" | "company"

export type PendingStudent = {
  id: string
  name: string
  email: string
  phone: string
  course: string
  year: string
  registeredAt: string
}

export type Student = {
  name: string; id: string; year: string; status: string
  email: string; phone: string; gpa: number
  totalPoints?: number
  section?: string
  skillTags?: string[]
  performance: { field: string; score: number }[]
  completedAccums: string[]
  currentAccums: string[]
  profileId?: string
}

export const COURSES = [
  {
    code: "BSIT",
    name: "BS Information Technology",
    enrolled: 210,
    capacity: 250,
    students: [
      { name: "Amara Osei",   id: "2021-0001", year: "3rd Year", status: "Active",    email: "amara.osei@school.edu",   phone: "+63 912 001 0001", gpa: 3.8, performance: [{ field: "Network Administration", score: 92 }, { field: "Cybersecurity", score: 85 }, { field: "Cloud Computing", score: 78 }], completedAccums: ["Networking Fundamentals Challenge", "Cybersecurity Awareness Task"], currentAccums: ["NexaCore Cloud Internship Prep"] },
      { name: "Liam Nkosi",   id: "2021-0002", year: "3rd Year", status: "Active",    email: "liam.nkosi@school.edu",   phone: "+63 912 001 0002", gpa: 3.5, performance: [{ field: "Network Administration", score: 80 }, { field: "Cloud Computing", score: 88 }, { field: "Software Development", score: 74 }], completedAccums: ["NexaCore Cloud Internship Prep"], currentAccums: ["Networking Fundamentals Challenge"] },
      { name: "Sofia Mensah", id: "2022-0015", year: "2nd Year", status: "Active",    email: "sofia.mensah@school.edu", phone: "+63 912 001 0015", gpa: 3.6, performance: [{ field: "Cybersecurity", score: 90 }, { field: "Network Administration", score: 76 }, { field: "Data Analytics", score: 82 }], completedAccums: ["Cybersecurity Awareness Task", "Business Analytics Bootcamp"], currentAccums: ["Networking Fundamentals Challenge"] },
      { name: "James Owusu",  id: "2022-0016", year: "2nd Year", status: "Probation", email: "james.owusu@school.edu",  phone: "+63 912 001 0016", gpa: 2.1, performance: [{ field: "Network Administration", score: 55 }, { field: "Software Development", score: 60 }, { field: "Cloud Computing", score: 50 }], completedAccums: [], currentAccums: [] },
      { name: "Priya Sharma", id: "2023-0031", year: "1st Year", status: "Active",    email: "priya.sharma@school.edu", phone: "+63 912 001 0031", gpa: 3.9, performance: [{ field: "Software Development", score: 95 }, { field: "Cloud Computing", score: 91 }, { field: "Cybersecurity", score: 88 }], completedAccums: ["NexaCore Cloud Internship Prep", "Cybersecurity Awareness Task"], currentAccums: ["Networking Fundamentals Challenge"] },
    ] as Student[],
  },
  {
    code: "BSCS",
    name: "BS Computer Science",
    enrolled: 180,
    capacity: 200,
    students: [
      { name: "Carlos Reyes", id: "2021-0042", year: "3rd Year", status: "Active", email: "carlos.reyes@school.edu", phone: "+63 912 002 0042", gpa: 3.7, performance: [{ field: "Software Development", score: 94 }, { field: "Web Development", score: 89 }, { field: "Cybersecurity", score: 80 }], completedAccums: ["Cybersecurity Awareness Task", "Synapse Hackathon: Build & Ship"], currentAccums: ["NexaCore Cloud Internship Prep"] },
      { name: "Aisha Diallo", id: "2021-0043", year: "3rd Year", status: "Active", email: "aisha.diallo@school.edu", phone: "+63 912 002 0043", gpa: 3.9, performance: [{ field: "Web Development", score: 97 }, { field: "Mobile Development", score: 92 }, { field: "UI/UX Design", score: 88 }], completedAccums: ["Synapse Hackathon: Build & Ship", "NexaCore Cloud Internship Prep"], currentAccums: ["Cybersecurity Awareness Task"] },
      { name: "Noah Kimani",  id: "2022-0058", year: "2nd Year", status: "Active", email: "noah.kimani@school.edu",  phone: "+63 912 002 0058", gpa: 3.3, performance: [{ field: "Software Development", score: 78 }, { field: "Cloud Computing", score: 83 }, { field: "Web Development", score: 75 }], completedAccums: ["NexaCore Cloud Internship Prep"], currentAccums: ["Synapse Hackathon: Build & Ship"] },
      { name: "Mei Lin",      id: "2023-0071", year: "1st Year", status: "Active", email: "mei.lin@school.edu",      phone: "+63 912 002 0071", gpa: 3.6, performance: [{ field: "UI/UX Design", score: 91 }, { field: "Web Development", score: 86 }, { field: "Mobile Development", score: 80 }], completedAccums: ["Synapse Hackathon: Build & Ship"], currentAccums: ["NexaCore Cloud Internship Prep"] },
    ] as Student[],
  },
  {
    code: "BSBA",
    name: "BS Business Administration",
    enrolled: 95,
    capacity: 100,
    students: [
      { name: "David Kim",        id: "2021-0089", year: "3rd Year", status: "Active",    email: "david.kim@school.edu",        phone: "+63 912 003 0089", gpa: 3.7, performance: [{ field: "Business Analysis", score: 93 }, { field: "Data Analytics", score: 88 }, { field: "Project Management", score: 85 }], completedAccums: ["Business Analytics Bootcamp", "BrightPath Business Case Challenge"], currentAccums: [] },
      { name: "Emily Rodriguez",  id: "2022-0094", year: "2nd Year", status: "Active",    email: "emily.rodriguez@school.edu",  phone: "+63 912 003 0094", gpa: 3.5, performance: [{ field: "Business Analysis", score: 87 }, { field: "Communication", score: 92 }, { field: "Project Management", score: 80 }], completedAccums: ["BrightPath Business Case Challenge"], currentAccums: ["Business Analytics Bootcamp"] },
      { name: "Samuel Adu",       id: "2022-0095", year: "2nd Year", status: "Probation", email: "samuel.adu@school.edu",       phone: "+63 912 003 0095", gpa: 2.3, performance: [{ field: "Business Analysis", score: 58 }, { field: "Data Analytics", score: 62 }, { field: "Communication", score: 55 }], completedAccums: [], currentAccums: ["BrightPath Business Case Challenge"] },
      { name: "Fatima Al-Hassan", id: "2023-0110", year: "1st Year", status: "Active",    email: "fatima.alhassan@school.edu",  phone: "+63 912 003 0110", gpa: 3.8, performance: [{ field: "Data Analytics", score: 90 }, { field: "Business Analysis", score: 86 }, { field: "Communication", score: 89 }], completedAccums: ["Business Analytics Bootcamp"], currentAccums: ["BrightPath Business Case Challenge"] },
      { name: "Lucas Ferreira",   id: "2023-0111", year: "1st Year", status: "Active",    email: "lucas.ferreira@school.edu",   phone: "+63 912 003 0111", gpa: 3.4, performance: [{ field: "Project Management", score: 84 }, { field: "Business Analysis", score: 79 }, { field: "Communication", score: 82 }], completedAccums: ["Business Analytics Bootcamp"], currentAccums: ["BrightPath Business Case Challenge"] },
    ] as Student[],
  },
]

export type InternshipRole = {
  title: string
  open: boolean
  requiredPoints: number
  requirements: string[]
}

export const COMPANIES = [
  {
    name: "NexaCore Technologies",
    industry: "Information Technology",
    location: "Makati City, Metro Manila",
    website: "www.nexacore.ph",
    email: "internships@nexacore.ph",
    phone: "+63 2 8123 4567",
    partnerSince: "2021",
    status: "Active Partner",
    slots: 12,
    slotsAvailable: 5,
    about: "NexaCore Technologies is a leading IT solutions provider specializing in enterprise software, cloud infrastructure, and cybersecurity services across Southeast Asia. They actively take in interns from partner schools to build a pipeline of skilled graduates.",
    lookingFor: ["BSIT", "BSCS"],
    preferredSkills: [
      { field: "Network Administration", weight: "High" },
      { field: "Cybersecurity", weight: "High" },
      { field: "Cloud Computing", weight: "Medium" },
      { field: "Software Development", weight: "Medium" },
    ],
    currentInterns: [
      { name: "Amara Osei", course: "BSIT", status: "Ongoing" },
      { name: "Carlos Reyes", course: "BSCS", status: "Ongoing" },
    ],
    internshipRoles: [
      { title: "Network Engineer Intern", open: true, requiredPoints: 300, requirements: ["BSIT or BSCS", "Min. GPA 3.0", "Completed Networking Fundamentals Challenge", "Basic knowledge of routing & switching"] },
      { title: "Cybersecurity Analyst Intern", open: true, requiredPoints: 250, requirements: ["BSIT or BSCS", "Min. GPA 3.2", "Completed Cybersecurity Awareness Task", "Familiarity with threat analysis"] },
      { title: "Cloud Infrastructure Intern", open: false, requiredPoints: 400, requirements: ["BSIT or BSCS", "Min. GPA 3.5", "Completed NexaCore Cloud Internship Prep", "Experience with AWS or Azure"] },
      { title: "Software Developer Intern", open: true, requiredPoints: 200, requirements: ["BSIT or BSCS", "Min. GPA 2.8", "Proficiency in at least one programming language", "Basic understanding of software development lifecycle"] },
    ] as InternshipRole[],
  },
  {
    name: "BrightPath Consulting",
    industry: "Business & Management Consulting",
    location: "BGC, Taguig City",
    website: "www.brightpathconsulting.com",
    email: "hr@brightpathconsulting.com",
    phone: "+63 2 8765 4321",
    partnerSince: "2022",
    status: "Active Partner",
    slots: 8,
    slotsAvailable: 3,
    about: "BrightPath Consulting helps mid-to-large enterprises optimize operations and strategy. Their internship programme focuses on business analysis, project management, and data-driven decision making, ideal for business and IT students.",
    lookingFor: ["BSBA", "BSIT"],
    preferredSkills: [
      { field: "Business Analysis", weight: "High" },
      { field: "Data Analytics", weight: "High" },
      { field: "Project Management", weight: "Medium" },
      { field: "Communication", weight: "Medium" },
    ],
    currentInterns: [
      { name: "David Kim", course: "BSBA", status: "Ongoing" },
    ],
    internshipRoles: [
      { title: "Business Analyst Intern", open: true, requiredPoints: 350, requirements: ["BSBA or BSIT", "Min. GPA 3.0", "Completed Business Analytics Bootcamp", "Proficiency in Excel and basic SQL"] },
      { title: "Project Management Intern", open: true, requiredPoints: 280, requirements: ["BSBA", "Min. GPA 3.0", "Completed BrightPath Business Case Challenge", "Strong communication skills"] },
      { title: "Data Analytics Intern", open: false, requiredPoints: 450, requirements: ["BSBA or BSIT", "Min. GPA 3.5", "Completed Business Analytics Bootcamp", "Experience with data visualisation tools"] },
    ] as InternshipRole[],
  },
  {
    name: "Synapse Digital Studio",
    industry: "Software Development & Design",
    location: "Cebu City, Cebu",
    website: "www.synapsedigital.io",
    email: "careers@synapsedigital.io",
    phone: "+63 32 412 8900",
    partnerSince: "2023",
    status: "New Partner",
    slots: 6,
    slotsAvailable: 6,
    about: "Synapse Digital Studio is a fast-growing product studio building web and mobile applications for startups and SMEs. They offer hands-on internship experience in full-stack development, UI/UX design, and agile product delivery.",
    lookingFor: ["BSCS", "BSIT"],
    preferredSkills: [
      { field: "Web Development", weight: "High" },
      { field: "Mobile Development", weight: "High" },
      { field: "UI/UX Design", weight: "Medium" },
      { field: "Agile / Scrum", weight: "Low" },
    ],
    currentInterns: [],
    internshipRoles: [
      { title: "Full-Stack Developer Intern", open: true, requiredPoints: 300, requirements: ["BSCS or BSIT", "Min. GPA 3.0", "Completed Synapse Hackathon or equivalent", "Proficiency in React or Vue.js"] },
      { title: "UI/UX Design Intern", open: true, requiredPoints: 250, requirements: ["BSCS or BSIT", "Min. GPA 2.8", "Portfolio of design work", "Familiarity with Figma or Adobe XD"] },
      { title: "Mobile Developer Intern", open: true, requiredPoints: 280, requirements: ["BSCS or BSIT", "Min. GPA 3.0", "Experience with React Native or Flutter", "Published or demo app preferred"] },
    ] as InternshipRole[],
  },
]

export const PENDING_STUDENTS: PendingStudent[] = [
  { id: "pnd-001", name: "Marco Dela Torre",  email: "marco.delatorre@gmail.com",  phone: "+63 917 100 0001", course: "BSIT", year: "1st Year", registeredAt: "Jan 15, 2025" },
  { id: "pnd-002", name: "Hannah Reyes",       email: "hannah.reyes@gmail.com",       phone: "+63 917 100 0002", course: "BSCS", year: "1st Year", registeredAt: "Jan 17, 2025" },
  { id: "pnd-003", name: "Jerome Castillo",   email: "jerome.castillo@gmail.com",   phone: "+63 917 100 0003", course: "BSBA", year: "2nd Year", registeredAt: "Jan 20, 2025" },
  { id: "pnd-004", name: "Trisha Villanueva", email: "trisha.villanueva@gmail.com", phone: "+63 917 100 0004", course: "BSIT", year: "2nd Year", registeredAt: "Jan 22, 2025" },
]

export const ACCUMULATIONS = [
  {
    id: "acc-1",
    title: "Networking Fundamentals Challenge",
    type: "Challenge",
    source: "school" as AccumSource,
    createdBy: "IT Department",
    field: "Network Administration",
    courses: ["BSIT"],
    deadline: "Feb 10, 2025",
    duration: "2 weeks",
    points: 150,
    status: "Active",
    participants: 48,
    skillTags: ["#networking", "#subnetting", "#routing", "#tcpip"],
    resourceLink: "https://cisco.com/networking-academy",
    description: "A hands-on challenge covering OSI model, subnetting, routing protocols and basic network troubleshooting. Students will complete lab simulations and a final practical exam to earn points toward their Networking performance field.",
    objectives: [
      "Understand and apply the OSI and TCP/IP models",
      "Configure basic routing and switching",
      "Perform subnetting calculations",
      "Troubleshoot common network issues",
    ],
    inCharge: [
      { name: "Prof. Ramon Dela Cruz", role: "Lead Facilitator", email: "r.delacruz@school.edu" },
      { name: "Ms. Tricia Santos",     role: "Lab Coordinator",  email: "t.santos@school.edu" },
    ],
    participantList: [
      { name: "Amara Osei",   course: "BSIT", status: "Completed" },
      { name: "Liam Nkosi",   course: "BSIT", status: "In Progress" },
      { name: "Sofia Mensah", course: "BSIT", status: "In Progress" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
    ],
  },
  {
    id: "acc-2",
    title: "Business Analytics Bootcamp",
    type: "Course",
    source: "school" as AccumSource,
    createdBy: "Business Department",
    field: "Data Analytics",
    courses: ["BSBA", "BSIT"],
    deadline: "Mar 1, 2025",
    duration: "4 weeks",
    points: 200,
    status: "Active",
    participants: 62,
    skillTags: ["#dataanalytics", "#sql", "#excel", "#datavis"],
    resourceLink: "https://coursera.org/business-analytics",
    description: "An intensive course on data-driven business decision making. Covers Excel, basic SQL, data visualisation with charts, and interpreting KPIs. Designed to boost students' analytics performance scores recognised by consulting partner companies.",
    objectives: [
      "Analyse business data using spreadsheets and SQL",
      "Build and interpret data visualisations",
      "Identify KPIs relevant to business operations",
      "Present data-backed recommendations",
    ],
    inCharge: [
      { name: "Dr. Marisol Reyes", role: "Course Director", email: "m.reyes@school.edu" },
      { name: "Mr. Joel Bautista", role: "Data Instructor",  email: "j.bautista@school.edu" },
    ],
    participantList: [
      { name: "David Kim",        course: "BSBA", status: "Completed" },
      { name: "Emily Rodriguez",  course: "BSBA", status: "In Progress" },
      { name: "Fatima Al-Hassan", course: "BSBA", status: "Completed" },
      { name: "Lucas Ferreira",   course: "BSBA", status: "Completed" },
      { name: "Sofia Mensah",     course: "BSIT", status: "Completed" },
    ],
  },
  {
    id: "acc-3",
    title: "Cybersecurity Awareness Task",
    type: "Task",
    source: "school" as AccumSource,
    createdBy: "IT Department",
    field: "Cybersecurity",
    courses: ["BSIT", "BSCS"],
    deadline: "Jan 31, 2025",
    duration: "3 days",
    points: 75,
    status: "Closing Soon",
    participants: 91,
    skillTags: ["#cybersecurity", "#phishing", "#infosec", "#securityawareness"],
    resourceLink: "",
    description: "A short awareness task where students complete a series of security scenario quizzes, identify phishing attempts in simulated emails, and write a brief reflection on best practices for personal and organisational cybersecurity.",
    objectives: [
      "Identify common cybersecurity threats",
      "Recognise phishing and social engineering tactics",
      "Apply basic security hygiene practices",
    ],
    inCharge: [
      { name: "Prof. Ramon Dela Cruz", role: "Task Owner", email: "r.delacruz@school.edu" },
    ],
    participantList: [
      { name: "Amara Osei",   course: "BSIT", status: "Completed" },
      { name: "Sofia Mensah", course: "BSIT", status: "Completed" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
      { name: "Carlos Reyes", course: "BSCS", status: "Completed" },
      { name: "Aisha Diallo", course: "BSCS", status: "In Progress" },
    ],
  },
  {
    id: "acc-4",
    title: "NexaCore Cloud Internship Prep",
    type: "Course",
    source: "company" as AccumSource,
    createdBy: "NexaCore Technologies",
    field: "Cloud Computing",
    courses: ["BSIT", "BSCS"],
    deadline: "Feb 28, 2025",
    duration: "3 weeks",
    points: 250,
    status: "Active",
    participants: 34,
    skillTags: ["#aws", "#cloudcomputing", "#devops", "#cicd"],
    resourceLink: "https://aws.amazon.com/training",
    description: "Created by NexaCore Technologies to prepare students for real-world cloud environments. Covers AWS fundamentals, cloud storage, compute services, and basic DevOps concepts. Completion significantly improves a student's match score for NexaCore internship slots.",
    objectives: [
      "Navigate and use core AWS services",
      "Understand cloud storage and compute concepts",
      "Deploy a simple application to the cloud",
      "Understand basic CI/CD pipelines",
    ],
    inCharge: [
      { name: "Engr. Kevin Tan",   role: "NexaCore Liaison",   email: "k.tan@nexacore.ph" },
      { name: "Ms. Tricia Santos", role: "School Coordinator", email: "t.santos@school.edu" },
    ],
    participantList: [
      { name: "Liam Nkosi",   course: "BSIT", status: "Completed" },
      { name: "Priya Sharma", course: "BSIT", status: "Completed" },
      { name: "Aisha Diallo", course: "BSCS", status: "Completed" },
      { name: "Noah Kimani",  course: "BSCS", status: "In Progress" },
    ],
  },
  {
    id: "acc-5",
    title: "BrightPath Business Case Challenge",
    type: "Challenge",
    source: "company" as AccumSource,
    createdBy: "BrightPath Consulting",
    field: "Business Analysis",
    courses: ["BSBA"],
    deadline: "Feb 15, 2025",
    duration: "1 week",
    points: 180,
    status: "Active",
    participants: 27,
    skillTags: ["#businessanalysis", "#problemsolving", "#consulting", "#communication"],
    resourceLink: "https://brightpathconsulting.com/challenge",
    description: "BrightPath Consulting presents a real business case scenario where students must analyse the problem, identify root causes, and propose a structured solution. Top performers are fast-tracked for internship consideration at BrightPath.",
    objectives: [
      "Analyse a real-world business problem",
      "Apply structured problem-solving frameworks",
      "Develop and present a business recommendation",
      "Demonstrate communication and analytical skills",
    ],
    inCharge: [
      { name: "Ms. Clara Villanueva", role: "BrightPath HR Lead",  email: "c.villanueva@brightpathconsulting.com" },
      { name: "Dr. Marisol Reyes",   role: "Academic Supervisor", email: "m.reyes@school.edu" },
    ],
    participantList: [
      { name: "David Kim",       course: "BSBA", status: "Completed" },
      { name: "Emily Rodriguez", course: "BSBA", status: "Completed" },
      { name: "Samuel Adu",      course: "BSBA", status: "In Progress" },
    ],
  },
  {
    id: "acc-6",
    title: "Synapse Hackathon: Build & Ship",
    type: "Event",
    source: "company" as AccumSource,
    createdBy: "Synapse Digital Studio",
    field: "Web Development",
    courses: ["BSCS", "BSIT"],
    deadline: "Mar 8, 2025",
    duration: "48 hours",
    points: 300,
    status: "Upcoming",
    participants: 0,
    skillTags: ["#webdev", "#uiux", "#agile", "#hackathon", "#mobiledev"],
    resourceLink: "https://synapsedigital.io/hackathon",
    description: "A 48-hour hackathon hosted by Synapse Digital Studio where teams of 2–3 students design and build a working web or mobile prototype. Judged on creativity, technical execution, and product thinking. Winners receive direct internship offers from Synapse.",
    objectives: [
      "Build a functional web or mobile prototype in 48 hours",
      "Apply agile and collaborative development practices",
      "Present and pitch the product to a panel of judges",
      "Demonstrate UI/UX and development skills",
    ],
    inCharge: [
      { name: "Mr. Diego Lim",     role: "Synapse Event Lead", email: "d.lim@synapsedigital.io" },
      { name: "Ms. Tricia Santos", role: "School Coordinator", email: "t.santos@school.edu" },
    ],
    participantList: [],
  },
]
