use serde_json::Value;
use std::fs::metadata;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tauri::command;
use std::fs::{File, create_dir_all};
use std::path::Path;

#[tauri::command]
pub fn save_json_to_file(file_path: String, json_data: Value) -> Result<(), String> {
    let json_string = serde_json::to_string(&json_data)
        .map_err(|e| format!("Failed to convert JSON to string: {}", e))?;

    let path = Path::new(&file_path);
    
    if let Some(parent) = path.parent() {
        if let Err(e) = create_dir_all(parent) {
            return Err(format!("Failed to create directories: {}", e));
        }
    }

    let mut file = File::create(path)
        .map_err(|e| format!("Failed to create or open file: {}", e))?;

    file.write_all(json_string.as_bytes())
        .map_err(|e| format!("Failed to write to file: {}", e))
}

#[command]
pub fn get_file_size(path: String) -> Result<u64, String> {
    let path = PathBuf::from(path);
    match metadata(&path) {
        Ok(meta) => Ok(meta.len()),
        Err(e) => Err(format!("Failed to get file metadata: {}", e)),
    }
}

#[command]
pub fn read_json_from_file(file_path: String) -> Option<Value> {
    match fs::read_to_string(&file_path) {
        Ok(content) => match serde_json::from_str(&content) {
            Ok(json) => Some(json),
            Err(e) => {
                println!("Failed to parse JSON from {}: {}", file_path, e);
                None
            }
        },
        Err(e) => {
            println!("Failed to read file {}: {}", file_path, e);
            None
        }
    }
}