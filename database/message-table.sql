-- Drop table if exists (for development only)
DROP TABLE IF EXISTS public.message CASCADE;

-- Create message table
CREATE TABLE IF NOT EXISTS public.message (
  message_id SERIAL PRIMARY KEY,
  message_subject VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  message_created TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  message_to INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  message_from INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  message_read BOOLEAN DEFAULT FALSE NOT NULL,
  message_archived BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_message_to ON public.message(message_to);
CREATE INDEX idx_message_from ON public.message(message_from);
CREATE INDEX idx_message_read ON public.message(message_read);
CREATE INDEX idx_message_archived ON public.message(message_archived);
CREATE INDEX idx_message_created ON public.message(message_created DESC);

-- Grant privileges (replace 'jtkallon_aewm' with your database user)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message TO jtkallon_aewm;
GRANT USAGE, SELECT ON SEQUENCE public.message_message_id_seq TO jtkallon_aewm;

-- Insert sample messages for testing (optional)
-- Uncomment and modify account IDs as needed
/*
INSERT INTO public.message (message_to, message_from, message_subject, message_body) 
VALUES 
  (1, 2, 'Welcome to the messaging system', 'This is a test message to verify the system is working correctly.'),
  (2, 1, 'Re: Welcome to the messaging system', 'Thank you! The system looks great.');
*/