use actix_web::{web, HttpResponse};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{MySqlPool, MySql, Transaction};
use std::str::FromStr;
use uuid::Uuid;
use qrcode::QrCode;
use qrcode::render::svg;
use base64::{engine::general_purpose, Engine};
use image::{Rgba, DynamicImage};

use crate::models::gift_card::{
    AcceptGiftCardDto, CreateGiftCardDto, CreateTransactionDto, GiftCard, GiftCardResponseDto,
    GiftCardTransaction, GiftCardVerificationDto, UseGiftCardDto,
};

#[derive(Debug, Serialize)]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PaginationParams {
    page: Option<u32>,
    per_page: Option<u32>,
}

/// Create a new gift card
pub async fn create_gift_card(
    pool: web::Data<MySqlPool>,
    gift_card_dto: web::Json<CreateGiftCardDto>,
) -> HttpResponse {
    let dto = gift_card_dto.into_inner();
    
    // Validate input data
    if dto.balance <= 0 {
        return HttpResponse::BadRequest().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Balance must be positive".to_string()),
        });
    }
    
    if dto.expiration_days <= 0 {
        return HttpResponse::BadRequest().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Expiration days must be positive".to_string()),
        });
    }
    
    // Calculate expiration date
    let expiration_date = Utc::now() + Duration::days(dto.expiration_days as i64);
    
    // Generate a new UUID for the gift card
    let gift_card_id = Uuid::new_v4();
    
    // Insert the gift card into the database
        let result = sqlx::query!(
            r#"
            INSERT INTO gift_cards (
                id, issuer_name, recipient_name, recipient_phone, 
                balance, initial_balance, expiration_date, 
                is_accepted, is_active, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            gift_card_id,
            dto.issuer_name,
            dto.recipient_name,
            dto.recipient_phone,
            dto.balance,
            dto.balance,
            expiration_date,
            false, // is_accepted
            true,  // is_active
            Utc::now(),
            Utc::now()
    )
    .execute(pool.get_ref())
    .await;
    
    match result {
        Ok(_) => {
            // Fetch the created gift card to return in response
            let gift_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
            
            match gift_card {
                Ok(card) => {
                    let response_dto = to_gift_card_response_dto(card, None);
                    
                    HttpResponse::Created().json(ApiResponse {
                        success: true,
                        data: Some(response_dto),
                        message: Some("Gift card created successfully".to_string()),
                    })
                }
                Err(_) => HttpResponse::InternalServerError().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Failed to retrieve created gift card".to_string()),
                }),
            }
        }
        Err(e) => {
            log::error!("Error creating gift card: {:?}", e);
            HttpResponse::InternalServerError().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Failed to create gift card".to_string()),
            })
        }
    }
}

/// Get a gift card by ID
pub async fn get_gift_card(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Fetch the gift card from the database
    let gift_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
    
    match gift_card {
        Ok(card) => {
            // Generate QR code for the gift card
            let qr_code = generate_gift_card_qr(&card);
            
            let response_dto = to_gift_card_response_dto(card, qr_code);
            
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(response_dto),
                message: None,
            })
        }
        Err(_) => HttpResponse::NotFound().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Gift card not found".to_string()),
        }),
    }
}

/// Accept a gift card
pub async fn accept_gift_card(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
    accept_dto: web::Json<AcceptGiftCardDto>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Fetch the gift card from the database
    let gift_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
    
    match gift_card {
        Ok(card) => {
            // Verify recipient phone matches
            if card.recipient_phone != accept_dto.recipient_phone {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Phone number does not match".to_string()),
                });
            }
            
            // Check if gift card is already accepted
            if card.is_accepted {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Gift card already accepted".to_string()),
                });
            }
            
            // Check if gift card is expired
            if card.expiration_date < Utc::now() {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Gift card has expired".to_string()),
                });
            }
            
            // Update gift card to mark as accepted
            let result = sqlx::query!(
                r#"
                UPDATE gift_cards
                SET is_accepted = true, updated_at = ?
                WHERE id = ?
                "#,
                Utc::now(),
                gift_card_id
            )
            .execute(pool.get_ref())
            .await;
            
            match result {
                Ok(_) => {
                    // Fetch the updated gift card
                    let updated_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
                    
                    match updated_card {
                        Ok(card) => {
                            // Generate QR code for the gift card
                            let qr_code = generate_gift_card_qr(&card);
                            
                            let response_dto = to_gift_card_response_dto(card, qr_code);
                            
                            HttpResponse::Ok().json(ApiResponse {
                                success: true,
                                data: Some(response_dto),
                                message: Some("Gift card accepted successfully".to_string()),
                            })
                        }
                        Err(_) => HttpResponse::InternalServerError().json(ApiResponse {
                            success: false,
                            data: None::<()>,
                            message: Some("Failed to retrieve updated gift card".to_string()),
                        }),
                    }
                }
                Err(e) => {
                    log::error!("Error accepting gift card: {:?}", e);
                    HttpResponse::InternalServerError().json(ApiResponse {
                        success: false,
                        data: None::<()>,
                        message: Some("Failed to accept gift card".to_string()),
                    })
                }
            }
        }
        Err(_) => HttpResponse::NotFound().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Gift card not found".to_string()),
        }),
    }
}

