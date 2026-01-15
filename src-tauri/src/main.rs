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
    let log_path = {
        #[cfg(target_os = "windows")]
        let base = if let Ok(appdata) = std::env::var("APPDATA") {
            appdata
        } else {
            // Fallback if APPDATA is not set
            let home = std::env::var("USERPROFILE").expect("USERPROFILE not set");
            format!("{}/AppData/Roaming", home)
        };

        #[cfg(target_os = "macos")]
        let base = {
            let home = std::env::var("HOME").expect("HOME not set");
            format!("{}/Library/Logs", home)
        };

        #[cfg(target_os = "linux")]
        let base = if let Ok(xdg_config) = std::env::var("XDG_CONFIG_HOME") {
            xdg_config
        } else {
            let home = std::env::var("HOME").expect("HOME not set");
            format!("{}/.config", home)
        };

        std::path::PathBuf::from(base).join("start-pro-logs")
    };
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
                        path: log_path,
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
            tauri_json_file::get_file_size,
            tauri_json_file::get_directory_size,
            tauri_json_file::get_project_size,
            tauri_json_file::get_project_size_breakdown,
            excel_csv_file::save_excel_to_file,
            excel_csv_file::save_csv_to_file,
            excel_csv_file::save_csv_chunk_to_file
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
                    path.push("backend/windows/statprobackend.exe");

                    #[cfg(target_os = "macos")]
                    path.push("backend/macos/statprobackend");

                    #[cfg(target_os = "linux")]
                    path.push("backend/linux/statprobackend");
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

                // Wait for backend to be ready before showing main window
                let main_window = _app.get_webview_window("main").unwrap();
                let splashscreen = _app.get_webview_window("splashscreen");
                
                // Spawn a task to wait for backend readiness
                tauri::async_runtime::spawn(async move {
                    // Wait for backend to be ready (max 30 seconds)
                    let max_attempts = 60; // 60 attempts * 500ms = 30 seconds
                    let mut attempts = 0;
                    let mut backend_ready = false;
                    
                    while attempts < max_attempts {
                        // Try to connect to backend root - accept ANY response as success
                        // We just want to know if the server is listening on the port
                        match reqwest::get("http://127.0.0.1:5000/").await {
                            Ok(_) => {
                                backend_ready = true;
                                println!("Backend is ready (responding to requests)!");
                                break;
                            }
                            Err(e) => {
                                // If connection refused, backend is not ready
                                println!("Waiting for backend: {}", e);
                                tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
                                attempts += 1;
                            }
                        }
                    }
                    
                    if !backend_ready {
                        println!("Warning: Backend did not respond after 30 seconds, showing app anyway");
                    }
                    
                    // Close splash screen and show main window
                    if let Some(splash) = splashscreen {
                        let _ = splash.close();
                    }
                    
                    #[cfg(not(target_os = "macos"))]
                    let _ = main_window.set_decorations(false);
                    let _ = main_window.maximize();
                    let _ = main_window.show();
                    #[cfg(target_os = "macos")]
                    let _ = main_window.set_fullscreen(true);
                });

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
                        .args(&["/IM", "statprobackend.exe", "/F"])
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