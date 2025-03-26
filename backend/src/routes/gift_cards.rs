use actix_web::web;
use crate::handlers::gift_cards;

/// Configure gift card API routes
pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/gift-cards")
            // Issue a new gift card
            .route("", web::post().to(gift_cards::create_gift_card))
            
            // Get gift card by ID
            .route("/{id}", web::get().to(gift_cards::get_gift_card))
            
            // Accept a gift card
            .route("/{id}/accept", web::post().to(gift_cards::accept_gift_card))
            
            // Use a gift card for payment
            .route("/{id}/use", web::post().to(gift_cards::use_gift_card))
            
            // Generate QR code for a gift card
            .route("/{id}/qr-code", web::get().to(gift_cards::generate_qr_code))
            
            // List gift cards by recipient phone (with pagination)
            .route("/by-recipient/{phone}", web::get().to(gift_cards::list_by_recipient))
            
            // Verify gift card (used when scanning QR code)
            .route("/{id}/verify", web::get().to(gift_cards::verify_gift_card))
            
            // List transactions for a gift card
            .route("/{id}/transactions", web::get().to(gift_cards::list_transactions))
    );
}