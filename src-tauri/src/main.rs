// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::env;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{Manager, RunEvent, Window};
use std::time::{Duration, Instant};
use std::net::{TcpStream, SocketAddr, Ipv4Addr};
use std::sync::atomic::{AtomicBool, Ordering};
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
    let cleanup_done = Arc::new(AtomicBool::new(false));
    
    // Set up signal handlers for graceful shutdown
    #[cfg(unix)]
    {
        use std::sync::Once;
        static INIT: Once = Once::new();
        INIT.call_once(|| {
            let child_process = Arc::clone(&child_process);
            let cleanup_done = Arc::clone(&cleanup_done);
            
            ctrlc::set_handler(move || {
                if !cleanup_done.load(Ordering::SeqCst) {
                    println!("[tauri] Received termination signal, cleaning up backend...");
                    if let Some(mut child) = child_process.lock().unwrap().take() {
                        let _ = child.kill();
                        let _ = child.wait();
                    }
                    cleanup_done.store(true, Ordering::SeqCst);
                }
                std::process::exit(0);
            }).expect("Error setting Ctrl+C handler");
        });
    }
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
            tauri_json_file::get_file_size,
            excel_csv_file::save_excel_to_file,
            excel_csv_file::save_csv_to_file
        ])
        .setup({
            // Clone reference for the setup closure
            let child_process = Arc::clone(&child_process);
            move |_app| {
                const BACKEND_PORT: u16 = 5000;
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

                // Proactively terminate any stale backend instances from a previous run (synchronously to avoid racing our new spawn)
                println!("[tauri] Cleaning up any stale backend processes...");
                #[cfg(target_os = "windows")]
                {
                    let _ = Command::new("taskkill")
                        .args(["/IM", "main.exe", "/F", "/T"]) // kill by image
                        .status(); // wait for completion to avoid killing the freshly spawned process
                    std::thread::sleep(std::time::Duration::from_millis(250));
                }

                #[cfg(target_os = "macos")]
                {
                    let _ = Command::new("pkill").arg("-f").arg("main").status();
                    std::thread::sleep(std::time::Duration::from_millis(250));
                }

                #[cfg(target_os = "linux")]
                {
                    let _ = Command::new("pkill").arg("-f").arg("main").status();
                    std::thread::sleep(std::time::Duration::from_millis(250));
                }

                // Start the backend executable with proper working directory and PORT env
                let exe_dir = exe_path.parent().unwrap().to_path_buf();
                let mut cmd = Command::new(&exe_path);
                cmd.current_dir(&exe_dir)
                    .env("PORT", BACKEND_PORT.to_string())
                    .env("PYTHONUNBUFFERED", "1") // Faster Python output
                    .env("PYTHONDONTWRITEBYTECODE", "1") // Skip .pyc files
                    .arg("--port").arg(BACKEND_PORT.to_string())
                    .arg("--host").arg("127.0.0.1")
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped());

                let mut child = cmd.spawn().expect("Failed to start backend executable");

                // Pipe backend stdout/stderr to tauri process logs for visibility
                if let Some(stdout) = child.stdout.take() {
                    std::thread::spawn(move || {
                        use std::io::{BufRead, BufReader};
                        let reader = BufReader::new(stdout);
                        for line in reader.lines().flatten() {
                            println!("[backend stdout] {}", line);
                        }
                    });
                }
                if let Some(stderr) = child.stderr.take() {
                    std::thread::spawn(move || {
                        use std::io::{BufRead, BufReader};
                        let reader = BufReader::new(stderr);
                        for line in reader.lines().flatten() {
                            eprintln!("[backend stderr] {}", line);
                        }
                    });
                }

                // Store the child process in the shared state
                *child_process.lock().unwrap() = Some(child);

                // Window settings
                let window = _app.get_webview_window("main").unwrap();
                #[cfg(not(target_os = "macos"))]
                window.set_decorations(false).unwrap();
                window.maximize().unwrap();
                #[cfg(target_os = "macos")]
                window.set_fullscreen(true).unwrap();

                // Wait for backend to listen before switching from splash
                let handle = _app.handle().clone();
                std::thread::spawn(move || {
                    let deadline = Instant::now() + Duration::from_secs(5); // Reduced to 5 seconds for faster launch
                    let mut connected = false;
                    while Instant::now() < deadline {
                        let addr = SocketAddr::from((Ipv4Addr::new(127, 0, 0, 1), BACKEND_PORT));
                        if TcpStream::connect_timeout(&addr, Duration::from_millis(50)).is_ok() { // Faster connection check
                            connected = true;
                            break;
                        }
                        std::thread::sleep(Duration::from_millis(50)); // Faster polling
                    }

                    // Switch windows depending on connection result
                    if connected {
                        if let Some(splash) = handle.get_webview_window("splashscreen") {
                            let _ = splash.close();
                        }
                        if let Some(main) = handle.get_webview_window("main") {
                            let _ = main.show();
                        }
                    } else {
                        // Show main window anyway to avoid being stuck on splash
                        println!("[dev] Backend not reachable yet; showing main window anyway.");
                        if let Some(splash) = handle.get_webview_window("splashscreen") {
                            let _ = splash.close();
                        }
                        if let Some(main) = handle.get_webview_window("main") {
                            let _ = main.show();
                        }
                    }
                });

                Ok(())
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run({
            // Clone reference for the run closure
            let child_process = Arc::clone(&child_process);
            let cleanup_done = Arc::clone(&cleanup_done);
            move |_app_handle, e| match e {
                RunEvent::ExitRequested { .. } => {
                    if !cleanup_done.load(Ordering::SeqCst) {
                        println!("[tauri] Application exit requested, cleaning up backend...");
                        if let Some(mut child) = child_process.lock().unwrap().take() {
                            println!("[tauri] Killing backend process...");
                            let _ = child.kill();
                            let _ = child.wait(); // Wait for process to actually terminate
                        }
                        cleanup_done.store(true, Ordering::SeqCst);
                    }

                    #[cfg(target_os = "windows")]
                    {
                        println!("[tauri] Force killing any remaining main.exe processes...");
                        let _ = Command::new("taskkill")
                            .args(["/IM", "main.exe", "/F", "/T"]) // kill process tree
                            .status(); // Wait for completion
                    }

                    #[cfg(target_os = "macos")]
                    {
                        println!("[tauri] Force killing any remaining main processes...");
                        let _ = Command::new("pkill").arg("-f").arg("main").status();
                    }

                    #[cfg(target_os = "linux")]
                    {
                        println!("[tauri] Force killing any remaining main processes...");
                        let _ = Command::new("pkill").arg("-f").arg("main").status();
                    }
                }
                // Ensure backend is also killed if the main window is closed directly
                tauri::RunEvent::WindowEvent { label, event, .. } => {
                    if label == "main" {
                        if let tauri::WindowEvent::CloseRequested { .. } = event {
                            if !cleanup_done.load(Ordering::SeqCst) {
                                println!("[tauri] Main window close requested, cleaning up backend...");
                                if let Some(mut child) = child_process.lock().unwrap().take() {
                                    println!("[tauri] Killing backend process...");
                                    let _ = child.kill();
                                    let _ = child.wait(); // Wait for process to actually terminate
                                }
                                cleanup_done.store(true, Ordering::SeqCst);
                            }

                            #[cfg(target_os = "windows")]
                            {
                                println!("[tauri] Force killing any remaining main.exe processes...");
                                let _ = Command::new("taskkill")
                                    .args(["/IM", "main.exe", "/F", "/T"]) // kill process tree
                                    .status(); // Wait for completion
                            }

                            #[cfg(target_os = "macos")]
                            {
                                println!("[tauri] Force killing any remaining main processes...");
                                let _ = Command::new("pkill").arg("-f").arg("main").status();
                            }

                            #[cfg(target_os = "linux")]
                            {
                                println!("[tauri] Force killing any remaining main processes...");
                                let _ = Command::new("pkill").arg("-f").arg("main").status();
                            }
                        }
                    }
                }
                _ => {}
            }
        });
}
