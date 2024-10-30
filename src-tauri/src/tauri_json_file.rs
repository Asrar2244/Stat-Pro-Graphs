use serde_json::Value;
use std::fs::File;
use std::io::Write;
use tauri::command;

#[command]
pub fn save_json_to_file(file_path: String, json_data: Value) -> Result<(), String> {
    let json_string = match serde_json::to_string(&json_data) {
        Ok(json_string) => json_string,
        Err(e) => return Err(format!("Failed to convert JSON to string: {}", e)),
    };

    let mut file = match File::create(file_path) {
        Ok(file) => file,
        Err(e) => return Err(format!("Failed to create file: {}", e)),
    };

    match file.write_all(json_string.as_bytes()) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write to file: {}", e)),
    }
}
