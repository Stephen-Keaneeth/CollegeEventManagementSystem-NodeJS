-- =====================================================================
-- College Event Management System (CampusPulse)
-- Realistic Sample Seed Data for MySQL 8.0+ / MariaDB
-- Default password for all users is: Password123!
-- Hashed with bcrypt (cost factor 10): $2b$10$w8.B7HskX8z5aJ9R8Y.rEeaO/GkW26qf0X7kF9W0xG3kK5Q7y7m0a
-- =====================================================================

USE college_events;

-- Disable foreign key checks for clean re-seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE feedback;
TRUNCATE TABLE attendance;
TRUNCATE TABLE registrations;
TRUNCATE TABLE events;
TRUNCATE TABLE venues;
TRUNCATE TABLE categories;
TRUNCATE TABLE notifications;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Insert Users (Admin, Organizers, Students)
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password, role, department, roll_number, phone, bio, avatar_url, is_active) VALUES
(1, 'Dr. Ramesh Sharma', 'admin@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'admin', 'Administration & Academic Affairs', 'ADM-2020-01', '+91 98765 43210', 'Dean of Student Affairs and Campus Event Administrator.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 1),
(2, 'Prof. Ananya Iyer', 'organizer@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'organizer', 'Computer Science & Engineering', 'FAC-CS-042', '+91 98765 12345', 'Associate Professor & Faculty Coordinator for Tech Innovators Club.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 1),
(3, 'Vikram Malhotra', 'cultural.head@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'organizer', 'Student Activity Council', 'SAC-2022-09', '+91 98111 22334', 'President of Student Cultural Council and Arts Society.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 1),
(4, 'Aarav Patel', 'student@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'student', 'Computer Science & Engineering', 'CS21B042', '+91 91234 56789', '3rd Year CSE undergrad passionate about cloud computing and web development.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', 1),
(5, 'Priya Sharma', 'priya.sharma@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'student', 'Information Technology', 'IT22B118', '+91 98712 34567', '2nd Year IT student, AI enthusiast and competitive programmer.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 1),
(6, 'Rohit Verma', 'rohit.verma@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'student', 'Mechanical Engineering', 'ME21B007', '+91 94567 89012', 'Final year MechE student, Robotics Club team lead and sports coordinator.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 1),
(7, 'Sneha Reddy', 'sneha.reddy@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'student', 'Electronics & Communication', 'EC23B055', '+91 93456 78901', '1st Year ECE undergrad, classical dancer and debate team member.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 1),
(8, 'Karan Singh', 'karan.singh@college.edu', '$2b$10$4.Tkhc9cQ0Y0k9pT3iXJ9.OeV6b4qN6pT0aX7kF9W0xG3kK5Q7y7m', 'student', 'Computer Science & Engineering', 'CS22B089', '+91 92345 67890', 'Sophomore, open source contributor and gaming club captain.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', 1);

-- ---------------------------------------------------------------------
-- 2. Insert Categories
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, color, icon) VALUES
(1, 'Technical & Coding', 'technical-coding', 'Hackathons, algorithmic contests, code sprints and software exhibitions.', '#3B82F6', 'Code'),
(2, 'Hackathons & Challenges', 'hackathons-challenges', 'Multi-hour prototype building challenges, UI/UX sprints, and problem solving.', '#8B5CF6', 'Trophy'),
(3, 'Cultural & Arts', 'cultural-arts', 'Music nights, dance competitions, theatre, literature fests and fine arts.', '#EC4899', 'Music'),
(4, 'Workshops & Bootcamps', 'workshops-bootcamps', 'Interactive technical training, career guidance, and hands-on skill development.', '#10B981', 'Wrench'),
(5, 'Seminars & Keynotes', 'seminars-keynotes', 'Expert talks, industry leader panels, research symposiums and alumni dialogues.', '#F59E0B', 'Mic'),
(6, 'Sports & Athletics', 'sports-athletics', 'Inter-department leagues, badminton, basketball, football and indoor games.', '#EF4444', 'Activity');

