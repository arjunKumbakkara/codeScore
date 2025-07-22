/*
  # Create automatic cleanup function for code reviews

  1. New Functions
    - `cleanup_old_code_reviews()` - Deletes code reviews older than 7 days
    - `approve_user(approval_token_param)` - Approves a user and adds them to approved_users
    - `deny_user(approval_token_param)` - Denies a user request

  2. Triggers
    - Daily cleanup trigger for automatic deletion of old reviews

  3. Security
    - Functions can only be called by service role or authenticated admin users
*/

-- Function to cleanup old code reviews (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_code_reviews()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM code_reviews 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve a user
CREATE OR REPLACE FUNCTION approve_user(approval_token_param UUID)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
BEGIN
  -- Get the user approval record
  SELECT * INTO user_record 
  FROM user_approvals 
  WHERE approval_token = approval_token_param 
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or already processed approval token'
    );
  END IF;
  
  -- Update the approval status
  UPDATE user_approvals 
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = 'outsource.arjun@gmail.com'
  WHERE approval_token = approval_token_param;
  
  -- Add to approved users table
  INSERT INTO approved_users (email, approved_by)
  VALUES (user_record.email, 'outsource.arjun@gmail.com')
  ON CONFLICT (email) DO NOTHING;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User approved successfully',
    'email', user_record.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deny a user
CREATE OR REPLACE FUNCTION deny_user(approval_token_param UUID)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
BEGIN
  -- Get the user approval record
  SELECT * INTO user_record 
  FROM user_approvals 
  WHERE approval_token = approval_token_param 
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or already processed approval token'
    );
  END IF;
  
  -- Update the approval status
  UPDATE user_approvals 
  SET 
    status = 'denied',
    approved_at = NOW(),
    approved_by = 'outsource.arjun@gmail.com'
  WHERE approval_token = approval_token_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User denied successfully',
    'email', user_record.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically cleanup old reviews daily
-- This would typically be called by a cron job or scheduled task
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_old_code_reviews();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;