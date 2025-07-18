-- =============================================
-- NEW COMPREHENSIVE DATABASE SCHEMA CREATION
-- Creating new tables for multi-country support and AI training
-- =============================================

-- Institution Schema Tables
CREATE TABLE IF NOT EXISTS institution_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_discipline_id INTEGER REFERENCES academic_disciplines(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS degree_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accreditation_bodies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_id INTEGER REFERENCES countries(id) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    iso_code VARCHAR(3) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS states_provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    country_id INTEGER REFERENCES countries(id) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_province_id INTEGER REFERENCES states_provinces(id),
    country_id INTEGER REFERENCES countries(id) NOT NULL,
    population INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    institution_id INTEGER REFERENCES institutions(id) NOT NULL,
    degree_level_id INTEGER REFERENCES degree_levels(id) NOT NULL,
    discipline_id INTEGER REFERENCES academic_disciplines(id) NOT NULL,
    duration_years DECIMAL(3,1),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Course Schema Tables
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_delivery_modes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grading_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS new_courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    institution_id INTEGER REFERENCES institutions(id) NOT NULL,
    category_id INTEGER REFERENCES course_categories(id),
    delivery_mode_id INTEGER REFERENCES course_delivery_modes(id),
    credits DECIMAL(3,1),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Student Schema Tables
CREATE TABLE IF NOT EXISTS student_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_status_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_styles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    student_id VARCHAR(20) UNIQUE,
    nationality_id INTEGER REFERENCES countries(id),
    citizenship_id INTEGER REFERENCES countries(id),
    primary_language_id INTEGER REFERENCES languages(id),
    student_type_id INTEGER REFERENCES student_types(id),
    status_id INTEGER REFERENCES student_status_types(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    skill_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_fields (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_field_id INTEGER REFERENCES career_fields(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scholarship Schema Tables
CREATE TABLE IF NOT EXISTS scholarship_institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    country_id INTEGER REFERENCES countries(id) NOT NULL,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fields_of_study (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_field_id INTEGER REFERENCES fields_of_study(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scholarship_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirement_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS new_scholarships (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider_institution_id INTEGER REFERENCES scholarship_institutions(id) NOT NULL,
    education_level_id INTEGER REFERENCES education_levels(id),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3),
    deadline_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert sample data for reference tables
INSERT INTO institution_types (name, description) VALUES
('University', 'Four-year degree-granting institution'),
('College', 'Two or four-year educational institution'),
('Technical Institute', 'Vocational and technical education'),
('Community College', 'Two-year associate degree institution')
ON CONFLICT (name) DO NOTHING;

INSERT INTO degree_levels (name, level_order) VALUES
('Certificate', 1),
('Diploma', 2),
('Associate', 3),
('Bachelor', 4),
('Master', 5),
('Doctorate', 6)
ON CONFLICT (name) DO NOTHING;

INSERT INTO course_categories (name) VALUES
('Core Required'),
('Elective'),
('Prerequisite'),
('Capstone')
ON CONFLICT (name) DO NOTHING;

INSERT INTO student_types (name) VALUES
('Full-time'),
('Part-time'),
('Exchange'),
('International')
ON CONFLICT (name) DO NOTHING;

INSERT INTO education_levels (name, level_order) VALUES
('High School', 1),
('Undergraduate', 2),
('Graduate', 3),
('Postgraduate', 4)
ON CONFLICT (name) DO NOTHING;

COMMIT;