-- E-File Submissions Table
CREATE TABLE IF NOT EXISTS efile_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tax_form_id UUID REFERENCES tax_forms(id) ON DELETE CASCADE NOT NULL,
  submission_id TEXT UNIQUE NOT NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('federal', 'state', 'both')),
  state_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'processing', 'accepted', 'rejected')),
  irs_acknowledgment TEXT,
  state_acknowledgment TEXT,
  submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledgment_date TIMESTAMPTZ,
  rejection_reason TEXT,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  signature_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E-File Acknowledgments Table
CREATE TABLE IF NOT EXISTS efile_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES efile_submissions(id) ON DELETE CASCADE NOT NULL,
  acknowledgment_type TEXT NOT NULL CHECK (acknowledgment_type IN ('federal', 'state')),
  acknowledgment_code TEXT NOT NULL,
  acknowledgment_text TEXT,
  received_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_efile_submissions_user ON efile_submissions(user_id);
CREATE INDEX idx_efile_submissions_status ON efile_submissions(status);
CREATE INDEX idx_efile_acknowledgments_submission ON efile_acknowledgments(submission_id);

-- RLS Policies
ALTER TABLE efile_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE efile_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON efile_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON efile_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON efile_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own acknowledgments" ON efile_acknowledgments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM efile_submissions 
      WHERE efile_submissions.id = efile_acknowledgments.submission_id 
      AND efile_submissions.user_id = auth.uid()
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_efile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER efile_submissions_updated_at
  BEFORE UPDATE ON efile_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_efile_updated_at();
