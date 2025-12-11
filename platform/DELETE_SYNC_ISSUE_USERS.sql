-- ========================================
-- DELETE SYNC ISSUE USERS - PRODUCTION DATABASE
-- ========================================
-- 
-- This script completely deletes two users and all their related data
-- from the production database. No anonymization - complete deletion.
--
-- Users to delete:
-- 1. 49006997
-- 2. 48981890
--
-- WARNING: This is a destructive operation. Run in a transaction first
-- to verify, then commit if everything looks correct.
--
-- NOTE: This script is synchronized with schema.sql. When schema.sql is updated,
-- this script should be updated to match the foreign key relationships.
--
-- ========================================
-- BEGIN TRANSACTION (uncomment to use)
-- ========================================
-- BEGIN;

-- ========================================
-- USER 1: 49006997
-- ========================================

-- Payments (user_id and recorded_by both reference users.id directly)
DELETE FROM payments WHERE user_id = '49006997';
DELETE FROM payments WHERE recorded_by = '49006997';

-- Admin action logs (admin_id references users.id directly)
DELETE FROM admin_action_logs WHERE admin_id = '49006997';

-- SupportMatch - Delete related data first
-- Messages: sender_id references support_match_profiles.user_id (not profile id)
-- Must delete messages BEFORE deleting profiles (foreign key constraint)
DELETE FROM messages WHERE sender_id = '49006997'
OR partnership_id IN (
  SELECT id FROM partnerships WHERE user1_id = '49006997'
  OR user2_id = '49006997'
);
-- Delete partnerships before profiles (partnerships.user1_id and user2_id reference support_match_profiles.user_id)
DELETE FROM partnerships WHERE user1_id = '49006997';
DELETE FROM partnerships WHERE user2_id = '49006997';
-- Delete exclusions before profiles (exclusions reference support_match_profiles.user_id)
DELETE FROM exclusions WHERE user_id = '49006997';
DELETE FROM exclusions WHERE excluded_user_id = '49006997';
-- Delete reports before profiles (reports reference support_match_profiles.user_id)
DELETE FROM reports WHERE reporter_id = '49006997';
DELETE FROM reports WHERE reported_user_id = '49006997';
-- Finally delete the profile
DELETE FROM support_match_profiles WHERE user_id = '49006997';

-- LightHouse - Delete related data first
-- Matches: delete where user is seeker OR where property host is the user
DELETE FROM lighthouse_matches WHERE seeker_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = '49006997'
) OR property_id IN (
  SELECT id FROM lighthouse_properties WHERE host_id IN (
    SELECT id FROM lighthouse_profiles WHERE user_id = '49006997'
  )
);
DELETE FROM lighthouse_properties WHERE host_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = '49006997'
);
DELETE FROM lighthouse_profiles WHERE user_id = '49006997';

-- SocketRelay - All reference users.id directly (not through profiles)
-- Delete messages: where user is sender OR where message is in any fulfillment related to user
DELETE FROM socketrelay_messages WHERE sender_id = '49006997'
OR fulfillment_id IN (
  SELECT id FROM socketrelay_fulfillments WHERE fulfiller_user_id = '49006997'
  OR closed_by = '49006997'
  OR request_id IN (
    SELECT id FROM socketrelay_requests WHERE user_id = '49006997'
  )
);
-- Delete fulfillments: where user is fulfiller, where user closed it, OR where fulfillment is for user's requests
DELETE FROM socketrelay_fulfillments WHERE fulfiller_user_id = '49006997'
OR closed_by = '49006997'
OR request_id IN (
  SELECT id FROM socketrelay_requests WHERE user_id = '49006997'
);
-- Delete requests (references users.id directly)
DELETE FROM socketrelay_requests WHERE user_id = '49006997';
-- Finally delete the profile
DELETE FROM socketrelay_profiles WHERE user_id = '49006997';

-- Directory
DELETE FROM directory_profiles WHERE user_id = '49006997';

