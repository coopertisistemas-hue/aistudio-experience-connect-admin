-- Migration: Extract release_slot_capacity helper function
-- Extracts duplicated seat-release UPDATE logic into a shared helper
-- Idempotent via CREATE OR REPLACE FUNCTION

CREATE OR REPLACE FUNCTION release_slot_capacity(
  p_slot_id uuid,
  p_count int,
  p_from_held boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_from_held THEN
    UPDATE vehicle_slots
    SET held_seats = held_seats - p_count,
        remaining_seats = total_capacity - reserved_seats - (held_seats - p_count),
        status = CASE WHEN reserved_seats > 0 THEN 'reserved' ELSE 'available' END,
        lock_version = lock_version + 1
    WHERE id = p_slot_id;
  ELSE
    UPDATE vehicle_slots
    SET reserved_seats = reserved_seats - p_count,
        remaining_seats = total_capacity - (reserved_seats - p_count) - held_seats,
        status = CASE WHEN held_seats > 0 THEN 'held' ELSE 'available' END,
        lock_version = lock_version + 1
    WHERE id = p_slot_id;
  END IF;
END;
$$;
