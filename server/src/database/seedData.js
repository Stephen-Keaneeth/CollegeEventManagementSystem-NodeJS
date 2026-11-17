const bcrypt = require('bcryptjs');

// Salt & Hash password for seed users: 'Password123!'
const hashedPassword = bcrypt.hashSync('Password123!', 10);

const users = [
  {
    name: 'Dr. Ramesh Sharma',
    email: 'admin@college.edu',
    password: hashedPassword,
    role: 'admin',
    department: 'Administration & Academic Affairs',
    roll_number: 'ADM-2020-01',
    phone: '+91 98765 43210',
    bio: 'Dean of Student Affairs and Campus Event Administrator.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Prof. Ananya Iyer',
    email: 'organizer@college.edu',
    password: hashedPassword,
    role: 'organizer',
    department: 'Computer Science & Engineering',
    roll_number: 'FAC-CS-042',
    phone: '+91 98765 12345',
    bio: 'Associate Professor & Faculty Coordinator for Tech Innovators Club.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Vikram Malhotra',
    email: 'cultural.head@college.edu',
    password: hashedPassword,
    role: 'organizer',
    department: 'Student Activity Council',
    roll_number: 'SAC-2022-09',
    phone: '+91 98111 22334',
    bio: 'President of Student Cultural Council and Arts Society.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Aarav Patel',
    email: 'student@college.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Computer Science & Engineering',
    roll_number: 'CS21B042',
    phone: '+91 91234 56789',
    bio: '3rd Year CSE undergrad passionate about cloud computing and web development.',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Information Technology',
    roll_number: 'IT22B118',
    phone: '+91 98712 34567',
    bio: '2nd Year IT student, AI enthusiast and competitive programmer.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Rohit Verma',
    email: 'rohit.verma@college.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Mechanical Engineering',
    roll_number: 'ME21B007',
    phone: '+91 94567 89012',
    bio: 'Final year MechE student, Robotics Club team lead and sports coordinator.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@college.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Electronics & Communication',
    roll_number: 'EC23B055',
    phone: '+91 93456 78901',
    bio: '1st Year ECE undergrad, classical dancer and debate team member.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@college.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Computer Science & Engineering',
    roll_number: 'CS22B089',
    phone: '+91 92345 67890',
    bio: 'Sophomore, open source contributor and gaming club captain.',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
  }
];

const categories = [
  {
    name: 'Technical & Coding',
    slug: 'technical-coding',
    description: 'Hackathons, algorithmic contests, code sprints and software exhibitions.',
    color: '#3B82F6',
    icon: 'Code'
  },
  {
    name: 'Hackathons & Challenges',
    slug: 'hackathons-challenges',
    description: 'Multi-hour prototype building challenges, UI/UX sprints, and problem solving.',
    color: '#8B5CF6',
    icon: 'Trophy'
  },
  {
    name: 'Cultural & Arts',
    slug: 'cultural-arts',
    description: 'Music nights, dance competitions, theatre, literature fests and fine arts.',
    color: '#EC4899',
    icon: 'Music'
  },
  {
    name: 'Workshops & Bootcamps',
    slug: 'workshops-bootcamps',
    description: 'Interactive technical training, career guidance, and hands-on skill development.',
    color: '#10B981',
    icon: 'Wrench'
  },
  {
    name: 'Seminars & Keynotes',
    slug: 'seminars-keynotes',
    description: 'Expert talks, industry leader panels, research symposiums and alumni dialogues.',
    color: '#F59E0B',
    icon: 'Mic'
  },
  {
    name: 'Sports & Athletics',
    slug: 'sports-athletics',
    description: 'Inter-department leagues, badminton, basketball, football and indoor games.',
    color: '#EF4444',
    icon: 'Activity'
  }
];

const venues = [
  {
    name: 'Main University Auditorium',
    building: 'Central Administrative Complex',
    capacity: 850,
    facilities: 'Laser 4K Projection, Dolby Atmos Surround Audio, 8 Stage Wireless Mics, Central HVAC',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Sir C.V. Raman Seminar Hall',
    building: 'Science & Engineering Tower, 3rd Floor',
    capacity: 250,
    facilities: 'Dual HD Screens, Podium Audio System, High-Speed Wi-Fi 6, Tiered Seating',
    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Alan Turing Advanced Computing Lab',
    building: 'CS & IT Wing, Block B',
    capacity: 120,
    facilities: '120 Dedicated High-Performance Workstations, Gigabit LAN, Gigabit Cloud Uplink, UPS Backup',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Open Air Amphitheatre',
    building: 'Central Campus Quadrangle',
    capacity: 1500,
    facilities: 'Acoustic Shell, Stadium Lighting, Professional Concert Truss, Open Canopy',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Campus Sports Arena & Complex',
    building: 'Athletics & Recreation Center',
    capacity: 600,
    facilities: 'Indoor Wooden Courts, Electronic Scoreboard, Spectator Gallery, First Aid Bay',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dr. APJ Abdul Kalam Innovation Hub',
    building: 'Research & Incubation Center',
    capacity: 180,
    facilities: 'Flexible Modular Desks, Smart Whiteboards, 3D Printers, Presentation Pods',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  }
];

