use std::env;

/// Application configuration
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub server_host: String,
    pub server_port: u16,
    pub jwt_secret: String,
    pub jwt_expiration: i64,  // JWT expiration in seconds
    pub cors_allowed_origins: Vec<String>,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        // Get environment variables with defaults
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");
            
        let server_host = env::var("SERVER_HOST")
            .unwrap_or_else(|_| "0.0.0.0".to_string());
            
        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse::<u16>()
            .expect("SERVER_PORT must be a valid port number");
            
        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "your_jwt_secret_key_please_change_in_production".to_string());
            
        let jwt_expiration = env::var("JWT_EXPIRATION")
            .unwrap_or_else(|_| "86400".to_string())  // Default: 24 hours
            .parse::<i64>()
            .expect("JWT_EXPIRATION must be a valid number");
            
        let cors_allowed_origins = env::var("CORS_ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "*".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();
            
        Self {
            database_url,
            server_host,
            server_port,
            jwt_secret,
            jwt_expiration,
            cors_allowed_origins,
        }
    }
}

/// Get configuration instance
pub fn get_config() -> Config {
    Config::from_env()
}