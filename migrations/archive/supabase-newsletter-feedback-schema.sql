-- Newsletter Feedback Table
CREATE TABLE IF NOT EXISTS newsletter_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email VARCHAR(255) NOT NULL,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('very_useful', 'useful', 'not_useful')),
  campaign_date DATE NOT NULL,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Constraints
  UNIQUE(subscriber_email, campaign_date),

  -- Indexes
  CONSTRAINT valid_feedback CHECK (feedback_type IN ('very_useful', 'useful', 'not_useful'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_feedback_email ON newsletter_feedback(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_newsletter_feedback_date ON newsletter_feedback(campaign_date);
CREATE INDEX IF NOT EXISTS idx_newsletter_feedback_type ON newsletter_feedback(feedback_type);

-- RLS Policies (disable public access)
ALTER TABLE newsletter_feedback ENABLE ROW LEVEL SECURITY;

-- No public access - only via service role
CREATE POLICY "No public access to feedback"
  ON newsletter_feedback
  FOR ALL
  USING (false);

COMMENT ON TABLE newsletter_feedback IS 'Stores feedback responses from newsletter subscribers';
COMMENT ON COLUMN newsletter_feedback.feedback_type IS 'Type of feedback: very_useful, useful, not_useful';
COMMENT ON COLUMN newsletter_feedback.campaign_date IS 'Date of the newsletter campaign this feedback is for';
COMMENT ON COLUMN newsletter_feedback.responded_at IS 'Timestamp when the subscriber submitted the feedback';