/// Use a gift card for payment
pub async fn use_gift_card(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
    use_dto: web::Json<UseGiftCardDto>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Start a transaction
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            log::error!("Error starting transaction: {:?}", e);
            return HttpResponse::InternalServerError().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Database error".to_string()),
            });
        }
    };
    
    // Fetch the gift card within the transaction
    let gift_card = fetch_gift_card_by_id_tx(&mut tx, gift_card_id).await;
    
    match gift_card {
        Ok(card) => {
            // Validate the gift card can be used
            if !card.is_active {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Gift card is not active".to_string()),
                });
            }
            
            if !card.is_accepted {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Gift card has not been accepted".to_string()),
                });
            }
            
            if card.expiration_date < Utc::now() {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Gift card has expired".to_string()),
                });
            }
            
            // Check if there's sufficient balance
            if card.balance < use_dto.amount {
                return HttpResponse::BadRequest().json(ApiResponse {
                    success: false,
                    data: None::<()>,
                    message: Some("Insufficient balance".to_string()),
                });
            }
            
            // Calculate new balance
            let new_balance = card.balance - use_dto.amount;
            
            // Update the gift card balance
            let update_result = sqlx::query!(
                r#"
                UPDATE gift_cards
                SET balance = ?, updated_at = ?, is_active = ?
                WHERE id = ?
                "#,
                new_balance,
                Utc::now(),
                new_balance > 0, // Deactivate if balance is zero
                gift_card_id
            )
            .execute(&mut tx)
            .await;
            
            match update_result {
                Ok(_) => {
                    // Create a transaction record
                    let transaction_id = Uuid::new_v4();
                    let transaction_result = sqlx::query!(
                        r#"
                        INSERT INTO gift_card_transactions (
                            id, gift_card_id, amount, merchant, transaction_date
                        )
                        VALUES (?, ?, ?, ?, ?)
                        "#,
                        transaction_id,
                        gift_card_id,
                        use_dto.amount,
                        "Payment",  // Default merchant name, could be passed in the DTO
                        Utc::now()
                    )
                    .execute(&mut tx)
                    .await;
                    
                    match transaction_result {
                        Ok(_) => {
                            // Commit the transaction
                            match tx.commit().await {
                                Ok(_) => {
                                    // Fetch the updated gift card
                                    let updated_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
                                    
                                    match updated_card {
                                        Ok(card) => {
                                            HttpResponse::Ok().json(ApiResponse {
                                                success: true,
                                                data: Some(card),
                                                message: Some(format!("Payment of {} processed successfully", use_dto.amount)),
                                            })
                                        }
                                        Err(_) => HttpResponse::InternalServerError().json(ApiResponse {
                                            success: false,
                                            data: None::<()>,
                                            message: Some("Failed to retrieve updated gift card".to_string()),
                                        }),
                                    }
                                }
                                Err(e) => {
                                    log::error!("Error committing transaction: {:?}", e);
                                    HttpResponse::InternalServerError().json(ApiResponse {
                                        success: false,
                                        data: None::<()>,
                                        message: Some("Database error".to_string()),
                                    })
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("Error creating transaction record: {:?}", e);
                            HttpResponse::InternalServerError().json(ApiResponse {
                                success: false,
                                data: None::<()>,
                                message: Some("Failed to record transaction".to_string()),
                            })
                        }
                    }
                }
                Err(e) => {
                    log::error!("Error updating gift card balance: {:?}", e);
                    HttpResponse::InternalServerError().json(ApiResponse {
                        success: false,
                        data: None::<()>,
                        message: Some("Failed to update gift card balance".to_string()),
                    })
                }
            }
        }
        Err(_) => HttpResponse::NotFound().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Gift card not found".to_string()),
        }),
    }
}

/// Generate QR code for a gift card
pub async fn generate_qr_code(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Fetch the gift card from the database
    let gift_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
    
    match gift_card {
        Ok(card) => {
            // Generate QR code for the gift card
            let qr_code = match generate_gift_card_qr(&card) {
                Some(qr) => qr,
                None => {
                    return HttpResponse::InternalServerError().json(ApiResponse {
                        success: false,
                        data: None::<()>,
                        message: Some("Failed to generate QR code".to_string()),
                    });
                }
            };
            
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(qr_code),
                message: None,
            })
        }
        Err(_) => HttpResponse::NotFound().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Gift card not found".to_string()),
        }),
    }
}

