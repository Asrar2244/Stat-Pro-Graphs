use serde_json::Value;
use std::fs::metadata;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
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
#[command]
pub fn get_file_size(path: String) -> Result<u64, String> {
    let path = PathBuf::from(path);
    match metadata(&path) {
        Ok(meta) => Ok(meta.len()),
        Err(e) => Err(format!("Failed to get file metadata: {}", e)),
    }
}
