use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// Represents a gift card in the database
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct GiftCard {
    pub id: Uuid,
    pub issuer_name: String,          // Name of the person who issued the gift card
    pub recipient_name: String,        // Name of the recipient
    pub recipient_phone: String,       // Phone number of the recipient
    pub balance: i32,                  // Balance in cents (e.g., 5000 = $50.00)
    pub initial_balance: i32,          // Original balance in cents
    pub expiration_date: DateTime<Utc>, // Expiration date
    pub is_accepted: bool,             // Whether the recipient has accepted the gift card
    pub is_active: bool,               // Whether the gift card is active
    pub created_at: DateTime<Utc>,     // When the gift card was created
    pub updated_at: DateTime<Utc>,     // When the gift card was last updated
}

/// DTO for creating a new gift card
#[derive(Debug, Deserialize)]
pub struct CreateGiftCardDto {
    pub issuer_name: String,
    pub recipient_name: String,
    pub recipient_phone: String,
    pub balance: i32,                  // Balance in cents
    pub expiration_days: i32,          // Days until expiration from creation date
}

/// DTO for accepting a gift card
#[derive(Debug, Deserialize)]
pub struct AcceptGiftCardDto {
    pub gift_card_id: Uuid,
    pub recipient_phone: String,       // For verification purposes
}

/// DTO for using a gift card for payment
#[derive(Debug, Deserialize)]
pub struct UseGiftCardDto {
    pub gift_card_id: Uuid,
    pub amount: i32,                   // Amount to use in cents
}

/// DTO for gift card response with QR data
#[derive(Debug, Serialize)]
pub struct GiftCardResponseDto {
    pub id: Uuid,
    pub issuer_name: String,
    pub recipient_name: String,
    pub recipient_phone: String,
    pub balance: i32,                  // Balance in cents
    pub initial_balance: i32,          // Original balance in cents
    pub expiration_date: DateTime<Utc>,
    pub is_accepted: bool,
    pub is_active: bool,
    pub qr_code: Option<String>,       // Base64 encoded QR code image
    pub created_at: DateTime<Utc>,
}

/// DTO for gift card verification (used when scanning QR code)
#[derive(Debug, Serialize)]
pub struct GiftCardVerificationDto {
    pub id: Uuid,
    pub balance: i32,
    pub is_active: bool,
    pub is_accepted: bool,
    pub expiration_date: DateTime<Utc>,
}

/// Transaction record for gift card usage
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct GiftCardTransaction {
    pub id: Uuid,
    pub gift_card_id: Uuid,
    pub amount: i32,                   // Amount used in cents
    pub merchant: String,              // Where the transaction occurred
    pub transaction_date: DateTime<Utc>,
}

/// DTO for creating a transaction
#[derive(Debug, Deserialize)]
pub struct CreateTransactionDto {
    pub gift_card_id: Uuid,
    pub amount: i32,
    pub merchant: String,
}