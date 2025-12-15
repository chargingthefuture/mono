-- ========================================
-- DELETE SYNC ISSUE USERS - PRODUCTION DATABASE
-- ========================================
-- This script completely deletes two users and all their related data
-- from the production database. **No anonymization** - this is an
-- emergency force-delete for users that should never have existed.
--
-- USAGE (psql variables):
--   \set USER_ID_1 '49006997'
--   \set USER_ID_2 '48981890'
--   \i platform/DELETE_SYNC_ISSUE_USERS.sql
--
-- Or via CLI:
--   psql "postgres://..." -v USER_ID_1=49006997 -v USER_ID_2=48981890 -f platform/DELETE_SYNC_ISSUE_USERS.sql
--
-- Users to delete (set via USER_ID_1 and USER_ID_2 above):
-- 1. :USER_ID_1
-- 2. :USER_ID_2
--
-- WARNING: This is a destructive operation. Run in a transaction first
-- to verify, then commit if everything looks correct.
--
-- NOTE: This script is synchronized with schema.sql and platform/shared/schema.ts.
-- When either schema.sql or schema.ts is updated, this script MUST be updated
-- to match all foreign key relationships so it can still successfully force-delete.
--
-- ========================================
-- BEGIN TRANSACTION (uncomment to use)
-- ========================================
-- BEGIN;

-- ========================================
-- USER 1: :USER_ID_1
-- ========================================

-- Payments (user_id and recorded_by both reference users.id directly)
DELETE FROM payments WHERE user_id = :USER_ID_1;
DELETE FROM payments WHERE recorded_by = :USER_ID_1;

-- Admin action logs (admin_id references users.id directly)
DELETE FROM admin_action_logs WHERE admin_id = :USER_ID_1;

-- SupportMatch - Delete related data first
-- Messages: sender_id references support_match_profiles.user_id (not profile id)
-- Must delete messages BEFORE deleting profiles (foreign key constraint)
DELETE FROM messages WHERE sender_id = :USER_ID_1
OR partnership_id IN (
  SELECT id FROM partnerships WHERE user1_id = :USER_ID_1
  OR user2_id = :USER_ID_1
);
-- Delete partnerships before profiles (partnerships.user1_id and user2_id reference support_match_profiles.user_id)
DELETE FROM partnerships WHERE user1_id = :USER_ID_1;
DELETE FROM partnerships WHERE user2_id = :USER_ID_1;
-- Delete exclusions before profiles (exclusions reference support_match_profiles.user_id)
DELETE FROM exclusions WHERE user_id = :USER_ID_1;
DELETE FROM exclusions WHERE excluded_user_id = :USER_ID_1;
-- Delete reports before profiles (reports reference support_match_profiles.user_id)
DELETE FROM reports WHERE reporter_id = :USER_ID_1;
DELETE FROM reports WHERE reported_user_id = :USER_ID_1;
-- Finally delete the profile
DELETE FROM support_match_profiles WHERE user_id = :USER_ID_1;

-- LightHouse - Delete related data first
-- Matches: delete where user is seeker OR where property host is the user
DELETE FROM lighthouse_matches WHERE seeker_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_1
) OR property_id IN (
  SELECT id FROM lighthouse_properties WHERE host_id IN (
    SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_1
  )
);
DELETE FROM lighthouse_properties WHERE host_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_1
);
DELETE FROM lighthouse_profiles WHERE user_id = :USER_ID_1;

-- SocketRelay - All reference users.id directly (not through profiles)
-- Delete messages: where user is sender OR where message is in any fulfillment related to user
DELETE FROM socketrelay_messages WHERE sender_id = :USER_ID_1
OR fulfillment_id IN (
  SELECT id FROM socketrelay_fulfillments WHERE fulfiller_user_id = :USER_ID_1
  OR closed_by = :USER_ID_1
  OR request_id IN (
    SELECT id FROM socketrelay_requests WHERE user_id = :USER_ID_1
  )
);
-- Delete fulfillments: where user is fulfiller, where user closed it, OR where fulfillment is for user's requests
DELETE FROM socketrelay_fulfillments WHERE fulfiller_user_id = :USER_ID_1
OR closed_by = :USER_ID_1
OR request_id IN (
  SELECT id FROM socketrelay_requests WHERE user_id = :USER_ID_1
);
-- Delete requests (references users.id directly)
DELETE FROM socketrelay_requests WHERE user_id = :USER_ID_1;
-- Finally delete the profile
DELETE FROM socketrelay_profiles WHERE user_id = :USER_ID_1;