-- TrustTransport - rider_id references users.id directly (not through profiles)
DELETE FROM trusttransport_ride_requests WHERE rider_id = '49006997';
DELETE FROM trusttransport_profiles WHERE user_id = '49006997';

-- MechanicMatch - All owner_id, reviewer_id, sender_id, recipient_id reference users.id directly
-- Delete messages first
DELETE FROM mechanicmatch_messages WHERE sender_id = '49006997';
DELETE FROM mechanicmatch_messages WHERE recipient_id = '49006997';
-- Delete reviews (reviewer_id references users.id directly)
DELETE FROM mechanicmatch_reviews WHERE reviewer_id = '49006997';
-- Delete jobs (owner_id references users.id directly)
DELETE FROM mechanicmatch_jobs WHERE owner_id = '49006997';
-- Delete service requests (owner_id references users.id directly)
DELETE FROM mechanicmatch_service_requests WHERE owner_id = '49006997';
-- Delete vehicles (owner_id references users.id directly)
DELETE FROM mechanicmatch_vehicles WHERE owner_id = '49006997';
-- Finally delete the profile
DELETE FROM mechanicmatch_profiles WHERE user_id = '49006997';

-- NPS Responses (user_id references users.id directly)
DELETE FROM nps_responses WHERE user_id = '49006997';

-- Research - Delete related data first
-- Reports: user_id references users.id directly, reviewed_by references users.id directly
DELETE FROM research_reports WHERE user_id = '49006997';
DELETE FROM research_reports WHERE reviewed_by = '49006997';
-- Follows: user_id and followed_user_id both reference users.id directly
DELETE FROM research_follows WHERE user_id = '49006997';
DELETE FROM research_follows WHERE followed_user_id = '49006997';
-- Bookmarks, votes, comments, answers, items: all user_id reference users.id directly
DELETE FROM research_bookmarks WHERE user_id = '49006997';
DELETE FROM research_votes WHERE user_id = '49006997';
DELETE FROM research_comments WHERE user_id = '49006997';
-- Link provenances are linked through answers, so delete provenances from answers created by user OR answers on user's items
DELETE FROM research_link_provenances WHERE answer_id IN (
  SELECT id FROM research_answers WHERE user_id = '49006997'
  OR research_item_id IN (
    SELECT id FROM research_items WHERE user_id = '49006997'
  )
);
DELETE FROM research_answers WHERE user_id = '49006997';
DELETE FROM research_items WHERE user_id = '49006997';

-- GentlePulse
-- Note: GentlePulse tables use client_id (anonymous), not user_id, so no user-specific data to delete

-- Chyme - Delete related data first
-- Messages: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM chyme_messages WHERE user_id = '49006997';
-- Room participants: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM chyme_room_participants WHERE user_id = '49006997';
-- Rooms: created_by references users.id directly
DELETE FROM chyme_rooms WHERE created_by = '49006997';
-- Finally delete the profile
DELETE FROM chyme_profiles WHERE user_id = '49006997';

-- Workforce Recruiter - Delete related data first
-- Meetup event signups: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM workforce_recruiter_meetup_event_signups WHERE user_id = '49006997';
-- Meetup events: created_by references users.id directly
DELETE FROM workforce_recruiter_meetup_events WHERE created_by = '49006997';
-- Finally delete the profile
DELETE FROM workforce_recruiter_profiles WHERE user_id = '49006997';

-- Profile deletion logs (user_id references users.id directly)
DELETE FROM profile_deletion_logs WHERE user_id = '49006997';

-- Finally, delete the user
DELETE FROM users WHERE id = '49006997';

-- ========================================
-- USER 2: 48981890
-- ========================================

-- Payments (user_id and recorded_by both reference users.id directly)
DELETE FROM payments WHERE user_id = '48981890';
DELETE FROM payments WHERE recorded_by = '48981890';

-- Admin action logs (admin_id references users.id directly)
DELETE FROM admin_action_logs WHERE admin_id = '48981890';

