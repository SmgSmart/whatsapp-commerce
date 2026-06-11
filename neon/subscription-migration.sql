-- Add subscription and trial tracking fields to the stores table.

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT now() + interval '14 days',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
ADD COLUMN IF NOT EXISTS paystack_subscription_code text,
ADD COLUMN IF NOT EXISTS paystack_customer_code text;

-- For any existing stores, set their trial to end 14 days after they were created.
UPDATE stores
SET trial_ends_at = created_at + interval '14 days'
WHERE trial_ends_at IS NULL;
