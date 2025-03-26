-- Create gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY,
    issuer_name VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    balance INTEGER NOT NULL CHECK (balance >= 0),
    initial_balance INTEGER NOT NULL CHECK (initial_balance >= 0),
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on recipient_phone for faster lookups
CREATE INDEX idx_gift_cards_recipient_phone ON gift_cards(recipient_phone);

-- Create gift card transactions table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id UUID PRIMARY KEY,
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    merchant VARCHAR(100) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on gift_card_id for faster lookups
CREATE INDEX idx_gift_card_transactions_gift_card_id ON gift_card_transactions(gift_card_id);

-- Add trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for gift_cards table
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON gift_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();