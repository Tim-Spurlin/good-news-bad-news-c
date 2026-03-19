#[tauri::command]
fn check_battery_status() -> bool {
    // Check if we are on battery power natively in Linux (Arch/KDE Wayland)
    for i in 0..2 {
        let status_path = format!("/sys/class/power_supply/BAT{}/status", i);
        if let Ok(status) = std::fs::read_to_string(&status_path) {
            if status.trim() == "Discharging" {
                // Check capacity if we want to be strict, or just reduce FPS immediately when discharging
                return true;
            }
        }
    }
    false
}

use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
#[derive(serde::Serialize, serde::Deserialize)]
struct ApiUsage {
    date: String,
    count: u32,
    last_request_timestamp: u64,
}

fn get_today_date_string() -> String {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    // seconds in a day: 86400
    let days = now / 86400;
    format!("day-{}", days)
}

fn get_usage_file_path() -> PathBuf {
    if let Some(mut path) = dirs::home_dir() {
        path.push(".goodnews_badnews_api_usage.json");
        path
    } else {
        PathBuf::from("/tmp/.goodnews_badnews_api_usage.json")
    }
}

// Returns Ok(0) if allowed, or Ok(seconds_to_wait) if the user must wait
#[tauri::command]
fn check_and_increment_api_usage() -> Result<u64, String> {
    let path = get_usage_file_path();
    let today = get_today_date_string();
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    
    let mut usage = ApiUsage {
        date: today.clone(),
        count: 0,
        last_request_timestamp: 0,
    };
    
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(parsed) = serde_json::from_str::<ApiUsage>(&content) {
                if parsed.date == today {
                    usage.count = parsed.count;
                    usage.last_request_timestamp = parsed.last_request_timestamp;
                }
            }
        }
    }
    
    if usage.count >= 50 {
        return Ok(std::u64::MAX); // Hard limit reached for the day
    }
    
    // Spread 50 requests over 12 hours = 43200 seconds
    // 43200 / 50 = 864 seconds between requests (14.4 minutes)
    let required_interval = 864;
    let elapsed = now.saturating_sub(usage.last_request_timestamp);
    
    if elapsed < required_interval {
        let wait_time = required_interval - elapsed;
        return Ok(wait_time); // Return how many seconds to wait
    }
    
    usage.count += 1;
    usage.last_request_timestamp = now;
    
    let serialized = serde_json::to_string(&usage).map_err(|e| e.to_string())?;
    fs::write(&path, serialized).map_err(|e| e.to_string())?;
    
    Ok(0) // 0 wait time represents success
}

#[tauri::command]
async fn fetch_secure_world_news(batch_size: u32) -> Result<serde_json::Value, String> {
    dotenvy::dotenv().ok();
    let api_key = std::env::var("WORLD_NEWS_API_KEY")
        .map_err(|_| "WORLD_NEWS_API_KEY clearly missing securely from .env")?;
        
    let client = reqwest::Client::new();
    // Use the official World News API securely without touching the proxy
    let res = client.get("https://api.worldnewsapi.com/search-news")
        .header("x-api-key", api_key)
        .query(&[("number", batch_size.to_string()), ("language", "en".to_string())])
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    if !res.status().is_success() {
        return Err(format!("API Request Failed: {}", res.status()));
    }
        
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    Ok(json)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                // You can add plugins here
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_battery_status, 
            check_and_increment_api_usage,
            fetch_secure_world_news
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