-- ---------------------------------------------------------------------
-- 3. Insert Campus Venues
-- ---------------------------------------------------------------------
INSERT INTO venues (id, name, building, capacity, facilities, image_url, is_active) VALUES
(1, 'Main University Auditorium', 'Central Administrative Complex', 850, 'Laser 4K Projection, Dolby Atmos Surround Audio, 8 Stage Wireless Mics, Central HVAC', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Sir C.V. Raman Seminar Hall', 'Science & Engineering Tower, 3rd Floor', 250, 'Dual HD Screens, Podium Audio System, High-Speed Wi-Fi 6, Tiered Seating', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Alan Turing Advanced Computing Lab', 'CS & IT Wing, Block B', 120, '120 Dedicated High-Performance Workstations, Gigabit LAN, Gigabit Cloud Uplink, UPS Backup', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Open Air Amphitheatre', 'Central Campus Quadrangle', 1500, 'Acoustic Shell, Stadium Lighting, Professional Concert Truss, Open Canopy', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 1),
(5, 'Campus Sports Arena & Complex', 'Athletics & Recreation Center', 600, 'Indoor Wooden Courts, Electronic Scoreboard, Spectator Gallery, First Aid Bay', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 1),
(6, 'Dr. APJ Abdul Kalam Innovation Hub', 'Research & Incubation Center', 180, 'Flexible Modular Desks, Smart Whiteboards, 3D Printers, Presentation Pods', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 1);

-- ---------------------------------------------------------------------
-- 4. Insert Events
-- ---------------------------------------------------------------------
INSERT INTO events (id, title, short_description, description, category_id, venue_id, organizer_id, start_time, end_time, registration_deadline, max_capacity, current_registrations, status, is_featured, banner_image, prerequisites, schedule_agenda, contact_email, contact_phone) VALUES
(1, 'HackNova 2026: 36-Hour National College Hackathon', 'Build breakthrough generative AI, web3, and IoT solutions with industry mentors and $10,000 in prizes.', 'HackNova is our flagship annual student hackathon bringing together the brightest engineering minds across the country. Over 36 intensive hours, teams brainstorm, architect, code and pitch cutting-edge solutions to real-world challenges.', 2, 3, 2, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 100, 4, 'published', 1, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', 'Basic programming knowledge. Teams of 2 to 4. Bring laptops and chargers.', '[{"time":"09:00 AM","title":"Check-in & Kit Distribution"},{"time":"10:00 AM","title":"Opening Ceremony & Problem Statements"},{"time":"11:00 AM","title":"Hacking Begins!"}]', 'hacknova@college.edu', '+91 98765 12345'),
(2, 'Rhythm & Resonance 2026: Annual Cultural Gala', 'A vibrant evening of acoustic ensembles, fusion dance, drama performances, and celebrity musical night.', 'Experience the grandest cultural celebration of the academic year! Rhythm & Resonance features electrifying live performances by our college music band, classical and hip-hop dance crews, theatrical plays, and special guest musical artists.', 3, 4, 3, DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 11 DAY), 1200, 3, 'published', 1, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 'Valid College Student ID Card required at venue gate.', '[{"time":"05:00 PM","title":"Gates Open"},{"time":"06:00 PM","title":"Dance Showcase"},{"time":"08:45 PM","title":"Live Band Concert"}]', 'cultural.events@college.edu', '+91 98111 22334'),
(3, 'Cloud-Native Full-Stack Architecture Masterclass', 'Hands-on practical workshop covering microservices, containerization with Docker, and automated CI/CD pipelines.', 'Level up your software engineering skills with this intensive masterclass. Learn how modern distributed web applications are built, scaled, and deployed in production environments.', 4, 2, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 80, 0, 'published', 0, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', 'Familiarity with JavaScript and terminal basics. Laptop with Docker.', '[{"time":"02:00 PM","title":"Microservices Architecture"},{"time":"03:30 PM","title":"Docker Containers"}]', 'workshops@college.edu', '+91 98765 12345'),
(4, 'Inter-Department Futsal & Badminton Championship', 'Cheer on your department teams as they battle for the prestigious Chancellor Sports Trophy.', 'The annual inter-department sporting showdown is back! Over three action-packed days, teams from CSE, ECE, Mechanical, Civil and IT will compete in fast-paced 5v5 Futsal and Singles/Doubles Badminton matches.', 6, 5, 3, DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), DATE_ADD(NOW(), INTERVAL 13 DAY), 400, 0, 'published', 0, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 'Appropriate athletic sportswear and non-marking indoor court shoes required.', '[{"time":"09:00 AM","title":"Knockouts"},{"time":"03:00 PM","title":"Finals & Podium"}]', 'sports@college.edu', '+91 94567 89012'),
(5, 'AI & Quantum Computing: The 2030 Horizon', 'Distinguished lecture by leading IBM & DeepMind scientists on quantum algorithms and neural architecture.', 'Join us for an inspiring session delving into the intersection of quantum hardware and machine learning algorithms. Discover how quantum computing is poised to transform scientific discovery.', 5, 1, 2, DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 18 DAY), 600, 0, 'published', 1, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Open to all students, scholars and faculty.', '[{"time":"10:00 AM","title":"Keynote Lecture"},{"time":"11:30 AM","title":"Fireside Chat & Q&A"}]', 'dean.academic@college.edu', '+91 98765 43210'),
(6, 'Full-Stack Web Architecture & Cloud Bootcamp (Completed)', 'Completed comprehensive 3-day boot camp on modern JavaScript, relational databases, and secure APIs.', 'This highly-rated event wrapped up successfully with over 50 student participants completing their capstone project. Attendees gained practical experience with Node.js, Express, MySQL relational design, and React.', 4, 3, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 60, 5, 'completed', 0, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', 'Laptop with Node.js and code editor.', '[{"time":"Day 1","title":"REST APIs & MySQL"},{"time":"Day 2","title":"React Frontends"},{"time":"Day 3","title":"Capstone Evaluation"}]', 'workshops@college.edu', '+91 98765 12345'),
(7, 'NextGen Autonomous Drone Racing Expo', 'Proposed student robotics exhibition showcasing computer vision drones and obstacle navigation.', 'A proposed campus tech exhibition where student engineering teams test their custom-built autonomous quadcopters on an obstacle course.', 1, 6, 2, DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), 150, 0, 'pending_approval', 0, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80', 'Safety goggles and team registration.', '[{"time":"11:00 AM","title":"Safety Inspection"},{"time":"01:00 PM","title":"Time Trials"}]', 'robotics@college.edu', '+91 98765 12345');

-- ---------------------------------------------------------------------
-- 5. Insert Registrations
-- ---------------------------------------------------------------------
INSERT INTO registrations (id, event_id, user_id, ticket_code, status, registered_at) VALUES
(1, 1, 4, 'HN-A101-4821', 'registered', NOW()),
(2, 1, 5, 'HN-A102-3920', 'registered', NOW()),
(3, 1, 6, 'HN-A103-9182', 'registered', NOW()),
(4, 1, 7, 'HN-A104-5541', 'registered', NOW()),
(5, 2, 5, 'RR-B201-7712', 'registered', NOW()),
(6, 2, 6, 'RR-B202-8823', 'registered', NOW()),
(7, 2, 7, 'RR-B203-9934', 'registered', NOW()),
(8, 6, 4, 'BC-C301-1122', 'registered', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(9, 6, 5, 'BC-C302-2233', 'registered', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(10, 6, 6, 'BC-C303-3344', 'registered', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(11, 6, 7, 'BC-C304-4455', 'registered', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(12, 6, 8, 'BC-C305-5566', 'registered', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ---------------------------------------------------------------------
-- 6. Insert Attendance (for Completed Event #6)
-- ---------------------------------------------------------------------
INSERT INTO attendance (id, registration_id, event_id, user_id, status, marked_by, marked_at, notes) VALUES
(1, 8, 6, 4, 'present', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Active participation in capstone'),
(2, 9, 6, 5, 'present', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Completed deployment bonus'),
(3, 10, 6, 6, 'present', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Punctual attendance'),
(4, 11, 6, 7, 'absent', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Excused medical absence'),
(5, 12, 6, 8, 'present', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Project demo presented');

-- ---------------------------------------------------------------------
-- 7. Insert Feedback
-- ---------------------------------------------------------------------
INSERT INTO feedback (id, event_id, user_id, rating, review, created_at) VALUES
(1, 6, 4, 5, 'Exceptional hands-on workshop! Building and deploying the microservices architecture cleared so many conceptual doubts. The mentors were patient and knowledgeable.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 6, 5, 5, 'The best technical bootcamp of this semester. The real-world deployment pipeline demo was worth every minute. Looking forward to advanced part 2!', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 6, 6, 4, 'Very practical session with great lab environment. Could have used 30 more minutes on Docker networking, but overall highly recommended.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 6, 8, 5, 'Great pacing, clear explanations, and interactive live coding. Kudos to the faculty organizers!', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ---------------------------------------------------------------------
-- 8. Insert Notifications
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 4, 'Welcome to CampusPulse!', 'Explore upcoming college hackathons, technical bootcamps, and cultural festivals right from your dashboard.', 'info', 1, NOW()),
(2, 4, 'Registration Confirmed: HackNova 2026', 'Your registration for HackNova 2026 has been approved! View your digital ticket under My Events.', 'success', 0, NOW());