-- Directory
DELETE FROM directory_profiles WHERE user_id = :USER_ID_1;

-- TrustTransport - rider_id references users.id directly (not through profiles)
DELETE FROM trusttransport_ride_requests WHERE rider_id = :USER_ID_1;
DELETE FROM trusttransport_profiles WHERE user_id = :USER_ID_1;

-- MechanicMatch - All owner_id, reviewer_id, sender_id, recipient_id reference users.id directly
-- Delete messages first
DELETE FROM mechanicmatch_messages WHERE sender_id = :USER_ID_1;
DELETE FROM mechanicmatch_messages WHERE recipient_id = :USER_ID_1;
-- Delete reviews (reviewer_id references users.id directly)
DELETE FROM mechanicmatch_reviews WHERE reviewer_id = :USER_ID_1;
-- Delete reviews where this user's mechanic profile was reviewed (reviewee_id references mechanicmatch_profiles.id)
DELETE FROM mechanicmatch_reviews WHERE reviewee_id IN (
  SELECT id FROM mechanicmatch_profiles WHERE user_id = :USER_ID_1
);
-- Delete jobs where this user is the car owner (owner_id references users.id directly)
DELETE FROM mechanicmatch_jobs WHERE owner_id = :USER_ID_1;
-- Delete jobs where this user is the mechanic (mechanic_id references mechanicmatch_profiles.id)
DELETE FROM mechanicmatch_jobs WHERE mechanic_id IN (
  SELECT id FROM mechanicmatch_profiles WHERE user_id = :USER_ID_1
);
-- Delete service requests (owner_id references users.id directly)
DELETE FROM mechanicmatch_service_requests WHERE owner_id = :USER_ID_1;
-- Delete vehicles (owner_id references users.id directly)
DELETE FROM mechanicmatch_vehicles WHERE owner_id = :USER_ID_1;
-- Finally delete the profile
DELETE FROM mechanicmatch_profiles WHERE user_id = :USER_ID_1;

-- NPS Responses (user_id references users.id directly)
DELETE FROM nps_responses WHERE user_id = :USER_ID_1;

-- Research - Delete related data first
-- Reports: user_id references users.id directly, reviewed_by references users.id directly
DELETE FROM research_reports WHERE user_id = :USER_ID_1;
DELETE FROM research_reports WHERE reviewed_by = :USER_ID_1;
-- Follows: user_id and followed_user_id both reference users.id directly
DELETE FROM research_follows WHERE user_id = :USER_ID_1;
DELETE FROM research_follows WHERE followed_user_id = :USER_ID_1;
-- Bookmarks, votes, comments, answers, items: all user_id reference users.id directly
DELETE FROM research_bookmarks WHERE user_id = :USER_ID_1;
DELETE FROM research_votes WHERE user_id = :USER_ID_1;
DELETE FROM research_comments WHERE user_id = :USER_ID_1;
-- Link provenances are linked through answers, so delete provenances from answers created by user OR answers on user's items
DELETE FROM research_link_provenances WHERE answer_id IN (
  SELECT id FROM research_answers WHERE user_id = :USER_ID_1
  OR research_item_id IN (
    SELECT id FROM research_items WHERE user_id = :USER_ID_1
  )
);
DELETE FROM research_answers WHERE user_id = :USER_ID_1;
DELETE FROM research_items WHERE user_id = :USER_ID_1;

-- GentlePulse
-- Note: GentlePulse tables use a client-scoped identifier (client_id), not users.id,
-- so there is no account- or profile-linked user data to delete here.

-- Workforce Recruiter - Delete related data first
-- Meetup event signups: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM workforce_recruiter_meetup_event_signups WHERE user_id = :USER_ID_1;
-- Meetup events: created_by references users.id directly
DELETE FROM workforce_recruiter_meetup_events WHERE created_by = :USER_ID_1;
-- Finally delete the profile
DELETE FROM workforce_recruiter_profiles WHERE user_id = :USER_ID_1;

-- Profile deletion logs (user_id references users.id directly)
DELETE FROM profile_deletion_logs WHERE user_id = :USER_ID_1;

-- Finally, delete the user
DELETE FROM users WHERE id = :USER_ID_1;

-- ========================================
-- USER 2: :USER_ID_2
-- ========================================

