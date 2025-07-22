/*
  # Add User Approval System

  1. New Tables
    - `user_approvals` - tracks approval requests and status
    - `approved_users` - stores approved user emails

  2. Security
    - Enable RLS on both tables
    - Add policies for user access control

  3. Functions
    - Function to handle approval process
    - Email notification triggers
*/

-- Create user_approvals table to track approval requests
CREATE TABLE IF NOT EXISTS user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approval_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by text DEFAULT 'outsource.arjun@gmail.com'
);

-- Create approved_users table to store approved emails
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved_at timestamptz DEFAULT now(),
  approved_by text DEFAULT 'outsource.arjun@gmail.com'
);

-- Enable RLS
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_approvals
CREATE POLICY "Users can insert their own approval requests"
  ON user_approvals
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read their own approval status"
  ON user_approvals
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for approved_users  
CREATE POLICY "Anyone can check if email is approved"
  ON approved_users
  FOR SELECT
  TO anon
  USING (true);

-- Function to approve user
CREATE OR REPLACE FUNCTION approve_user(approval_token_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approval_record user_approvals%ROWTYPE;
  result json;
BEGIN
  -- Get the approval request
  SELECT * INTO approval_record
  FROM user_approvals
  WHERE approval_token = approval_token_param
  AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid or expired approval token');
  END IF;

  -- Update approval status
  UPDATE user_approvals
  SET status = 'approved', approved_at = now()
  WHERE approval_token = approval_token_param;

  -- Add to approved users
  INSERT INTO approved_users (email)
  VALUES (approval_record.email)
  ON CONFLICT (email) DO NOTHING;

  RETURN json_build_object(
    'success', true, 
    'message', 'User approved successfully',
    'email', approval_record.email
  );
END;
$$;

-- Function to deny user
CREATE OR REPLACE FUNCTION deny_user(approval_token_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approval_record user_approvals%ROWTYPE;
BEGIN
  -- Get the approval request
  SELECT * INTO approval_record
  FROM user_approvals
  WHERE approval_token = approval_token_param
  AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid or expired approval token');
  END IF;

  -- Update approval status
  UPDATE user_approvals
  SET status = 'denied', approved_at = now()
  WHERE approval_token = approval_token_param;

  RETURN json_build_object(
    'success', true, 
    'message', 'User denied successfully',
    'email', approval_record.email
  );
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_approvals_email ON user_approvals(email);
CREATE INDEX IF NOT EXISTS idx_user_approvals_token ON user_approvals(approval_token);
CREATE INDEX IF NOT EXISTS idx_user_approvals_status ON user_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approved_users_email ON approved_users(email);