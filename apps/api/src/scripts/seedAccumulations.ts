import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Accumulation } from '../models/Accumulation';

const ACCUMULATIONS = [
  {
    title: 'Networking Fundamentals Challenge',
    type: 'Challenge',
    source: 'school',
    createdBy: 'IT Department',
    field: 'Network Administration',
    courses: ['BSIT'],
    deadline: 'Feb 10, 2025',
    duration: '2 weeks',
    points: 150,
    status: 'Active',
    participants: 48,
    skillTags: ['#networking', '#subnetting', '#routing', '#tcpip'],
    resourceLink: 'https://cisco.com/networking-academy',
    description: 'A hands-on challenge covering OSI model, subnetting, routing protocols and basic network troubleshooting. Students will complete lab simulations and a final practical exam to earn points toward their Networking performance field.',
    objectives: [
      'Understand and apply the OSI and TCP/IP models',
      'Configure basic routing and switching',
      'Perform subnetting calculations',
      'Troubleshoot common network issues',
    ],
    inCharge: [
      { name: 'Prof. Ramon Dela Cruz', role: 'Lead Facilitator', email: 'r.delacruz@school.edu' },
      { name: 'Ms. Tricia Santos', role: 'Lab Coordinator', email: 't.santos@school.edu' },
    ],
    participantList: [
      { name: 'Amara Osei', course: 'BSIT', status: 'Completed' },
      { name: 'Liam Nkosi', course: 'BSIT', status: 'In Progress' },
      { name: 'Sofia Mensah', course: 'BSIT', status: 'In Progress' },
      { name: 'Priya Sharma', course: 'BSIT', status: 'Completed' },
    ],
    grades: [],
  },
  {
    title: 'Business Analytics Bootcamp',
    type: 'Course',
    source: 'school',
    createdBy: 'Business Department',
    field: 'Data Analytics',
    courses: ['BSBA', 'BSIT'],
    deadline: 'Mar 1, 2025',
    duration: '4 weeks',
    points: 200,
    status: 'Active',
    participants: 62,
    skillTags: ['#dataanalytics', '#sql', '#excel', '#datavis'],
    resourceLink: 'https://coursera.org/business-analytics',
    description: "An intensive course on data-driven business decision making. Covers Excel, basic SQL, data visualisation with charts, and interpreting KPIs. Designed to boost students' analytics performance scores recognised by consulting partner companies.",
    objectives: [
      'Analyse business data using spreadsheets and SQL',
      'Build and interpret data visualisations',
      'Identify KPIs relevant to business operations',
      'Present data-backed recommendations',
    ],
    inCharge: [
      { name: 'Dr. Marisol Reyes', role: 'Course Director', email: 'm.reyes@school.edu' },
      { name: 'Mr. Joel Bautista', role: 'Data Instructor', email: 'j.bautista@school.edu' },
    ],
    participantList: [
      { name: 'David Kim', course: 'BSBA', status: 'Completed' },
      { name: 'Emily Rodriguez', course: 'BSBA', status: 'In Progress' },
      { name: 'Fatima Al-Hassan', course: 'BSBA', status: 'Completed' },
      { name: 'Lucas Ferreira', course: 'BSBA', status: 'Completed' },
      { name: 'Sofia Mensah', course: 'BSIT', status: 'Completed' },
    ],
    grades: [],
  },
  {
    title: 'Cybersecurity Awareness Task',
    type: 'Task',
    source: 'school',
    createdBy: 'IT Department',
    field: 'Cybersecurity',
    courses: ['BSIT', 'BSCS'],
    deadline: 'Jan 31, 2025',
    duration: '3 days',
    points: 75,
    status: 'Closing Soon',
    participants: 91,
    skillTags: ['#cybersecurity', '#phishing', '#infosec', '#securityawareness'],
    resourceLink: '',
    description: 'A short awareness task where students complete a series of security scenario quizzes, identify phishing attempts in simulated emails, and write a brief reflection on best practices for personal and organisational cybersecurity.',
    objectives: [
      'Identify common cybersecurity threats',
      'Recognise phishing and social engineering tactics',
      'Apply basic security hygiene practices',
    ],
    inCharge: [
      { name: 'Prof. Ramon Dela Cruz', role: 'Task Owner', email: 'r.delacruz@school.edu' },
    ],
    participantList: [
      { name: 'Amara Osei', course: 'BSIT', status: 'Completed' },
      { name: 'Sofia Mensah', course: 'BSIT', status: 'Completed' },
      { name: 'Priya Sharma', course: 'BSIT', status: 'Completed' },
      { name: 'Carlos Reyes', course: 'BSCS', status: 'Completed' },
      { name: 'Aisha Diallo', course: 'BSCS', status: 'In Progress' },
    ],
    grades: [],
  },
  {
    title: 'NexaCore Cloud Internship Prep',
    type: 'Course',
    source: 'company',
    createdBy: 'NexaCore Technologies',
    field: 'Cloud Computing',
    courses: ['BSIT', 'BSCS'],
    deadline: 'Feb 28, 2025',
    duration: '3 weeks',
    points: 250,
    status: 'Active',
    participants: 34,
    skillTags: ['#aws', '#cloudcomputing', '#devops', '#cicd'],
    resourceLink: 'https://aws.amazon.com/training',
    description: "Created by NexaCore Technologies to prepare students for real-world cloud environments. Covers AWS fundamentals, cloud storage, compute services, and basic DevOps concepts. Completion significantly improves a student's match score for NexaCore internship slots.",
    objectives: [
      'Navigate and use core AWS services',
      'Understand cloud storage and compute concepts',
      'Deploy a simple application to the cloud',
      'Understand basic CI/CD pipelines',
    ],
    inCharge: [
      { name: 'Engr. Kevin Tan', role: 'NexaCore Liaison', email: 'k.tan@nexacore.ph' },
      { name: 'Ms. Tricia Santos', role: 'School Coordinator', email: 't.santos@school.edu' },
    ],
    participantList: [
      { name: 'Liam Nkosi', course: 'BSIT', status: 'Completed' },
      { name: 'Priya Sharma', course: 'BSIT', status: 'Completed' },
      { name: 'Aisha Diallo', course: 'BSCS', status: 'Completed' },
      { name: 'Noah Kimani', course: 'BSCS', status: 'In Progress' },
    ],
    grades: [],
  },
  {
    title: 'BrightPath Business Case Challenge',
    type: 'Challenge',
    source: 'company',
    createdBy: 'BrightPath Consulting',
    field: 'Business Analysis',
    courses: ['BSBA'],
    deadline: 'Feb 15, 2025',
    duration: '1 week',
    points: 180,
    status: 'Active',
    participants: 27,
    skillTags: ['#businessanalysis', '#problemsolving', '#consulting', '#communication'],
    resourceLink: 'https://brightpathconsulting.com/challenge',
    description: 'BrightPath Consulting presents a real business case scenario where students must analyse the problem, identify root causes, and propose a structured solution. Top performers are fast-tracked for internship consideration at BrightPath.',
    objectives: [
      'Analyse a real-world business problem',
      'Apply structured problem-solving frameworks',
      'Develop and present a business recommendation',
      'Demonstrate communication and analytical skills',
    ],
    inCharge: [
      { name: 'Ms. Clara Villanueva', role: 'BrightPath HR Lead', email: 'c.villanueva@brightpathconsulting.com' },
      { name: 'Dr. Marisol Reyes', role: 'Academic Supervisor', email: 'm.reyes@school.edu' },
    ],
    participantList: [
      { name: 'David Kim', course: 'BSBA', status: 'Completed' },
      { name: 'Emily Rodriguez', course: 'BSBA', status: 'Completed' },
      { name: 'Samuel Adu', course: 'BSBA', status: 'In Progress' },
    ],
    grades: [],
  },
  {
    title: 'Synapse Hackathon: Build & Ship',
    type: 'Event',
    source: 'company',
    createdBy: 'Synapse Digital Studio',
    field: 'Web Development',
    courses: ['BSCS', 'BSIT'],
    deadline: 'Mar 8, 2025',
    duration: '48 hours',
    points: 300,
    status: 'Active',
    participants: 0,
    skillTags: ['#webdev', '#uiux', '#agile', '#hackathon', '#mobiledev'],
    resourceLink: 'https://synapsedigital.io/hackathon',
    description: 'A 48-hour hackathon hosted by Synapse Digital Studio where teams of 2–3 students design and build a working web or mobile prototype. Judged on creativity, technical execution, and product thinking. Winners receive direct internship offers from Synapse.',
    objectives: [
      'Build a functional web or mobile prototype in 48 hours',
      'Apply agile and collaborative development practices',
      'Present and pitch the product to a panel of judges',
      'Demonstrate UI/UX and development skills',
    ],
    inCharge: [
      { name: 'Mr. Diego Lim', role: 'Synapse Event Lead', email: 'd.lim@synapsedigital.io' },
      { name: 'Ms. Tricia Santos', role: 'School Coordinator', email: 't.santos@school.edu' },
    ],
    participantList: [],
    grades: [],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  await Accumulation.deleteMany({});
  console.log('Cleared existing accumulations');

  await Accumulation.insertMany(ACCUMULATIONS);
  console.log(`Seeded ${ACCUMULATIONS.length} accumulations`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
