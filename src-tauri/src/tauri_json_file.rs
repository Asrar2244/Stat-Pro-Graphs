use serde_json::{Value, json};
use std::fs::{metadata, read_dir};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::command;
use rusqlite::Connection;

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

/// Recursively calculates the total size of a directory
fn calculate_dir_size(path: &PathBuf) -> Result<u64, String> {
    let mut total_size: u64 = 0;
    
    let entries = match read_dir(path) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };
    
    for entry in entries {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue, // Skip entries we can't read
        };
        
        let path = entry.path();
        let metadata = match metadata(&path) {
            Ok(meta) => meta,
            Err(_) => continue, // Skip files we can't access
        };
        
        if metadata.is_dir() {
            // Recursively calculate directory size
            match calculate_dir_size(&path) {
                Ok(size) => total_size += size,
                Err(_) => continue, // Skip directories we can't access
            }
        } else {
            // Add file size
            total_size += metadata.len();
        }
    }
    
    Ok(total_size)
}

#[command]
pub fn get_directory_size(path: String) -> Result<u64, String> {
    let path = PathBuf::from(path);
    
    // Check if path exists
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }
    
    // Check if it's a directory
    let metadata = match metadata(&path) {
        Ok(meta) => meta,
        Err(e) => return Err(format!("Failed to get path metadata: {}", e)),
    };
    
    if !metadata.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }
    
    calculate_dir_size(&path)
}

/// Calculate size of a specific project by finding all related database files
#[command]
pub fn get_project_size(db_path: String) -> Result<u64, String> {
    let path = PathBuf::from(&db_path);
    
    // Check if the database file exists
    if !path.exists() {
        return Err(format!("Database file does not exist: {}", path.display()));
    }
    
    // Get the directory and base filename
    let dir = match path.parent() {
        Some(d) => d,
        None => return Err("Could not get parent directory".to_string()),
    };
    
    let base_name = match path.file_stem() {
        Some(name) => match name.to_str() {
            Some(s) => s,
            None => return Err("Invalid filename".to_string()),
        },
        None => return Err("Could not get filename".to_string()),
    };
    
    // Calculate size of the main database file
    let main_size = match metadata(&path) {
        Ok(meta) => meta.len(),
        Err(e) => return Err(format!("Failed to get file size: {}", e)),
    };
    
    let mut total_size = main_size;
    
    // Look for related files in the same directory
    // Common patterns: project.db, project_output.db, project_graphs.db, project-wal, project-shm, etc.
    let entries = match read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return Ok(total_size), // Return main file size if we can't read directory
    };
    
    for entry in entries {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };
        
        let file_path = entry.path();
        let file_name = match file_path.file_name() {
            Some(name) => match name.to_str() {
                Some(s) => s,
                None => continue,
            },
            None => continue,
        };
        
        // Skip the main file (already counted)
        if file_path == path {
            continue;
        }
        
        // Check if this file is related to our project
        // Match patterns like: base_name*, base-name*, etc.
        let is_related = file_name.starts_with(base_name) || 
                        file_name.starts_with(&base_name.replace("_", "-")) ||
                        file_name.starts_with(&base_name.replace("-", "_"));
        
        if is_related {
            if let Ok(meta) = metadata(&file_path) {
                if meta.is_file() {
                    total_size += meta.len();
                }
            }
        }
    }
    
    Ok(total_size)
}

/// Get detailed size breakdown of SQLite database tables
#[command]
pub fn get_project_size_breakdown(db_path: String) -> Result<Value, String> {
    let path = PathBuf::from(&db_path);
    
    // Check if the database file exists
    if !path.exists() {
        return Err(format!("Database file does not exist: {}", path.display()));
    }
    
    // Get total file size first
    let total_file_size = match get_project_size(db_path.clone()) {
        Ok(size) => size,
        Err(e) => return Err(format!("Failed to get total size: {}", e)),
    };
    
    // Open SQLite connection
    let conn = match Connection::open(&path) {
        Ok(c) => c,
        Err(e) => return Err(format!("Failed to open database: {}", e)),
    };
    
    // Get page size and page count
    let page_size: i64 = match conn.query_row("PRAGMA page_size", [], |row| row.get(0)) {
        Ok(size) => size,
        Err(_) => 4096, // Default SQLite page size
    };
    
    let page_count: i64 = match conn.query_row("PRAGMA page_count", [], |row| row.get(0)) {
        Ok(count) => count,
        Err(_) => 0,
    };
    
    let db_size = page_size * page_count;
    
    // Get list of tables
    let mut stmt = match conn.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") {
        Ok(s) => s,
        Err(e) => return Err(format!("Failed to query tables: {}", e)),
    };
    
    let table_names: Vec<String> = match stmt.query_map([], |row| row.get(0)) {
        Ok(mapped_rows) => {
            mapped_rows.filter_map(|r| r.ok()).collect()
        },
        Err(e) => return Err(format!("Failed to get table names: {}", e)),
    };
    
    // CRITICAL: Fetch row counts for ALL tables in one go while connection is open
    // Store them in a HashMap or Vec of tuples so we can close the connection
    let mut table_stats: Vec<(String, i64)> = Vec::new();
    let mut total_rows: i64 = 0;

    for table_name in &table_names {
        let query = format!("SELECT COUNT(*) FROM {}", table_name);
        let row_count: i64 = match conn.query_row(&query, [], |row| row.get(0)) {
            Ok(count) => count,
            Err(_) => 0,
        };
        table_stats.push((table_name.clone(), row_count));
        total_rows += row_count;
    }
    
    // CRITICAL: Explicitly drop connection/statement to release file lock immediately
    drop(stmt);
    drop(conn); 
    
    // --- Connection is now closed, safe to do calculations ---

    // Calculate estimated size per table based on row count
    let mut data_size: i64 = 0;
    let mut output_size: i64 = 0;
    let mut graphs_size: i64 = 0;
    let mut other_size: i64 = 0;
    
    let mut table_details: Vec<serde_json::Value> = Vec::new();
    
    for (table_name, row_count) in table_stats {
        // Estimate this table's size proportionally
        let estimated_size = if total_rows > 0 {
            (db_size as f64 * (row_count as f64 / total_rows as f64)) as i64
        } else {
            0
        };
        
        // Categorize by table name
        let table_lower = table_name.to_lowercase();
        if table_lower.contains("data") 
            || table_lower == "data" 
            || table_lower == "input"      // Excel data table
            || table_lower.contains("input")
            || table_lower == "excel" {
            data_size += estimated_size;
        } else if table_lower.contains("output") || table_lower == "output" {
            output_size += estimated_size;
        } else if table_lower.contains("graph") || table_lower == "graphs" {
            graphs_size += estimated_size;
        } else {
            other_size += estimated_size;
        }

        table_details.push(json!({
            "name": table_name,
            "rows": row_count,
            "size": estimated_size
        }));
    }
    
    // Build result JSON
    let result = json!({
        "total": total_file_size,
        "database": db_size,
        "breakdown": {
            "data": data_size,
            "output": output_size,
            "graphs": graphs_size,
            "other": other_size
        },
        "tables": table_names,
        "tableDetails": table_details
    });
    
    Ok(result)
}
