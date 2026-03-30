-- Create missing tables for MVP

-- Temple Events
CREATE TABLE IF NOT EXISTS temple_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temple_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    signup_end_at DATETIME NOT NULL,
    capacity INT NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    cover_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_temple_id (temple_id),
    INDEX idx_start_at (start_at),
    INDEX idx_signup_end_at (signup_end_at),
    INDEX idx_status (status),
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'registered' NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    canceled_at DATETIME,
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_registered_at (registered_at),
    FOREIGN KEY (event_id) REFERENCES temple_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lamp Types
CREATE TABLE IF NOT EXISTS lamp_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temple_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_temple_id (temple_id),
    INDEX idx_status (status),
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lamp Applications
CREATE TABLE IF NOT EXISTS lamp_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lamp_type_id INT NOT NULL,
    user_id INT,
    temple_id INT NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    blessing_target VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lamp_type_id (lamp_type_id),
    INDEX idx_user_id (user_id),
    INDEX idx_temple_id (temple_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    FOREIGN KEY (lamp_type_id) REFERENCES lamp_types(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Devotees (信眾名單)
CREATE TABLE IF NOT EXISTS devotees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temple_id INT NOT NULL,
    public_user_id INT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    address TEXT,
    notes TEXT,
    total_donations DECIMAL(10, 2) DEFAULT 0,
    visit_count INT DEFAULT 0,
    last_visit_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_temple_id (temple_id),
    INDEX idx_public_user_id (public_user_id),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (public_user_id) REFERENCES public_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Finance Records
CREATE TABLE IF NOT EXISTS finance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temple_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id INT,
    recorded_at DATETIME NOT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_temple_id (temple_id),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_reference (reference_type, reference_id),
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES temple_admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