-- Payments (user_id and recorded_by both reference users.id directly)
DELETE FROM payments WHERE user_id = :USER_ID_2;
DELETE FROM payments WHERE recorded_by = :USER_ID_2;

-- Admin action logs (admin_id references users.id directly)
DELETE FROM admin_action_logs WHERE admin_id = :USER_ID_2;

-- SupportMatch - Delete related data first
-- Messages: sender_id references support_match_profiles.user_id (not profile id)
-- Must delete messages BEFORE deleting profiles (foreign key constraint)
DELETE FROM messages WHERE sender_id = :USER_ID_2
OR partnership_id IN (
  SELECT id FROM partnerships WHERE user1_id = :USER_ID_2
  OR user2_id = :USER_ID_2
);
-- Delete partnerships before profiles (partnerships.user1_id and user2_id reference support_match_profiles.user_id)
DELETE FROM partnerships WHERE user1_id = :USER_ID_2;
DELETE FROM partnerships WHERE user2_id = :USER_ID_2;
-- Delete exclusions before profiles (exclusions reference support_match_profiles.user_id)
DELETE FROM exclusions WHERE user_id = :USER_ID_2;
DELETE FROM exclusions WHERE excluded_user_id = :USER_ID_2;
-- Delete reports before profiles (reports reference support_match_profiles.user_id)
DELETE FROM reports WHERE reporter_id = :USER_ID_2;
DELETE FROM reports WHERE reported_user_id = :USER_ID_2;
-- Finally delete the profile
DELETE FROM support_match_profiles WHERE user_id = :USER_ID_2;

-- LightHouse - Delete related data first
-- Matches: delete where user is seeker OR where property host is the user
DELETE FROM lighthouse_matches WHERE seeker_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_2
) OR property_id IN (
  SELECT id FROM lighthouse_properties WHERE host_id IN (
    SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_2
  )
);
DELETE FROM lighthouse_properties WHERE host_id IN (
  SELECT id FROM lighthouse_profiles WHERE user_id = :USER_ID_2
);
DELETE FROM lighthouse_profiles WHERE user_id = :USER_ID_2;

-- SocketRelay - All reference users.id directly (not through profiles)
-- Delete messages: where user is sender OR where message is in any fulfillment related to user
DELETE FROM socketrelay_messages WHERE sender_id = :USER_ID_2
OR fulfillment_id IN (
  SELECT id FROM socketrelay_fulfillments WHERE fulfiller_user_id = :USER_ID_2
  OR closed_by = :USER_ID_2
  OR request_id IN (
    SELECT id FROM socketrelay_requests WHERE user_id = :USER_ID_2
  )
);
-- Delete fulfillments: where user is fulfiller, where user closed it, OR where fulfillment is for user's requests
DELETE FROM socketrelay_fulfillments WHERE fulfiller_user_id = :USER_ID_2
OR closed_by = :USER_ID_2
OR request_id IN (
  SELECT id FROM socketrelay_requests WHERE user_id = :USER_ID_2
);
-- Delete requests (references users.id directly)
DELETE FROM socketrelay_requests WHERE user_id = :USER_ID_2;
-- Finally delete the profile
DELETE FROM socketrelay_profiles WHERE user_id = :USER_ID_2;

-- Directory
DELETE FROM directory_profiles WHERE user_id = :USER_ID_2;

-- TrustTransport - rider_id references users.id directly (not through profiles)
DELETE FROM trusttransport_ride_requests WHERE rider_id = :USER_ID_2;
DELETE FROM trusttransport_profiles WHERE user_id = :USER_ID_2;

-- MechanicMatch - All owner_id, reviewer_id, sender_id, recipient_id reference users.id directly
-- Delete messages first
DELETE FROM mechanicmatch_messages WHERE sender_id = :USER_ID_2;
DELETE FROM mechanicmatch_messages WHERE recipient_id = :USER_ID_2;
-- Delete reviews (reviewer_id references users.id directly)
DELETE FROM mechanicmatch_reviews WHERE reviewer_id = :USER_ID_2;
-- Delete reviews where this user's mechanic profile was reviewed (reviewee_id references mechanicmatch_profiles.id)
DELETE FROM mechanicmatch_reviews WHERE reviewee_id IN (
  SELECT id FROM mechanicmatch_profiles WHERE user_id = :USER_ID_2
);
-- Delete jobs where this user is the car owner (owner_id references users.id directly)
DELETE FROM mechanicmatch_jobs WHERE owner_id = :USER_ID_2;
-- Delete jobs where this user is the mechanic (mechanic_id references mechanicmatch_profiles.id)
DELETE FROM mechanicmatch_jobs WHERE mechanic_id IN (
  SELECT id FROM mechanicmatch_profiles WHERE user_id = :USER_ID_2
);
-- Delete service requests (owner_id references users.id directly)
DELETE FROM mechanicmatch_service_requests WHERE owner_id = :USER_ID_2;
-- Delete vehicles (owner_id references users.id directly)
DELETE FROM mechanicmatch_vehicles WHERE owner_id = :USER_ID_2;
-- Finally delete the profile
DELETE FROM mechanicmatch_profiles WHERE user_id = :USER_ID_2;

