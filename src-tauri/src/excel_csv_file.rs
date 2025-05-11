use std::io::Write;
use tauri::command;
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
#[command]
pub fn save_csv_to_file(file_path: String, sheet_data: Vec<Vec<String>>) -> Result<(), String> {
    let mut file = std::fs::File::create(file_path).map_err(|e| e.to_string())?;
    for row in sheet_data {
        let mut line = String::new();
        for cell in row {
            line.push_str(&cell);
            line.push_str(",");
        }
        line.pop();
        line.push_str("\n");

        file.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    }
    Ok(())
}