-- SupportMatch - Delete related data first
-- Messages: sender_id references support_match_profiles.user_id (not profile id)
-- Must delete messages BEFORE deleting profiles (foreign key constraint)
DELETE FROM messages WHERE sender_id = '48981890'
OR partnership_id IN (
  SELECT id FROM partnerships WHERE user1_id = '48981890'
  OR user2_id = '48981890'
);
-- Delete partnerships before profiles (partnerships.user1_id and user2_id reference support_match_profiles.user_id)
DELETE FROM partnerships WHERE user1_id = '48981890';
DELETE FROM partnerships WHERE user2_id = '48981890';
-- Delete exclusions before profiles (exclusions reference support_match_profiles.user_id)
DELETE FROM exclusions WHERE user_id = '48981890';
DELETE FROM exclusions WHERE excluded_user_id = '48981890';
-- Delete reports before profiles (reports reference support_match_profiles.user_id)
DELETE FROM reports WHERE reporter_id = '48981890';
DELETE FROM reports WHERE reported_user_id = '48981890';
-- Finally delete the profile
DELETE FROM support_match_profiles WHERE user_id = '48981890';

-- LightHouse - Delete related data first
-- Matches: delete where user is seeker OR where property host is the user
DELETE FROM lighthouse_matches WHERE seeker_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = '48981890'
) OR property_id IN (
  SELECT id FROM lighthouse_properties WHERE host_id IN (
    SELECT id FROM lighthouse_profiles WHERE user_id = '48981890'
  )
);
DELETE FROM lighthouse_properties WHERE host_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = '48981890'
);
DELETE FROM lighthouse_profiles WHERE user_id = '48981890';

-- SocketRelay - All reference users.id directly (not through profiles)
-- Delete messages: where user is sender OR where message is in any fulfillment related to user
DELETE FROM socketrelay_messages WHERE sender_id = '48981890'
OR fulfillment_id IN (
  SELECT id FROM socketrelay_fulfillments WHERE fulfiller_user_id = '48981890'
  OR closed_by = '48981890'
  OR request_id IN (
    SELECT id FROM socketrelay_requests WHERE user_id = '48981890'
  )
);
-- Delete fulfillments: where user is fulfiller, where user closed it, OR where fulfillment is for user's requests
DELETE FROM socketrelay_fulfillments WHERE fulfiller_user_id = '48981890'
OR closed_by = '48981890'
OR request_id IN (
  SELECT id FROM socketrelay_requests WHERE user_id = '48981890'
);
-- Delete requests (references users.id directly)
DELETE FROM socketrelay_requests WHERE user_id = '48981890';
-- Finally delete the profile
DELETE FROM socketrelay_profiles WHERE user_id = '48981890';

-- Directory
DELETE FROM directory_profiles WHERE user_id = '48981890';

-- TrustTransport - rider_id references users.id directly (not through profiles)
DELETE FROM trusttransport_ride_requests WHERE rider_id = '48981890';
DELETE FROM trusttransport_profiles WHERE user_id = '48981890';

-- MechanicMatch - All owner_id, reviewer_id, sender_id, recipient_id reference users.id directly
-- Delete messages first
DELETE FROM mechanicmatch_messages WHERE sender_id = '48981890';
DELETE FROM mechanicmatch_messages WHERE recipient_id = '48981890';
-- Delete reviews (reviewer_id references users.id directly)
DELETE FROM mechanicmatch_reviews WHERE reviewer_id = '48981890';
-- Delete jobs (owner_id references users.id directly)
DELETE FROM mechanicmatch_jobs WHERE owner_id = '48981890';
-- Delete service requests (owner_id references users.id directly)
DELETE FROM mechanicmatch_service_requests WHERE owner_id = '48981890';
-- Delete vehicles (owner_id references users.id directly)
DELETE FROM mechanicmatch_vehicles WHERE owner_id = '48981890';
-- Finally delete the profile
DELETE FROM mechanicmatch_profiles WHERE user_id = '48981890';

