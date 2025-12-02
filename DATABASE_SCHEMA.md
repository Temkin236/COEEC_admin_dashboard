# Database Schema

## Users Table
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- admin, editor, coordinator
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Staff Table
\`\`\`sql
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  photo_url TEXT,
  title VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  office VARCHAR(100),
  bio TEXT,
  education TEXT,
  research_areas TEXT[], -- Array of research areas
  specialization VARCHAR(255),
  teaching_areas TEXT[],
  publications TEXT,
  research_projects TEXT,
  google_scholar_url TEXT,
  research_gate_url TEXT,
  orcid_id VARCHAR(50),
  cv_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Content Table
\`\`\`sql
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- homepage, about, departments, news
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  image_url TEXT,
  link TEXT,
  order_index INTEGER DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en', -- en, am, af
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, approved, rejected
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);
\`\`\`

## Research Projects Table
\`\`\`sql
CREATE TABLE research_projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  principal_investigator VARCHAR(255),
  co_investigators TEXT[],
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planned', -- planned, ongoing, completed
  funding_amount DECIMAL(15, 2),
  funding_source VARCHAR(255),
  research_area TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Publications Table
\`\`\`sql
CREATE TABLE publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  authors TEXT[] NOT NULL,
  type VARCHAR(100), -- Journal, Conference, Book, etc.
  venue VARCHAR(500),
  abstract TEXT,
  publication_date DATE,
  doi VARCHAR(255),
  url TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Downloads Table
\`\`\`sql
CREATE TABLE downloads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- Forms, Policies, Templates, etc.
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(50),
  download_count INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Contact Messages Table
\`\`\`sql
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new', -- new, read, responded, archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Activity Log Table
\`\`\`sql
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100), -- staff, content, research, etc.
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Departments Table (Optional)
\`\`\`sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  head VARCHAR(255),
  description TEXT,
  programs TEXT[],
  research_areas TEXT[],
  staff_count INTEGER DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Indexes
\`\`\`sql
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_language ON content(language);
CREATE INDEX idx_research_status ON research_projects(status);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
\`\`\`
