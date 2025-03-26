-- Create gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
    id CHAR(36) PRIMARY KEY,
    issuer_name VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    balance INT NOT NULL CHECK (balance >= 0),
    initial_balance INT NOT NULL CHECK (initial_balance >= 0),
    expiration_date DATETIME NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on recipient_phone for faster lookups
CREATE INDEX idx_gift_cards_recipient_phone ON gift_cards(recipient_phone);

-- Create gift card transactions table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id CHAR(36) PRIMARY KEY,
    gift_card_id CHAR(36) NOT NULL,
    amount INT NOT NULL CHECK (amount > 0),
    merchant VARCHAR(100) NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE
);

-- Create index on gift_card_id for faster lookups
CREATE INDEX idx_gift_card_transactions_gift_card_id ON gift_card_transactions(gift_card_id);