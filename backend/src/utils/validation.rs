use regex::Regex;
use lazy_static::lazy_static;

lazy_static! {
    // Phone number regex - simple pattern for demo purposes
    // In production, use region-specific validation
    static ref PHONE_REGEX: Regex = Regex::new(r"^\+?[0-9]{10,15}$").unwrap();
    
    // Name regex - allows letters, spaces, and common special characters
    static ref NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z\s\-'.]{2,50}$").unwrap();
}

/// Validate phone number format
pub fn validate_phone(phone: &str) -> bool {
    PHONE_REGEX.is_match(phone)
}

/// Validate name format
pub fn validate_name(name: &str) -> bool {
    NAME_REGEX.is_match(name)
}

/// Validate monetary amount (in cents)
/// 
/// Returns true if amount is positive and within reasonable range
pub fn validate_amount(amount: i32) -> bool {
    // Amount should be positive and less than $10,000 (1,000,000 cents)
    // For demo purposes - actual limits would depend on business requirements
    amount > 0 && amount <= 1_000_000
}

/// Validate expiration days
pub fn validate_expiration_days(days: i32) -> bool {
    // Expiration between 1 day and 5 years (1825 days)
    days > 0 && days <= 1825
}

/// Format phone number for display
pub fn format_phone_for_display(phone: &str) -> String {
    // This is a simplistic implementation
    // In a real app, you'd use a phone number formatting library
    // that handles international formats correctly
    
    let digits: String = phone.chars().filter(|c| c.is_ascii_digit()).collect();
    
    match digits.len() {
        10 => format!(
            "({}) {}-{}",
            &digits[0..3],
            &digits[3..6],
            &digits[6..10]
        ),
        11 if digits.starts_with('1') => format!(
            "+1 ({}) {}-{}",
            &digits[1..4],
            &digits[4..7],
            &digits[7..11]
        ),
        _ => phone.to_string(), // If can't format, return original
    }
}

/// Format money amount for display (cents to dollars)
pub fn format_money(amount_cents: i32) -> String {
    format!("${:.2}", amount_cents as f64 / 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_phone_validation() {
        assert!(validate_phone("1234567890"));
        assert!(validate_phone("+11234567890"));
        assert!(!validate_phone("123"));
        assert!(!validate_phone("not-a-phone"));
    }

    #[test]
    fn test_name_validation() {
        assert!(validate_name("John Doe"));
        assert!(validate_name("Mary-Jane O'Connor"));
        assert!(!validate_name("a"));
        assert!(!validate_name("Name with 123"));
    }

    #[test]
    fn test_amount_validation() {
        assert!(validate_amount(100));      // $1.00
        assert!(validate_amount(999999));   // $9,999.99
        assert!(!validate_amount(0));       // $0.00
        assert!(!validate_amount(-100));    // Negative amount
        assert!(!validate_amount(1000001)); // Over limit
    }
}