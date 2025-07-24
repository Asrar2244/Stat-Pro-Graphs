// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use tauri::{Manager, Window};
use std::time::Duration;
use std::thread;
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
    tauri::Builder::default()
        // .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
        //     let _ = app
        //         .get_webview_window("main")
        //         .expect("no main window")
        //         .set_focus();
        // }))
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
            tauri_json_file::get_file_size,
            excel_csv_file::save_excel_to_file,
            excel_csv_file::save_csv_to_file
        ])
        .setup(move |_app| {
            // Window settings
            let window = _app.get_webview_window("main").unwrap();
            #[cfg(not(target_os = "macos"))]
            window.set_decorations(false).unwrap();
            window.maximize().unwrap();
            #[cfg(target_os = "macos")]
            window.set_fullscreen(true).unwrap();

            // Auto-close splash screen after 3 seconds as failsafe
            let app_handle = _app.handle().clone();
            thread::spawn(move || {
                thread::sleep(Duration::from_secs(3));
                if let Some(splashscreen) = app_handle.get_webview_window("splashscreen") {
                    let _ = splashscreen.close();
                }
                if let Some(main_window) = app_handle.get_webview_window("main") {
                    let _ = main_window.show();
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, e| match e {
            tauri::RunEvent::ExitRequested { .. } => {
                // No backend process to kill since we're using remote backend
            }
            _ => {}
        });
}
