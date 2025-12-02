-- Seed Database Script for COEEC Admin CMS

-- Insert demo users
INSERT INTO users (email, password_hash, name, role, department) VALUES
('admin@astu.edu.et', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Admin User', 'admin', 'Administration'),
('editor@astu.edu.et', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Editor User', 'editor', 'CSE'),
('coordinator@astu.edu.et', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Coordinator User', 'coordinator', 'EEE');

-- Insert departments
INSERT INTO departments (name, code, head, description, programs, research_areas, staff_count, email, phone) VALUES
('Computer Science and Engineering', 'CSE', 'Dr. Abebe Kebede', 'Leading department in software and computing', 
 ARRAY['BSc', 'MSc', 'PhD'], ARRAY['AI', 'Machine Learning', 'Cybersecurity'], 15, 'cse@astu.edu.et', '+251-XXX-XXXX'),
('Electrical and Electronics Engineering', 'EEE', 'Dr. Chaltu Gemechu', 'Excellence in electrical systems',
 ARRAY['BSc', 'MSc'], ARRAY['Power Systems', 'Electronics', 'Control Systems'], 18, 'eee@astu.edu.et', '+251-XXX-XXXX'),
('Information Technology', 'IT', 'Dr. Dawit Tesfaye', 'Modern IT solutions and networking',
 ARRAY['BSc', 'MSc'], ARRAY['Networking', 'Database Systems', 'Web Technologies'], 12, 'it@astu.edu.et', '+251-XXX-XXXX');

-- Insert sample staff
INSERT INTO staff (first_name, last_name, email, title, department, bio, research_areas, status) VALUES
('Abebe', 'Kebede', 'abebe.kebede@astu.edu.et', 'Professor', 'CSE', 
 'Expert in Artificial Intelligence with 20 years of experience', 
 ARRAY['AI', 'Machine Learning'], 'active'),
('Chaltu', 'Gemechu', 'chaltu.gemechu@astu.edu.et', 'Associate Professor', 'EEE',
 'Specializes in power systems and renewable energy',
 ARRAY['Power Systems', 'Renewable Energy'], 'active'),
('Dawit', 'Tesfaye', 'dawit.tesfaye@astu.edu.et', 'Assistant Professor', 'IT',
 'Database systems and web application development expert',
 ARRAY['Database Systems', 'Web Development'], 'active');

-- Insert homepage content
INSERT INTO content (type, title, subtitle, description, language, status, order_index) VALUES
('hero', 'SEEK WISDOM, ELEVATE YOUR INTELLECT', 'Excellence in Engineering Education',
 'COEEC provides an exceptional educational experience that prepares students for successful completion, employability, and job creation in the digital age.',
 'en', 'approved', 1),
('news', 'New AI Research Lab Opening', 'State-of-the-art facility',
 'We are excited to announce the opening of our new Artificial Intelligence research laboratory.',
 'en', 'approved', 2),
('event', 'Annual Tech Conference 2024', 'Innovation and Technology',
 'Join us for our annual technology conference featuring industry leaders and researchers.',
 'en', 'approved', 3);

-- Insert research projects
INSERT INTO research_projects (title, principal_investigator, description, status, start_date, end_date, funding_amount, funding_source, research_area) VALUES
('AI for Healthcare in Ethiopia', 'Dr. Abebe Kebede', 
 'Developing machine learning models for disease prediction and diagnosis in Ethiopian healthcare settings',
 'ongoing', '2023-01-01', '2025-12-31', 500000, 'Ministry of Science and Technology',
 ARRAY['AI', 'Healthcare', 'Machine Learning']),
('Smart Grid Systems', 'Dr. Chaltu Gemechu',
 'Research on intelligent power distribution systems for Ethiopian urban areas',
 'ongoing', '2023-06-01', '2025-05-31', 350000, 'Ethiopian Electric Power',
 ARRAY['Power Systems', 'Smart Grid']);

-- Insert sample publications
INSERT INTO publications (title, authors, type, venue, publication_date, keywords) VALUES
('Machine Learning Approaches for Ethiopian Healthcare', 
 ARRAY['Dr. Abebe Kebede', 'Dr. Jane Smith'],
 'Journal', 'Ethiopian Journal of Health Sciences', '2023-06-15',
 ARRAY['Machine Learning', 'Healthcare', 'Ethiopia']),
('Smart Grid Implementation in Developing Countries',
 ARRAY['Dr. Chaltu Gemechu', 'Dr. John Doe'],
 'Conference', 'IEEE Power Systems Conference', '2023-09-20',
 ARRAY['Smart Grid', 'Power Systems', 'Developing Countries']);

-- Insert download files
INSERT INTO downloads (title, description, category, file_url, file_size, file_type, uploaded_by) VALUES
('Admission Form 2024', 'Application form for new students', 'Forms', 
 '/downloads/admission-form-2024.pdf', 2048000, 'application/pdf', 1),
('Student Handbook', 'Complete guide for students', 'Guides',
 '/downloads/student-handbook.pdf', 5120000, 'application/pdf', 1);

-- Insert contact messages (for testing)
INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('John Doe', 'john.doe@example.com', 'Inquiry about admission',
 'I would like to know more about the admission requirements for the Computer Science program.',
 'new'),
('Jane Smith', 'jane.smith@example.com', 'Research collaboration',
 'I am interested in collaborating on AI research projects.',
 'new');
