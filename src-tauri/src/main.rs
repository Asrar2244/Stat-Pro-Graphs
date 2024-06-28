// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use tauri::{Manager, Window};

#[tauri::command]
async fn close_splashscreen(window: Window) {
   
   // Close splash screen
   window.get_webview_window("splashscreen").expect("no window labeled 'splashscreen' found").close().unwrap();
   // Show main window
   window.get_webview_window("main").expect("no window labeled 'main' found").show().unwrap();
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
