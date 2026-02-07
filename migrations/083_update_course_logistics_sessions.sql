-- Adds new logistics fields for flexible scheduling (JSONB migration)
-- 1) If custom_sessions exists, copy it into sessions (new field)
-- 2) If total_hours is missing and legacy schedule is present, compute total_hours

-- Copy custom_sessions -> sessions when sessions is missing
UPDATE courses
SET course_data = jsonb_set(
  course_data,
  '{logistics,sessions}',
  COALESCE(
    course_data #> '{logistics,sessions}',
    course_data #> '{logistics,custom_sessions}',
    '[]'::jsonb
  ),
  true
)
WHERE course_data ? 'logistics'
  AND (course_data #> '{logistics,sessions}') IS NULL
  AND (course_data #> '{logistics,custom_sessions}') IS NOT NULL;

-- Backfill total_hours from legacy schedule when possible (weeks only)
UPDATE courses
SET course_data = jsonb_set(
  course_data,
  '{logistics,total_hours}',
  to_jsonb(
    (
      jsonb_array_length(COALESCE(course_data #> '{logistics,schedule,days_of_week}', '[]'::jsonb))
      * (course_data #>> '{logistics,duration,value}')::numeric
      * (course_data #>> '{logistics,session_duration_hours}')::numeric
    )
  ),
  true
)
WHERE course_data ? 'logistics'
  AND (course_data #>> '{logistics,total_hours}') IS NULL
  AND (course_data #>> '{logistics,duration,unit}') = 'weeks'
  AND (course_data #>> '{logistics,duration,value}') IS NOT NULL
  AND (course_data #>> '{logistics,session_duration_hours}') IS NOT NULL
  AND jsonb_array_length(COALESCE(course_data #> '{logistics,schedule,days_of_week}', '[]'::jsonb)) > 0;
