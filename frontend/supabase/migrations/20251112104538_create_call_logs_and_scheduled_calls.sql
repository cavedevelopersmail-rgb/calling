/*
  # Call Management System Schema

  ## Overview
  Creates tables for managing call logs and scheduled calls with comprehensive tracking.

  ## New Tables
  
  ### `call_logs`
  Stores detailed records of all completed calls with agent and cost information.
  - `id` (uuid, primary key) - Unique identifier for each call
  - `call_id` (text) - External call identifier
  - `call_type` (text) - Type of call (inbound/outbound)
  - `agent_id` (text) - ID of the agent handling the call
  - `agent_version` (text) - Version of the agent software
  - `agent_name` (text) - Name of the primary agent
  - `nurse_name` (text) - Name of the nurse (from dynamic variables)
  - `agent_name2` (text) - Secondary agent name
  - `agency_name` (text) - Name of the agency
  - `pitch_type` (text) - Type of pitch used
  - `call_source` (text) - Source of the call (from X-Call-Source header)
  - `campaign_tag` (text) - Campaign identifier (from X-Campaign-Tag)
  - `call_status` (text) - Status of the call (completed, failed, etc.)
  - `product_costs` (decimal) - Cost of products/services
  - `total_duration_seconds` (integer) - Total call duration in seconds
  - `total_duration_unit_price` (decimal) - Unit price per duration
  - `combined_cost` (decimal) - Total combined cost
  - `from_number` (text) - Caller phone number
  - `to_number` (text) - Recipient phone number
  - `direction` (text) - Call direction (inbound/outbound)
  - `created_at` (timestamptz) - Record creation timestamp
  - `user_id` (uuid) - Foreign key to auth.users

  ### `scheduled_calls`
  Manages upcoming scheduled calls with reminder functionality.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Call title/subject
  - `description` (text) - Call description/notes
  - `contact_name` (text) - Name of contact to call
  - `contact_number` (text) - Phone number to call
  - `scheduled_time` (timestamptz) - When the call is scheduled
  - `status` (text) - Status: pending, completed, cancelled
  - `agent_id` (text) - Assigned agent ID
  - `campaign_tag` (text) - Related campaign
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `user_id` (uuid) - Foreign key to auth.users

  ## Security
  - Enable RLS on both tables
  - Users can only access their own call logs and scheduled calls
  - Authenticated users required for all operations
*/

-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id text,
  call_type text,
  agent_id text,
  agent_version text,
  agent_name text,
  nurse_name text,
  agent_name2 text,
  agency_name text,
  pitch_type text,
  call_source text,
  campaign_tag text,
  call_status text,
  product_costs decimal(10,2),
  total_duration_seconds integer DEFAULT 0,
  total_duration_unit_price decimal(10,4),
  combined_cost decimal(10,2),
  from_number text,
  to_number text,
  direction text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create scheduled_calls table
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  contact_name text NOT NULL,
  contact_number text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  status text DEFAULT 'pending',
  agent_id text,
  campaign_tag text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_logs
CREATE POLICY "Users can view own call logs"
  ON call_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own call logs"
  ON call_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own call logs"
  ON call_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own call logs"
  ON call_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scheduled_calls
CREATE POLICY "Users can view own scheduled calls"
  ON scheduled_calls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled calls"
  ON scheduled_calls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled calls"
  ON scheduled_calls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled calls"
  ON scheduled_calls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_status ON call_logs(call_status);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_user_id ON scheduled_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_time ON scheduled_calls(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_status ON scheduled_calls(status);