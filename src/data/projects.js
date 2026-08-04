export const PROJECTS = Object.freeze([
  {
    id: 'csfd',
    number: '01',
    title: 'CSFD',
    shortTitle: 'CSFD',
    subtitle: 'Dev Lead',
    role: 'Dev Lead',
    description:
      "Developed the 'Computer Science First Date' full-stack web application connecting seniors and juniors in the SIT faculty, successfully onboarding 100+ active users to foster mentorship and community building.",
    bullets: Object.freeze([
      "Developed the 'Computer Science First Date' full-stack web application connecting seniors and juniors in the SIT faculty.",
      'Successfully onboarded 100+ active users to foster mentorship and community building.',
    ]),
    accent: '#E5A9A9',
    stack: Object.freeze(['React', 'Express', 'PostgreSQL', 'Git']),
    liveUrl: 'https://csfd.sit.kmutt.ac.th/',
    repositoryUrl: 'https://github.com/KimTaeman/CSFD',
    screenshots: Object.freeze([
      { label: 'Community experience', tone: '#F7DADA' },
      { label: 'Mentorship workflow', tone: '#E8C7C7' },
    ]),
  },
  {
    id: 'sit-face-recognition',
    number: '02',
    title: 'SIT 30th Anniversary Face Recognition App',
    shortTitle: 'SIT 30th',
    subtitle: 'AI & Frontend Integration',
    role: 'AI & Frontend Integration',
    description:
      'Built a real-time face recognition web app accurately identifying 200+ staff, committee members, students, and alumni of the KMUTT community, optimized via a Python API.',
    bullets: Object.freeze([
      'Built a real-time face recognition web app accurately identifying 200+ staff, committee members, students, and alumni of the KMUTT community.',
      'Optimized the recognition workflow through a Python API.',
    ]),
    accent: '#D5B4E8',
    stack: Object.freeze([
      'Python',
      'Machine Learning',
      'Face Detection API',
    ]),
    screenshots: Object.freeze([
      { label: 'Real-time recognition', tone: '#E8D8F1' },
      { label: 'KMUTT community dataset', tone: '#DCC4E9' },
    ]),
  },
  {
    id: 'csc302-score-tracker',
    number: '03',
    title: 'CSC302 Score Tracking System',
    shortTitle: 'CSC302',
    subtitle: 'Full-Stack & CMS Architecture',
    role: 'Full-Stack & CMS Architecture',
    description:
      'Developed a comprehensive score tracking system for the CS Talkathon managing 20+ teams, implementing a headless CMS architecture for efficient content management and real-time updates.',
    bullets: Object.freeze([
      'Developed a comprehensive score tracking system for the CS Talkathon managing 20+ teams.',
      'Implemented a headless CMS architecture for efficient content management and real-time updates.',
    ]),
    accent: '#7FB7A3',
    stack: Object.freeze(['Strapi CMS', 'Next.js', 'Vercel', 'Git']),
    liveUrl: 'https://csc302.vercel.app/',
    screenshots: Object.freeze([
      { label: 'Live score dashboard', tone: '#CDE7DD' },
      { label: 'Headless CMS workflow', tone: '#B9DACC' },
    ]),
  },
  {
    id: 'tattnsnap-photobooth',
    number: '04',
    title: 'Tattnsnap Photobooth',
    shortTitle: 'Tattnsnap',
    subtitle: 'Creator & Full-Stack Developer',
    role: 'Creator & Full-Stack Developer',
    description:
      'Developed an interactive web-based photobooth application featuring custom frames, real-time image filters, and seamless snapshot downloads.',
    accent: '#F2A6B3',
    stack: Object.freeze([
      'React',
      'Node.js',
      'Canvas API',
      'Tailwind CSS',
    ]),
    screenshots: Object.freeze([
      { label: 'Interactive photobooth', tone: '#F8D6DC' },
      { label: 'Custom frames and filters', tone: '#F3C4CE' },
    ]),
  },
  {
    id: 'project-alpha',
    number: '05',
    title: 'Project Alpha',
    shortTitle: 'Project Alpha',
    subtitle: 'Full-Stack Developer',
    role: 'Full-Stack Developer',
    description:
      'An experimental web architecture focused on high-performance data processing and clean user interface design.',
    accent: '#88A5D8',
    stack: Object.freeze(['Next.js', 'TypeScript', 'PostgreSQL']),
    screenshots: Object.freeze([
      { label: 'Architecture exploration', tone: '#DCE5F5' },
      { label: 'Interface system', tone: '#CAD8EF' },
    ]),
  },
])
