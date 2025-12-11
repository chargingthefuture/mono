-- ========================================
-- CORE PLATFORM TABLES
-- ========================================

-- Session storage table - Required for authentication (OIDC/OAuth2)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- User storage table - Required for authentication (OIDC/OAuth2) with additional fields
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  quora_profile_url VARCHAR,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  pricing_tier DECIMAL(10, 2) NOT NULL DEFAULT '1.00',
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
  terms_accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pricing tiers table - tracks historical pricing levels
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  effective_date TIMESTAMP NOT NULL DEFAULT NOW(),
  is_current_tier BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payments table - manual payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  billing_month VARCHAR(7),
  yearly_start_month VARCHAR(7),
  yearly_end_month VARCHAR(7),
  notes TEXT,
  recorded_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin action logs table
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- SUPPORTMATCH APP TABLES
-- ========================================

-- SupportMatch user profiles
CREATE TABLE IF NOT EXISTS support_match_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  nickname VARCHAR(100),
  gender VARCHAR(50),
  gender_preference VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(100),
  timezone_preference VARCHAR(50) NOT NULL DEFAULT 'same_timezone',
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partnerships - accountability partner pairings
CREATE TABLE IF NOT EXISTS partnerships (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  user2_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messages - partnership communication
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id VARCHAR NOT NULL REFERENCES partnerships(id),
  sender_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Exclusions - user blocking system
CREATE TABLE IF NOT EXISTS exclusions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  excluded_user_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reports - safety and moderation system
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  reported_user_id VARCHAR NOT NULL REFERENCES support_match_profiles(user_id),
  partnership_id VARCHAR REFERENCES partnerships(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  resolution TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Announcements - platform communications (platform-wide announcements)
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_on_login BOOLEAN NOT NULL DEFAULT false,
  show_on_sign_in_page BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SupportMatch Announcements
CREATE TABLE IF NOT EXISTS supportmatch_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- LIGHTHOUSE APP TABLES
-- ========================================

-- LightHouse user profiles (seekers and hosts)
CREATE TABLE IF NOT EXISTS lighthouse_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  profile_type VARCHAR(20) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  phone_number VARCHAR(20),
  signal_url TEXT,
  housing_needs TEXT,
  move_in_date TIMESTAMP,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  desired_country VARCHAR(100),
  has_property BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LightHouse property listings
CREATE TABLE IF NOT EXISTS lighthouse_properties (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id VARCHAR NOT NULL REFERENCES lighthouse_profiles(id),
  property_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  zip_code VARCHAR(10) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  amenities TEXT[],
  house_rules TEXT,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2),
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  max_occupants INTEGER DEFAULT 1,
  photos TEXT[],
  airbnb_profile_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LightHouse matches (connections between seekers and properties)
CREATE TABLE IF NOT EXISTS lighthouse_matches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id VARCHAR NOT NULL REFERENCES lighthouse_profiles(id),
  property_id VARCHAR NOT NULL REFERENCES lighthouse_properties(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  proposed_move_in_date TIMESTAMP,
  actual_move_in_date TIMESTAMP,
  proposed_move_out_date TIMESTAMP,
  actual_move_out_date TIMESTAMP,
  seeker_message TEXT,
  host_response TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LightHouse Announcements
CREATE TABLE IF NOT EXISTS lighthouse_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- SOCKETRELAY APP TABLES
-- ========================================

-- SocketRelay Requests - Users post requests for items they need
CREATE TABLE IF NOT EXISTS socketrelay_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  description VARCHAR(140) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_public BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SocketRelay Fulfillments - When someone clicks "Fulfill" on a request
CREATE TABLE IF NOT EXISTS socketrelay_fulfillments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR NOT NULL REFERENCES socketrelay_requests(id),
  fulfiller_user_id VARCHAR NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  closed_by VARCHAR REFERENCES users(id),
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SocketRelay Messages - Chat messages between requester and fulfiller
CREATE TABLE IF NOT EXISTS socketrelay_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id VARCHAR NOT NULL REFERENCES socketrelay_fulfillments(id),
  sender_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SocketRelay Profiles - User profiles for SocketRelay app
CREATE TABLE IF NOT EXISTS socketrelay_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  display_name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SocketRelay Announcements
CREATE TABLE IF NOT EXISTS socketrelay_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- DIRECTORY APP TABLES
-- ========================================

-- Directory profiles - public skill-sharing directory
CREATE TABLE IF NOT EXISTS directory_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR UNIQUE REFERENCES users(id),
  description VARCHAR(140) NOT NULL,
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sectors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  job_titles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  signal_url TEXT,
  quora_url TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  nickname VARCHAR(100),
  first_name VARCHAR(100),
  display_name_type VARCHAR(20) NOT NULL DEFAULT 'first',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Directory Announcements
CREATE TABLE IF NOT EXISTS directory_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- SHARED SKILLS DATABASE (Used by Directory and Workforce Recruiter)
-- ========================================

-- Skills Sectors - Top level categorization
CREATE TABLE IF NOT EXISTS skills_sectors (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  estimated_workforce_share DECIMAL(5, 2),
  estimated_workforce_count INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Skills Job Titles - Second level, belongs to a sector
CREATE TABLE IF NOT EXISTS skills_job_titles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id VARCHAR NOT NULL REFERENCES skills_sectors(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Skills - Third level, belongs to a job title
CREATE TABLE IF NOT EXISTS skills_skills (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title_id VARCHAR NOT NULL REFERENCES skills_job_titles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Legacy: Directory Skills - kept for backward compatibility during migration
CREATE TABLE IF NOT EXISTS directory_skills (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- CHAT GROUPS APP TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS chat_groups (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  signal_url TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ChatGroups Announcements
CREATE TABLE IF NOT EXISTS chatgroups_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- TRUSTTRANSPORT APP TABLES
-- ========================================

-- TrustTransport driver profiles
CREATE TABLE IF NOT EXISTS trusttransport_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  display_name VARCHAR(100) NOT NULL,
  is_driver BOOLEAN NOT NULL DEFAULT false,
  is_rider BOOLEAN NOT NULL DEFAULT true,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  vehicle_color VARCHAR(50),
  license_plate VARCHAR(20),
  bio TEXT,
  phone_number VARCHAR(20),
  signal_url TEXT,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TrustTransport ride requests (standalone requests that drivers can claim)
CREATE TABLE IF NOT EXISTS trusttransport_ride_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id VARCHAR NOT NULL REFERENCES users(id),
  driver_id VARCHAR REFERENCES trusttransport_profiles(id),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_city VARCHAR(100) NOT NULL,
  pickup_state VARCHAR(100),
  dropoff_city VARCHAR(100) NOT NULL,
  dropoff_state VARCHAR(100),
  departure_date_time TIMESTAMP NOT NULL,
  requested_seats INTEGER NOT NULL DEFAULT 1,
  requested_car_type VARCHAR(50),
  requires_heat BOOLEAN NOT NULL DEFAULT false,
  requires_ac BOOLEAN NOT NULL DEFAULT false,
  requires_wheelchair_access BOOLEAN NOT NULL DEFAULT false,
  requires_child_seat BOOLEAN NOT NULL DEFAULT false,
  rider_message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  driver_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TrustTransport Announcements
CREATE TABLE IF NOT EXISTS trusttransport_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- PROFILE DELETION LOG TABLE
-- ========================================

-- Logs all profile deletions for auditing and analytics
CREATE TABLE IF NOT EXISTS profile_deletion_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  app_name VARCHAR(50) NOT NULL,
  deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- NPS (NET PROMOTER SCORE) SURVEY
-- ========================================

CREATE TABLE IF NOT EXISTS nps_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL,
  response_month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- MECHANICMATCH APP TABLES
-- ========================================

-- MechanicMatch Profiles (users can be both car owners and mechanics)
CREATE TABLE IF NOT EXISTS mechanicmatch_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR UNIQUE REFERENCES users(id),
  is_car_owner BOOLEAN NOT NULL DEFAULT false,
  is_mechanic BOOLEAN NOT NULL DEFAULT false,
  display_name VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  phone_number VARCHAR(20),
  signal_url TEXT,
  owner_bio TEXT,
  mechanic_bio TEXT,
  experience INTEGER,
  shop_location TEXT,
  is_mobile_mechanic BOOLEAN NOT NULL DEFAULT false,
  hourly_rate DECIMAL(10, 2),
  specialties TEXT,
  certifications TEXT,
  sample_jobs TEXT,
  portfolio_photos TEXT,
  response_time_hours INTEGER,
  total_jobs_completed INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2),
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vehicles owned by car owners
CREATE TABLE IF NOT EXISTS mechanicmatch_vehicles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Service requests posted by car owners
CREATE TABLE IF NOT EXISTS mechanicmatch_service_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  vehicle_id VARCHAR REFERENCES mechanicmatch_vehicles(id),
  symptoms TEXT NOT NULL,
  photos TEXT,
  video_url TEXT,
  estimated_location TEXT,
  request_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Jobs/Bookings (created when mechanic accepts a service request or when booked directly)
CREATE TABLE IF NOT EXISTS mechanicmatch_jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id VARCHAR REFERENCES mechanicmatch_service_requests(id),
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  mechanic_id VARCHAR NOT NULL REFERENCES mechanicmatch_profiles(id),
  vehicle_id VARCHAR REFERENCES mechanicmatch_vehicles(id),
  symptoms TEXT NOT NULL,
  photos TEXT,
  video_url TEXT,
  location TEXT,
  job_type VARCHAR(20) NOT NULL,
  scheduled_date_time TIMESTAMP,
  rate_per_minute DECIMAL(10, 2),
  minutes_used INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'requested',
  mechanic_notes TEXT,
  owner_notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mechanic availability schedule
CREATE TABLE IF NOT EXISTS mechanicmatch_availability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id VARCHAR NOT NULL REFERENCES mechanicmatch_profiles(id),
  day_of_week INTEGER NOT NULL,
  start_time VARCHAR(5),
  end_time VARCHAR(5),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews/ratings
CREATE TABLE IF NOT EXISTS mechanicmatch_reviews (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR REFERENCES mechanicmatch_jobs(id),
  reviewer_id VARCHAR NOT NULL REFERENCES users(id),
  reviewee_id VARCHAR NOT NULL REFERENCES mechanicmatch_profiles(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messages between car owners and mechanics
CREATE TABLE IF NOT EXISTS mechanicmatch_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR REFERENCES mechanicmatch_jobs(id),
  sender_id VARCHAR NOT NULL REFERENCES users(id),
  recipient_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- MechanicMatch Announcements
CREATE TABLE IF NOT EXISTS mechanicmatch_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- LOSTMAIL APP TABLES
-- ========================================

-- LostMail Incidents
CREATE TABLE IF NOT EXISTS lostmail_incidents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR(200) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reporter_phone VARCHAR(50),
  incident_type VARCHAR(50) NOT NULL,
  carrier VARCHAR(100),
  tracking_number VARCHAR(100) NOT NULL,
  expected_delivery_date TIMESTAMP NOT NULL,
  noticed_date TIMESTAMP,
  description TEXT NOT NULL,
  photos TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  consent BOOLEAN NOT NULL DEFAULT false,
  assigned_to VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LostMail Audit Trail
CREATE TABLE IF NOT EXISTS lostmail_audit_trail (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id VARCHAR NOT NULL REFERENCES lostmail_incidents(id),
  admin_name VARCHAR(200) NOT NULL,
  action VARCHAR(50) NOT NULL,
  note TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LostMail Announcements
CREATE TABLE IF NOT EXISTS lostmail_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- RESEARCH APP TABLES
-- ========================================

-- Research Items (questions/posts)
CREATE TABLE IF NOT EXISTS research_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR(300) NOT NULL,
  body_md TEXT NOT NULL,
  tags TEXT,
  attachments TEXT,
  deadline TIMESTAMP,
  is_public BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  accepted_answer_id VARCHAR,
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Answers
CREATE TABLE IF NOT EXISTS research_answers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  research_item_id VARCHAR NOT NULL REFERENCES research_items(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  body_md TEXT NOT NULL,
  links TEXT,
  attachments TEXT,
  confidence_score INTEGER,
  score INTEGER DEFAULT 0 NOT NULL,
  is_accepted BOOLEAN DEFAULT false NOT NULL,
  relevance_score NUMERIC(10, 6),
  verification_score NUMERIC(10, 6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Comments (nested one level)
CREATE TABLE IF NOT EXISTS research_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  research_item_id VARCHAR REFERENCES research_items(id),
  answer_id VARCHAR REFERENCES research_answers(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  body_md TEXT NOT NULL,
  parent_comment_id VARCHAR REFERENCES research_comments(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Votes
CREATE TABLE IF NOT EXISTS research_votes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  research_item_id VARCHAR REFERENCES research_items(id),
  answer_id VARCHAR REFERENCES research_answers(id),
  value INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link Provenance (for link verification)
CREATE TABLE IF NOT EXISTS research_link_provenances (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id VARCHAR NOT NULL REFERENCES research_answers(id),
  url VARCHAR(2048) NOT NULL,
  http_status INTEGER,
  title TEXT,
  snippet TEXT,
  domain VARCHAR(255),
  domain_score NUMERIC(5, 2),
  fetch_date TIMESTAMP DEFAULT NOW(),
  similarity_score NUMERIC(5, 4),
  is_supportive BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Bookmarks/Saves
CREATE TABLE IF NOT EXISTS research_bookmarks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  research_item_id VARCHAR NOT NULL REFERENCES research_items(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Follows
CREATE TABLE IF NOT EXISTS research_follows (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  followed_user_id VARCHAR REFERENCES users(id),
  research_item_id VARCHAR REFERENCES research_items(id),
  tag VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Research Reports (moderation)
CREATE TABLE IF NOT EXISTS research_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  research_item_id VARCHAR REFERENCES research_items(id),
  answer_id VARCHAR REFERENCES research_answers(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR REFERENCES users(id)
);

-- Research Announcements
CREATE TABLE IF NOT EXISTS research_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- GENTLEPULSE APP TABLES
-- ========================================

-- GentlePulse Meditations
CREATE TABLE IF NOT EXISTS gentlepulse_meditations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  thumbnail VARCHAR(500),
  wistia_url VARCHAR(500) NOT NULL,
  tags TEXT,
  duration INTEGER,
  play_count INTEGER DEFAULT 0 NOT NULL,
  average_rating DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0 NOT NULL,
  position INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GentlePulse Ratings (anonymous, using clientId)
CREATE TABLE IF NOT EXISTS gentlepulse_ratings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  meditation_id VARCHAR NOT NULL REFERENCES gentlepulse_meditations(id),
  client_id VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GentlePulse Mood Checks (anonymous, using clientId)
CREATE TABLE IF NOT EXISTS gentlepulse_mood_checks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100) NOT NULL,
  mood_value INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GentlePulse Favorites (clientId-based, no user accounts)
CREATE TABLE IF NOT EXISTS gentlepulse_favorites (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  meditation_id VARCHAR NOT NULL REFERENCES gentlepulse_meditations(id),
  client_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GentlePulse Announcements
CREATE TABLE IF NOT EXISTS gentlepulse_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- CHYME APP TABLES
-- ========================================

-- Chyme Profiles
CREATE TABLE IF NOT EXISTS chyme_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  display_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chyme Rooms
CREATE TABLE IF NOT EXISTS chyme_rooms (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  room_type VARCHAR(20) NOT NULL DEFAULT 'private',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chyme Room Participants
CREATE TABLE IF NOT EXISTS chyme_room_participants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL REFERENCES chyme_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_speaking BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  left_at TIMESTAMP
);

-- Chyme Messages
CREATE TABLE IF NOT EXISTS chyme_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL REFERENCES chyme_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chyme Survey Responses
CREATE TABLE IF NOT EXISTS chyme_survey_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR REFERENCES chyme_rooms(id) ON DELETE SET NULL,
  client_id VARCHAR(100) NOT NULL,
  found_valuable BOOLEAN NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chyme Announcements
CREATE TABLE IF NOT EXISTS chyme_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- WORKFORCE RECRUITER TRACKER APP TABLES
-- ========================================

-- Workforce Recruiter Tracker user profiles
CREATE TABLE IF NOT EXISTS workforce_recruiter_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
  display_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workforce Recruiter Tracker configuration
CREATE TABLE IF NOT EXISTS workforce_recruiter_config (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  population INTEGER NOT NULL DEFAULT 5000000,
  workforce_participation_rate DECIMAL(5, 4) NOT NULL DEFAULT '0.5',
  min_recruitable INTEGER NOT NULL DEFAULT 2000000,
  max_recruitable INTEGER NOT NULL DEFAULT 5000000,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Occupations - References shared skills database for data consistency
CREATE TABLE IF NOT EXISTS workforce_recruiter_occupations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sector VARCHAR(100) NOT NULL,
  occupation_title VARCHAR(200) NOT NULL,
  job_title_id VARCHAR REFERENCES skills_job_titles(id),
  headcount_target INTEGER NOT NULL,
  skill_level VARCHAR(20) NOT NULL,
  annual_training_target INTEGER NOT NULL,
  current_recruited INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Meetup Events - Admin creates in-person events for occupations
CREATE TABLE IF NOT EXISTS workforce_recruiter_meetup_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id VARCHAR NOT NULL REFERENCES workforce_recruiter_occupations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Meetup Event Signups - Users sign up to participate in meetup events
CREATE TABLE IF NOT EXISTS workforce_recruiter_meetup_event_signups (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL REFERENCES workforce_recruiter_meetup_events(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(200) NOT NULL,
  preferred_meetup_date DATE,
  availability TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  why_interested TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workforce Recruiter Tracker Announcements
CREATE TABLE IF NOT EXISTS workforce_recruiter_announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- DEFAULT ALIVE OR DEAD APP TABLES
-- ========================================

-- Financial Entries - Manual data entry for operating expenses, depreciation, amortization
CREATE TABLE IF NOT EXISTS default_alive_or_dead_financial_entries (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  operating_expenses NUMERIC(15, 2) NOT NULL,
  depreciation NUMERIC(15, 2) NOT NULL DEFAULT '0',
  amortization NUMERIC(15, 2) NOT NULL DEFAULT '0',
  depreciation_data JSONB,
  amortization_data JSONB,
  notes TEXT,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EBITDA Snapshots - Weekly calculated EBITDA values
CREATE TABLE IF NOT EXISTS default_alive_or_dead_ebitda_snapshots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL UNIQUE,
  revenue NUMERIC(15, 2) NOT NULL,
  operating_expenses NUMERIC(15, 2) NOT NULL,
  depreciation NUMERIC(15, 2) NOT NULL DEFAULT '0',
  amortization NUMERIC(15, 2) NOT NULL DEFAULT '0',
  ebitda NUMERIC(15, 2) NOT NULL,
  is_default_alive BOOLEAN NOT NULL DEFAULT false,
  projected_profitability_date DATE,
  projected_capital_needed NUMERIC(15, 2),
  current_funding NUMERIC(15, 2),
  growth_rate NUMERIC(10, 4),
  calculation_metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- ADD FOREIGN KEY CONSTRAINTS (after all tables are created)
-- ========================================

-- Add foreign key constraint for research_items.accepted_answer_id
-- (This was deferred because research_answers is created after research_items)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'research_items_accepted_answer_id_fkey'
  ) THEN
    ALTER TABLE research_items 
    ADD CONSTRAINT research_items_accepted_answer_id_fkey 
    FOREIGN KEY (accepted_answer_id) REFERENCES research_answers(id);
  END IF;
END $$;