// Helper to format timestamps relative to current date
const now = new Date();
const addDays = (days, hours = 10) => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

const events = [
  {
    title: 'HackNova 2026: 36-Hour National College Hackathon',
    short_description: 'Build breakthrough generative AI, web3, and IoT solutions with industry mentors and \$10,000 in prizes.',
    description: `HackNova is our flagship annual student hackathon bringing together the brightest engineering minds across the country. Over 36 intensive hours, teams brainstorm, architect, code and pitch cutting-edge solutions to real-world challenges in Healthcare, Climate Tech, FinTech, and Smart Campus automation.

Mentorship will be provided by senior engineers from leading tech companies. Food, snacks, drinks, and high-speed infrastructure are provided throughout the event.`,
    category_index: 1, // Hackathons
    venue_index: 2,    // Turing Lab
    organizer_index: 1, // Prof. Ananya Iyer
    start_time: addDays(7, 9),
    end_time: addDays(8, 21),
    registration_deadline: addDays(5, 23),
    max_capacity: 100,
    status: 'published',
    is_featured: true,
    banner_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Basic knowledge of any programming language. Teams of 2 to 4 members. Bring your own laptops and chargers.',
    schedule_agenda: [
      { time: '09:00 AM', title: 'Registration & Team Check-in' },
      { time: '10:00 AM', title: 'Opening Ceremony & Problem Statement Release' },
      { time: '11:00 AM', title: 'Hacking Begins!' },
      { time: '08:00 PM', title: 'Mentorship Checkpoint & Dinner' },
      { time: '04:00 PM (Day 2)', title: 'Final Pitching & Judging Session' },
      { time: '07:00 PM (Day 2)', title: 'Awards & Closing Ceremony' }
    ],
    contact_email: 'hacknova@college.edu',
    contact_phone: '+91 98765 12345'
  },
  {
    title: 'Rhythm & Resonance 2026: Annual Cultural Gala',
    short_description: 'A vibrant evening of acoustic ensembles, fusion dance, drama performances, and celebrity musical night.',
    description: `Experience the grandest cultural celebration of the academic year! Rhythm & Resonance features electrifying live performances by our college music band, classical and hip-hop dance crews, theatrical plays, and special guest musical artists. Open to all students, faculty and alumni.`,
    category_index: 2, // Cultural
    venue_index: 3,    // Amphitheatre
    organizer_index: 2, // Vikram Malhotra
    start_time: addDays(12, 17),
    end_time: addDays(12, 22),
    registration_deadline: addDays(11, 18),
    max_capacity: 1200,
    status: 'published',
    is_featured: true,
    banner_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Valid College Student ID Card required at venue gate.',
    schedule_agenda: [
      { time: '05:00 PM', title: 'Gates Open & Red Carpet Welcome' },
      { time: '06:00 PM', title: 'Inter-College Dance Showcase' },
      { time: '07:30 PM', title: 'Theatrical Skit: Modern Crossroads' },
      { time: '08:45 PM', title: 'Headliner Band Live Concert' },
      { time: '10:00 PM', title: 'DJ Soundclash & Curfew' }
    ],
    contact_email: 'cultural.events@college.edu',
    contact_phone: '+91 98111 22334'
  },
  {
    title: 'Cloud-Native Full-Stack Architecture Masterclass',
    short_description: 'Hands-on practical workshop covering microservices, containerization with Docker, and automated CI/CD pipelines.',
    description: `Level up your software engineering skills with this intensive masterclass. Learn how modern distributed web applications are built, scaled, and deployed in production environments. Participants will containerize a full-stack React and Node.js application and deploy it live to the cloud.`,
    category_index: 3, // Workshops
    venue_index: 1,    // CV Raman Hall
    organizer_index: 1, // Prof. Ananya Iyer
    start_time: addDays(3, 14),
    end_time: addDays(3, 18),
    registration_deadline: addDays(2, 20),
    max_capacity: 80,
    status: 'published',
    is_featured: false,
    banner_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Familiarity with JavaScript and terminal basics. Laptop with Docker Desktop installed.',
    schedule_agenda: [
      { time: '02:00 PM', title: 'Microservices Fundamentals & REST Architecture' },
      { time: '03:15 PM', title: 'Docker Containers & Multi-stage Builds' },
      { time: '04:30 PM', title: 'Live Cloud Deployment & Q&A Session' }
    ],
    contact_email: 'workshops@college.edu',
    contact_phone: '+91 98765 12345'
  },
  {
    title: 'Inter-Department Futsal & Badminton Championship',
    short_description: 'Cheer on your department teams as they battle for the prestigious Chancellor Sports Trophy.',
    description: `The annual inter-department sporting showdown is back! Over three action-packed days, teams from CSE, ECE, Mechanical, Civil and IT will compete in fast-paced 5v5 Futsal and Singles/Doubles Badminton matches. Medals, certificates and trophies will be awarded to winners and runners-up.`,
    category_index: 5, // Sports
    venue_index: 4,    // Sports Arena
    organizer_index: 2, // Vikram Malhotra
    start_time: addDays(15, 8),
    end_time: addDays(17, 18),
    registration_deadline: addDays(13, 22),
    max_capacity: 400,
    status: 'published',
    is_featured: false,
    banner_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Appropriate athletic sportswear and non-marking indoor court shoes required.',
    schedule_agenda: [
      { time: '08:30 AM', title: 'Opening March Past & Oath Taking' },
      { time: '09:30 AM', title: 'Knockout Stages: Futsal & Badminton' },
      { time: '03:00 PM (Day 3)', title: 'Championship Finals' },
      { time: '05:00 PM (Day 3)', title: 'Podium Ceremony & Trophy Presentation' }
    ],
    contact_email: 'sports@college.edu',
    contact_phone: '+91 94567 89012'
  },
  {
    title: 'AI & Quantum Computing: The 2030 Horizon',
    short_description: 'Distinguished lecture by leading IBM & DeepMind scientists on quantum algorithms and neural architecture.',
    description: `Join us for an inspiring session delving into the intersection of quantum hardware and machine learning algorithms. Discover how quantum computing is poised to transform drug discovery, cryptography, and complex optimization problems. Includes an interactive 45-minute audience Q&A.`,
    category_index: 4, // Seminars
    venue_index: 0,    // Main Auditorium
    organizer_index: 1, // Prof. Ananya Iyer
    start_time: addDays(20, 10),
    end_time: addDays(20, 13),
    registration_deadline: addDays(18, 23),
    max_capacity: 600,
    status: 'published',
    is_featured: true,
    banner_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Open to all students, research scholars and faculty.',
    schedule_agenda: [
      { time: '10:00 AM', title: 'Welcome Address by Dean of Academics' },
      { time: '10:30 AM', title: 'Keynote: Quantum Frontiers' },
      { time: '12:00 PM', title: 'Fireside Chat & Open Audience Q&A' }
    ],
    contact_email: 'dean.academic@college.edu',
    contact_phone: '+91 98765 43210'
  },
  {
    title: 'Full-Stack Web Architecture & Cloud Bootcamp (Completed)',
    short_description: 'Completed comprehensive 3-day boot camp on modern JavaScript, relational databases, and secure APIs.',
    description: `This highly-rated event wrapped up successfully with over 50 student participants completing their capstone project. Attendees gained practical experience with Node.js, Express, MySQL relational design, and React state management.`,
    category_index: 3, // Workshops
    venue_index: 2,    // Turing Lab
    organizer_index: 1, // Prof. Ananya Iyer
    start_time: addDays(-7, 10),
    end_time: addDays(-5, 17),
    registration_deadline: addDays(-9, 23),
    max_capacity: 60,
    status: 'completed',
    is_featured: false,
    banner_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Laptop with Node.js and code editor.',
    schedule_agenda: [
      { time: 'Day 1', title: 'REST API Design & MySQL Schema Modeling' },
      { time: 'Day 2', title: 'React Frontend Architecture & Component Trees' },
      { time: 'Day 3', title: 'Capstone Project Evaluation & Certification' }
    ],
    contact_email: 'workshops@college.edu',
    contact_phone: '+91 98765 12345'
  },
  {
    title: 'NextGen Autonomous Drone Racing Expo',
    short_description: 'Proposed student robotics exhibition showcasing computer vision drones and obstacle navigation.',
    description: `A proposed campus tech exhibition where student engineering teams test their custom-built autonomous quadcopters on an obstacle course using OpenCV and LIDAR sensors.`,
    category_index: 0, // Technical
    venue_index: 5,    // Innovation Hub
    organizer_index: 1, // Prof. Ananya Iyer
    start_time: addDays(25, 11),
    end_time: addDays(25, 16),
    registration_deadline: addDays(22, 23),
    max_capacity: 150,
    status: 'pending_approval',
    is_featured: false,
    banner_image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    prerequisites: 'Safety goggles and team registration.',
    schedule_agenda: [
      { time: '11:00 AM', title: 'Safety Inspection' },
      { time: '01:00 PM', title: 'Time Trials' }
    ],
    contact_email: 'robotics@college.edu',
    contact_phone: '+91 98765 12345'
  }
];

module.exports = {
  users,
  categories,
  venues,
  events
};