-- NPS Responses (user_id references users.id directly)
DELETE FROM nps_responses WHERE user_id = '48981890';

-- Research - Delete related data first
-- Reports: user_id references users.id directly, reviewed_by references users.id directly
DELETE FROM research_reports WHERE user_id = '48981890';
DELETE FROM research_reports WHERE reviewed_by = '48981890';
-- Follows: user_id and followed_user_id both reference users.id directly
DELETE FROM research_follows WHERE user_id = '48981890';
DELETE FROM research_follows WHERE followed_user_id = '48981890';
-- Bookmarks, votes, comments, answers, items: all user_id reference users.id directly
DELETE FROM research_bookmarks WHERE user_id = '48981890';
DELETE FROM research_votes WHERE user_id = '48981890';
DELETE FROM research_comments WHERE user_id = '48981890';
-- Link provenances are linked through answers, so delete provenances from answers created by user OR answers on user's items
DELETE FROM research_link_provenances WHERE answer_id IN (
  SELECT id FROM research_answers WHERE user_id = '48981890'
  OR research_item_id IN (
    SELECT id FROM research_items WHERE user_id = '48981890'
  )
);
DELETE FROM research_answers WHERE user_id = '48981890';
DELETE FROM research_items WHERE user_id = '48981890';

-- GentlePulse
-- Note: GentlePulse tables use client_id (anonymous), not user_id, so no user-specific data to delete

-- Chyme - Delete related data first
-- Messages: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM chyme_messages WHERE user_id = '48981890';
-- Room participants: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM chyme_room_participants WHERE user_id = '48981890';
-- Rooms: created_by references users.id directly
DELETE FROM chyme_rooms WHERE created_by = '48981890';
-- Finally delete the profile
DELETE FROM chyme_profiles WHERE user_id = '48981890';

-- Workforce Recruiter - Delete related data first
-- Meetup event signups: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM workforce_recruiter_meetup_event_signups WHERE user_id = '48981890';
-- Meetup events: created_by references users.id directly
DELETE FROM workforce_recruiter_meetup_events WHERE created_by = '48981890';
-- Finally delete the profile
DELETE FROM workforce_recruiter_profiles WHERE user_id = '48981890';

-- Default Alive or Dead financial entries (created_by references users.id)
DELETE FROM default_alive_or_dead_financial_entries WHERE created_by = '49006997';
DELETE FROM default_alive_or_dead_financial_entries WHERE created_by = '48981890';

-- Profile deletion logs (user_id references users.id directly)
DELETE FROM profile_deletion_logs WHERE user_id = '48981890';

-- Finally, delete the user
DELETE FROM users WHERE id = '48981890';

-- ========================================
-- COMMIT TRANSACTION (uncomment to commit)
-- ========================================
COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these after deletion to verify:

-- Check if users are deleted
-- SELECT id, email FROM users WHERE id IN ('49006997', '48981890');

-- Check for any remaining references (should return 0 rows)
-- SELECT 'payments' as table_name, COUNT(*) as count FROM payments WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'admin_action_logs', COUNT(*) FROM admin_action_logs WHERE admin_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'support_match_profiles', COUNT(*) FROM support_match_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'lighthouse_profiles', COUNT(*) FROM lighthouse_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'socketrelay_profiles', COUNT(*) FROM socketrelay_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'directory_profiles', COUNT(*) FROM directory_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'trusttransport_profiles', COUNT(*) FROM trusttransport_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'mechanicmatch_profiles', COUNT(*) FROM mechanicmatch_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'chyme_profiles', COUNT(*) FROM chyme_profiles WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'chyme_rooms', COUNT(*) FROM chyme_rooms WHERE created_by IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'chyme_room_participants', COUNT(*) FROM chyme_room_participants WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'chyme_messages', COUNT(*) FROM chyme_messages WHERE user_id IN ('49006997', '48981890')
-- UNION ALL
-- SELECT 'nps_responses', COUNT(*) FROM nps_responses WHERE user_id IN ('49006997', '48981890');