-- NPS Responses (user_id references users.id directly)
DELETE FROM nps_responses WHERE user_id = :USER_ID_2;

-- Research - Delete related data first
-- Reports: user_id references users.id directly, reviewed_by references users.id directly
DELETE FROM research_reports WHERE user_id = :USER_ID_2;
DELETE FROM research_reports WHERE reviewed_by = :USER_ID_2;
-- Follows: user_id and followed_user_id both reference users.id directly
DELETE FROM research_follows WHERE user_id = :USER_ID_2;
DELETE FROM research_follows WHERE followed_user_id = :USER_ID_2;
-- Bookmarks, votes, comments, answers, items: all user_id reference users.id directly
DELETE FROM research_bookmarks WHERE user_id = :USER_ID_2;
DELETE FROM research_votes WHERE user_id = :USER_ID_2;
DELETE FROM research_comments WHERE user_id = :USER_ID_2;
-- Link provenances are linked through answers, so delete provenances from answers created by user OR answers on user's items
DELETE FROM research_link_provenances WHERE answer_id IN (
  SELECT id FROM research_answers WHERE user_id = :USER_ID_2
  OR research_item_id IN (
    SELECT id FROM research_items WHERE user_id = :USER_ID_2
  )
);
DELETE FROM research_answers WHERE user_id = :USER_ID_2;
DELETE FROM research_items WHERE user_id = :USER_ID_2;

-- GentlePulse
-- Note: GentlePulse tables use a client-scoped identifier (client_id), not users.id,
-- so there is no account- or profile-linked user data to delete here.

-- Workforce Recruiter - Delete related data first
-- Meetup event signups: user_id references users.id directly (ON DELETE CASCADE, but explicit for clarity)
DELETE FROM workforce_recruiter_meetup_event_signups WHERE user_id = :USER_ID_2;
-- Meetup events: created_by references users.id directly
DELETE FROM workforce_recruiter_meetup_events WHERE created_by = :USER_ID_2;
-- Finally delete the profile
DELETE FROM workforce_recruiter_profiles WHERE user_id = :USER_ID_2;

-- Default Alive or Dead financial entries (created_by references users.id)
DELETE FROM default_alive_or_dead_financial_entries WHERE created_by = :USER_ID_1;
DELETE FROM default_alive_or_dead_financial_entries WHERE created_by = :USER_ID_2;

-- Profile deletion logs (user_id references users.id directly)
DELETE FROM profile_deletion_logs WHERE user_id = :USER_ID_2;

-- Finally, delete the user
DELETE FROM users WHERE id = :USER_ID_2;

-- ========================================
-- COMMIT TRANSACTION (uncomment to commit)
-- ========================================
COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these after deletion to verify:

-- Check if users are deleted
-- SELECT id, email FROM users WHERE id IN (:'USER_ID_1', :'USER_ID_2');

-- Check for any remaining references (should return 0 rows)
-- SELECT 'payments' as table_name, COUNT(*) as count FROM payments WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'admin_action_logs', COUNT(*) FROM admin_action_logs WHERE admin_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'support_match_profiles', COUNT(*) FROM support_match_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'lighthouse_profiles', COUNT(*) FROM lighthouse_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'socketrelay_profiles', COUNT(*) FROM socketrelay_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'directory_profiles', COUNT(*) FROM directory_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'trusttransport_profiles', COUNT(*) FROM trusttransport_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'mechanicmatch_profiles', COUNT(*) FROM mechanicmatch_profiles WHERE user_id IN (:'USER_ID_1', :'USER_ID_2')
-- UNION ALL
-- SELECT 'nps_responses', COUNT(*) FROM nps_responses WHERE user_id IN (:'USER_ID_1', :'USER_ID_2');

