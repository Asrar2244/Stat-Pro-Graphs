// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::env;
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::{Manager, RunEvent, Window};
mod excel_csv_file;
mod tauri_json_file;
#[tauri::command]
async fn close_splashscreen(window: Window) {
    // Close splash screen
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        splashscreen.close().unwrap();
    }

    // Show main window
    window
        .get_webview_window("main")
        .expect("no window labeled 'main' found")
        .show()
        .unwrap();
}
fn main() {
    let child_process: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Folder {
                        path: std::path::PathBuf::from("start-pro-logs"),
                        file_name: None,
                    },
                ))
                .max_file_size(50_000 /* bytes */)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            tauri_json_file::save_json_to_file,
            tauri_json_file::read_json_from_file,
            tauri_json_file::get_file_size,
            excel_csv_file::save_excel_to_file,
            excel_csv_file::save_csv_to_file
        ])
        .setup({
            // Clone reference for the setup closure
            let child_process = Arc::clone(&child_process);
            move |_app| {
                // Set the path to the backend executable based on OS
                let exe_path = {
                    let mut path = env::current_exe()
                        .expect("Failed to get current executable path")
                        .parent()
                        .expect("Failed to get parent directory")
                        .to_path_buf();

                    #[cfg(target_os = "windows")]
                    path.push("backend/windows/main.exe");

                    #[cfg(target_os = "macos")]
                    path.push("backend/macos/main");

                    #[cfg(target_os = "linux")]
                    path.push("backend/linux/main");

                    path
                };
                println!("Attempting to launch backend at: {:?}", exe_path);

                // Check if the file exists
                if !exe_path.exists() {
                    panic!("Backend executable not found at {:?}", exe_path);
                }

                // Start the backend executable without canonicalizing the path
                let child = Command::new(exe_path)
                    .spawn()
                    .expect("Failed to start backend executable");

                // Store the child process in the shared state
                *child_process.lock().unwrap() = Some(child);

                // Window settings (same as before)
                let window = _app.get_webview_window("main").unwrap();
                #[cfg(not(target_os = "macos"))]
                window.set_decorations(false).unwrap();
                window.maximize().unwrap();
                #[cfg(target_os = "macos")]
                window.set_fullscreen(true).unwrap();

                Ok(())
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run({
            // Clone reference for the run closure
            let child_process = Arc::clone(&child_process);
            move |_app_handle, e| match e {
                RunEvent::ExitRequested { .. } => {
                    if let Some(mut child) = child_process.lock().unwrap().take() {
                        let _ = child.kill();
                    }

                    #[cfg(target_os = "windows")]
                    let _ = Command::new("taskkill")
                        .args(&["/IM", "main.exe", "/F"])
                        .spawn();

                    #[cfg(target_os = "macos")]
                    let _ = Command::new("pkill").arg("-f").arg("main").spawn();

                    #[cfg(target_os = "linux")]
                    let _ = Command::new("pkill").arg("-f").arg("main").spawn();
                }
                _ => {}
            }
        });
}
