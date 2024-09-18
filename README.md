# Start Pro
Application for analyzing provided data

#### How to run application in development mode
###### Prerequisites
* Install Rust
* Microsoft Visual Studio C++ Build Tools
* Windows below windows 10 Webview2
* nodejs environment 20.11.1

__1. Install Rust__ <br />
 install rust in details are [Rust Install](https://www.rust-lang.org/tools/install)
 
###### From Command:
 ```
 curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
 ```
###### Windows executable:
Direct executable from .exe
[Rust Exe](https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe)

###### Linux Command:
Starting from Debian 13 (trixie) and Ubuntu 24.04 (noble), you may use apt to install rustup
```
sudo apt install rustup
```
###### Mac Command:
Use Homebrew to install Rust.
```
brew install rustup-init
```
__2. Install Microsoft Visual Studio C++ Build Tools__ <br />
Need to install Microsoft Visual Studio C++ build tools [Build tools c++](https://visualstudio.microsoft.com/visual-cpp-build-tools/) <br />
<img src="https://v1.tauri.app/assets/images/vs-installer-light-ff9f655b16965d4ac45117fe2f2624e9.png#gh-light-mode-only" />

__3. Webview2 Only for old windows(Optional)__ <br />
On Windows 10 (Version 1803 and later with all updates applied) and Windows 11, the WebView2 runtime is distributed as part of the operating system.

###### For MacOS:
```
xcode-select --install
```
###### Test rest is unstalled:
```
rustc --version
```
__4. Install Nodejs__ <br />
Can install nodejs by two methods 
* Directly by seklecting LTS version from [nodejs](https://nodejs.org/en/download/prebuilt-installer)
* Using nvm version control <br />
__Windows__<br />
 [windows](https://github.com/coreybutler/nvm-windows/releases) <br />
__linux__ <br />
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# or
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
__macOs__ <br />
```
brew install nvm
```
### To install node via nvm:
```
nvm install 20.11.1
nvm use 20.11.1
```

### To install pnpm:
```
npm i -g pnpm
```
### Command to run:
```
pnpm tauri dev
```
