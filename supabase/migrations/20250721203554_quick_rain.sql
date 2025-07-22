/*
  # Add password field to user_approvals table

  1. Changes
    - Add password column to user_approvals table to store user's chosen password
    - This allows creating the actual user account when approved

  2. Security
    - Password will be used to create the Supabase Auth user account
    - Password column will be cleared after account creation for security
*/

-- Add password column to store user's chosen password
ALTER TABLE user_approvals 
ADD COLUMN IF NOT EXISTS password text;