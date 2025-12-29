-- Migration: 055_add_user_roles_helpers
-- Description: Adds helper functions and views for dual-role user management
-- Makes it easier to query user roles and ensure proper dual-role signup
-- Created: 2025-12-28

-- View to see all user roles at a glance
CREATE OR REPLACE VIEW user_roles AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    u.email_verified,
    CASE
        WHEN sp.user_id IS NOT NULL THEN true
        ELSE false
    END as is_student,
    CASE
        WHEN ip.user_id IS NOT NULL THEN true
        ELSE false
    END as is_instructor,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN instructor_profiles ip ON u.id = ip.user_id;

-- Function to check if email exists
CREATE OR REPLACE FUNCTION user_exists_by_email(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    has_student_profile BOOLEAN,
    has_instructor_profile BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        EXISTS(SELECT 1 FROM student_profiles sp WHERE sp.user_id = u.id),
        EXISTS(SELECT 1 FROM instructor_profiles ip WHERE ip.user_id = u.id)
    FROM users u
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
RETURNS TABLE(
    is_student BOOLEAN,
    is_instructor BOOLEAN,
    student_profile_exists BOOLEAN,
    instructor_profile_exists BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        EXISTS(SELECT 1 FROM student_profiles sp WHERE sp.user_id = get_user_roles.user_id),
        EXISTS(SELECT 1 FROM instructor_profiles ip WHERE ip.user_id = get_user_roles.user_id),
        EXISTS(SELECT 1 FROM student_profiles sp WHERE sp.user_id = get_user_roles.user_id),
        EXISTS(SELECT 1 FROM instructor_profiles ip WHERE ip.user_id = get_user_roles.user_id);
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure at least one profile exists
-- This ensures users always have either student or instructor profile (or both)
CREATE OR REPLACE FUNCTION check_user_has_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for existing users (not during initial insert)
    IF (TG_OP = 'DELETE') THEN
        -- If deleting the last profile, prevent it
        IF NOT EXISTS (
            SELECT 1 FROM student_profiles WHERE user_id = OLD.user_id
            UNION
            SELECT 1 FROM instructor_profiles WHERE user_id = OLD.user_id
        ) THEN
            RAISE EXCEPTION 'Cannot delete last profile - user must have at least one role';
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add triggers to enforce at least one profile exists
-- This prevents accidentally deleting the last profile from a user
DROP TRIGGER IF EXISTS ensure_student_profile_not_last ON student_profiles;
CREATE TRIGGER ensure_student_profile_not_last
    BEFORE DELETE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_user_has_profile();

DROP TRIGGER IF EXISTS ensure_instructor_profile_not_last ON instructor_profiles;
CREATE TRIGGER ensure_instructor_profile_not_last
    BEFORE DELETE ON instructor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_user_has_profile();

-- Comments
COMMENT ON VIEW user_roles IS 'View showing all users with their roles (student/instructor/both)';
COMMENT ON FUNCTION user_exists_by_email IS 'Check if email exists and return user_id with role flags';
COMMENT ON FUNCTION get_user_roles IS 'Get role flags for a specific user';
COMMENT ON FUNCTION check_user_has_profile IS 'Ensures users always have at least one profile (student or instructor)';

-- Example usage documentation
COMMENT ON VIEW user_roles IS
'View showing all users with their roles. Example queries:
-- Find all dual-role users (both student and instructor):
SELECT * FROM user_roles WHERE is_student AND is_instructor;

-- Find users with only student role:
SELECT * FROM user_roles WHERE is_student AND NOT is_instructor;

-- Find users with only instructor role:
SELECT * FROM user_roles WHERE is_instructor AND NOT is_student;';

COMMENT ON FUNCTION user_exists_by_email IS
'Check if email exists before signup. Example usage in application:
1. User tries to sign up as instructor with email "john@example.com"
2. Call: SELECT * FROM user_exists_by_email(''john@example.com'')
3. If returns row: User exists, check has_instructor_profile
   - If false: Create instructor_profiles row for existing user_id
   - If true: Error - already registered as instructor
4. If no row: Create new users + instructor_profiles';