/// List gift cards by recipient phone
pub async fn list_by_recipient(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
    query: web::Query<PaginationParams>,
) -> HttpResponse {
    let recipient_phone = path.into_inner();
    
    // Parse pagination parameters
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(10);
    let offset = (page - 1) * per_page;
    
    // Fetch gift cards from the database
    let gift_cards = sqlx::query_as!(
        GiftCard,
        r#"
        SELECT *
        FROM gift_cards
        WHERE recipient_phone = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
        recipient_phone,
        per_page as i64,
        offset as i64
    )
    .fetch_all(pool.get_ref())
    .await;
    
    match gift_cards {
        Ok(cards) => {
            // Convert to response DTOs
            let response_dtos: Vec<GiftCardResponseDto> = cards
                .into_iter()
                .map(|card| to_gift_card_response_dto(card, None))
                .collect();
            
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(response_dtos),
                message: None,
            })
        }
        Err(e) => {
            log::error!("Error fetching gift cards: {:?}", e);
            HttpResponse::InternalServerError().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Failed to fetch gift cards".to_string()),
            })
        }
    }
}

/// Verify gift card (used when scanning QR code)
pub async fn verify_gift_card(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Fetch the gift card from the database
    let gift_card = fetch_gift_card_by_id(pool.get_ref(), gift_card_id).await;
    
    match gift_card {
        Ok(card) => {
            // Create verification DTO
            let verification_dto = GiftCardVerificationDto {
                id: card.id,
                balance: card.balance,
                is_active: card.is_active,
                is_accepted: card.is_accepted,
                expiration_date: card.expiration_date,
            };
            
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(verification_dto),
                message: None,
            })
        }
        Err(_) => HttpResponse::NotFound().json(ApiResponse {
            success: false,
            data: None::<()>,
            message: Some("Gift card not found".to_string()),
        }),
    }
}

/// List transactions for a gift card
pub async fn list_transactions(
    pool: web::Data<MySqlPool>,
    path: web::Path<String>,
    query: web::Query<PaginationParams>,
) -> HttpResponse {
    let gift_card_id = match Uuid::from_str(&path.into_inner()) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Invalid gift card ID".to_string()),
            });
        }
    };
    
    // Parse pagination parameters
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(10);
    let offset = (page - 1) * per_page;
    
    // Fetch transactions from the database
    let transactions = sqlx::query_as!(
        GiftCardTransaction,
        r#"
        SELECT *
        FROM gift_card_transactions
        WHERE gift_card_id = ?
        ORDER BY transaction_date DESC
        LIMIT ? OFFSET ?
        "#,
        gift_card_id,
        per_page as i64,
        offset as i64
    )
    .fetch_all(pool.get_ref())
    .await;
    
    match transactions {
        Ok(txns) => {
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(txns),
                message: None,
            })
        }
        Err(e) => {
            log::error!("Error fetching transactions: {:?}", e);
            HttpResponse::InternalServerError().json(ApiResponse {
                success: false,
                data: None::<()>,
                message: Some("Failed to fetch transactions".to_string()),
            })
        }
    }
}

// Helper functions

/// Fetch a gift card by ID
async fn fetch_gift_card_by_id(pool: &MySqlPool, gift_card_id: Uuid) -> Result<GiftCard, sqlx::Error> {
    sqlx::query_as!(
        GiftCard,
        r#"
        SELECT *
        FROM gift_cards
        WHERE id = ?
        "#,
        gift_card_id
    )
    .fetch_one(pool)
    .await
}

/// Fetch a gift card by ID within a transaction
async fn fetch_gift_card_by_id_tx(
    tx: &mut Transaction<'_, MySql>,
    gift_card_id: Uuid,
) -> Result<GiftCard, sqlx::Error> {
    sqlx::query_as!(
        GiftCard,
        r#"
        SELECT *
        FROM gift_cards
        WHERE id = ?
        FOR UPDATE
        "#,
        gift_card_id
    )
    .fetch_one(tx)
    .await
}

/// Generate a QR code for a gift card
fn generate_gift_card_qr(gift_card: &GiftCard) -> Option<String> {
    let qr_content = format!("giftcard:{}", gift_card.id);
    
    // Generate QR code
    let code = QrCode::new(qr_content.as_bytes()).ok()?;
    
    // Render as SVG
    let svg = code.render()
        .min_dimensions(200, 200)
        .dark_color(svg::Color("#000000"))
        .light_color(svg::Color("#ffffff"))
        .build();
    
    // Convert SVG to base64
    Some(format!("data:image/svg+xml;base64,{}", general_purpose::STANDARD.encode(svg)))
}

/// Convert GiftCard to GiftCardResponseDto
fn to_gift_card_response_dto(gift_card: GiftCard, qr_code: Option<String>) -> GiftCardResponseDto {
    GiftCardResponseDto {
        id: gift_card.id,
        issuer_name: gift_card.issuer_name,
        recipient_name: gift_card.recipient_name,
        recipient_phone: gift_card.recipient_phone,
        balance: gift_card.balance,
        initial_balance: gift_card.initial_balance,
        expiration_date: gift_card.expiration_date,
        is_accepted: gift_card.is_accepted,
        is_active: gift_card.is_active,
        qr_code,
        created_at: gift_card.created_at,
    }
}