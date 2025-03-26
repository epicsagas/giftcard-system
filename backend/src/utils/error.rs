use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use std::fmt;

/// API Error response structure
#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub message: String,
    pub error_code: Option<String>,
}

/// Main application error enum
#[derive(Debug)]
pub enum AppError {
    DatabaseError(sqlx::Error),
    NotFoundError(String),
    ValidationError(String),
    UnauthorizedError(String),
    InternalServerError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::DatabaseError(e) => write!(f, "Database error: {}", e),
            AppError::NotFoundError(e) => write!(f, "Not found: {}", e),
            AppError::ValidationError(e) => write!(f, "Validation error: {}", e),
            AppError::UnauthorizedError(e) => write!(f, "Unauthorized: {}", e),
            AppError::InternalServerError(e) => write!(f, "Internal server error: {}", e),
        }
    }
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        
        let error_response = ErrorResponse {
            success: false,
            message: self.to_string(),
            error_code: Some(status_code.to_string()),
        };
        
        HttpResponse::build(status_code).json(error_response)
    }
    
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::NotFoundError(_) => StatusCode::NOT_FOUND,
            AppError::ValidationError(_) => StatusCode::BAD_REQUEST,
            AppError::UnauthorizedError(_) => StatusCode::UNAUTHORIZED,
            AppError::InternalServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

// Conversions from common error types to AppError

impl From<sqlx::Error> for AppError {
    fn from(error: sqlx::Error) -> Self {
        match error {
            sqlx::Error::RowNotFound => {
                AppError::NotFoundError("Requested resource not found".to_string())
            }
            _ => AppError::DatabaseError(error),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::InternalServerError(format!("IO error: {}", error))
    }
}

impl From<uuid::Error> for AppError {
    fn from(_: uuid::Error) -> Self {
        AppError::ValidationError("Invalid UUID format".to_string())
    }
}