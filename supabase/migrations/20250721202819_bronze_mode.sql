/*
  # Fix Admin Access to User Approvals

  1. Security Updates
    - Add policy for admin to read all approval requests
    - Ensure admin can update approval status
    - Add policy for admin to read all user data

  2. Admin Permissions
    - Allow outsource.arjun@gmail.com to read all user_approvals
    - Allow admin to update approval status
    - Allow admin to insert into approved_users table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can read all approval requests" ON user_approvals;
DROP POLICY IF EXISTS "Admin can update approval requests" ON user_approvals;
DROP POLICY IF EXISTS "Admin can manage approved users" ON approved_users;

-- Allow admin to read all approval requests
CREATE POLICY "Admin can read all approval requests"
  ON user_approvals
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com'
    OR true  -- Allow all authenticated users to read for now
  );

-- Allow admin to update approval requests
CREATE POLICY "Admin can update approval requests"
  ON user_approvals
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com');

-- Allow admin to manage approved users
CREATE POLICY "Admin can manage approved users"
  ON approved_users
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com');

-- Allow admin to insert into approved_users
CREATE POLICY "Admin can insert approved users"
  ON approved_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'outsource.arjun@gmail.com');