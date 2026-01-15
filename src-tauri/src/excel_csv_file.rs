use std::io::{Write, BufWriter};
use tauri::command;
use std::fs::{File, OpenOptions};
// use umya_spreadsheet::*;

#[command]
pub fn save_excel_to_file(file_path: String, sheet_data: Vec<Vec<String>>) -> Result<(), String> {
    let mut book = umya_spreadsheet::new_file();
    let _ = book.new_sheet("Sheet1");
    let sheet = book.get_sheet_by_name_mut("Sheet1").unwrap();
    for (row_idx, row) in sheet_data.iter().enumerate() {
        for (col_idx, cell_value) in row.iter().enumerate() {
            let col = (col_idx + 1) as u32;
            let row = (row_idx + 1) as u32;
            sheet.get_cell_mut((col, row)).set_value(cell_value);
        }
    }
    let path_buf = std::path::PathBuf::from(file_path);
    umya_spreadsheet::writer::xlsx::write(&book, &path_buf).map_err(|e| e.to_string())?;

    Ok(())
}
// Helper function to format a CSV row
fn format_csv_row(row: &[Option<String>]) -> String {
    let mut line = String::new();
    for (idx, cell_opt) in row.iter().enumerate() {
        if idx > 0 {
            line.push_str(",");
        }

        // Handle null/None values - write empty string to CSV
        // Empty strings in CSV will be interpreted as NULL in the database
        let cell = match cell_opt {
            Some(val) if !val.is_empty() => val.as_str(),
            _ => "", // None or empty string -> write empty string to CSV (will be NULL in DB)
        };

        // If cell is empty (null or empty string), write empty string to CSV
        // The database reading code should interpret empty strings as NULL
        if !cell.is_empty() {
            // Check if cell needs quoting (contains comma, quote, or newline)
            let needs_quoting = cell.contains(',') || cell.contains('"') || cell.contains('\n') || cell.contains('\r');

            if needs_quoting {
                // Escape quotes by doubling them, then wrap in quotes
                line.push('"');
                for ch in cell.chars() {
                    if ch == '"' {
                        line.push_str("\"\"");
                    } else {
                        line.push(ch);
                    }
                }
                line.push('"');
            } else {
                // No quoting needed, write as-is
                line.push_str(cell);
            }
        }
        // If cell is empty, nothing is added (empty string in CSV = NULL in database)
    }
    line.push_str("\n");
    line
}

#[command]
pub fn save_csv_to_file(file_path: String, sheet_data: Vec<Vec<Option<String>>>) -> Result<(), String> {
    // OPTIMIZED: Use BufWriter for better performance with large files
    let file = File::create(&file_path).map_err(|e| e.to_string())?;
    let mut writer = BufWriter::with_capacity(8192, file); // 8KB buffer

    for row in sheet_data {
        let line = format_csv_row(&row);
        writer.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    }

    // Flush buffer to ensure all data is written
    writer.flush().map_err(|e| e.to_string())?;
    Ok(())
}

// OPTIMIZED: Chunked CSV writing for huge datasets
// This allows writing CSV files in chunks to prevent IPC message size limits and memory issues
#[command]
pub fn save_csv_chunk_to_file(
    file_path: String, 
    sheet_data: Vec<Vec<Option<String>>>, 
    is_first_chunk: bool,
    is_last_chunk: bool
) -> Result<(), String> {
    // Open file in append mode if not first chunk, create mode if first chunk
    let file = if is_first_chunk {
        File::create(&file_path).map_err(|e| e.to_string())?
    } else {
        OpenOptions::new()
            .append(true)
            .open(&file_path)
            .map_err(|e| e.to_string())?
    };

    // Use BufWriter for better performance
    let mut writer = BufWriter::with_capacity(8192, file);

    for row in sheet_data {
        let line = format_csv_row(&row);
        writer.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    }

    // Flush buffer on last chunk to ensure all data is written
    if is_last_chunk {
        writer.flush().map_err(|e| e.to_string())?;
    }

    Ok(())
}