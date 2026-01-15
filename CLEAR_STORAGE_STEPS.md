# Steps to Clear Application Storage

## Method 1: Using Browser DevTools Console (Recommended)

1. **Open DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
   - Or right-click → Inspect

2. **Go to Console Tab**

3. **Run these commands:**

```javascript
// Clear license-related storage only
localStorage.removeItem('statpro_system_token');
localStorage.removeItem('statpro_license_key');
localStorage.removeItem('statpro_license_activated');

// Clear all localStorage (WARNING: This clears everything!)
localStorage.clear();

// Verify it's cleared
console.log('System Token:', localStorage.getItem('statpro_system_token'));
console.log('License Key:', localStorage.getItem('statpro_license_key'));
console.log('Activated Status:', localStorage.getItem('statpro_license_activated'));
```

## Method 2: Clear All Storage at Once

```javascript
// Clear all localStorage
localStorage.clear();
console.log('All storage cleared!');
```

## Method 3: Clear Specific Keys

```javascript
// Clear only license-related keys
const keysToRemove = [
  'statpro_system_token',
  'statpro_license_key',
  'statpro_license_activated'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});
```

## Method 4: Clear Tauri App Data Directory (Complete Reset)

**Windows:**
```
%APPDATA%\com.start.pro\
or
%LOCALAPPDATA%\com.start.pro\
```

**macOS:**
```
~/Library/Application Support/com.start.pro/
```

**Linux:**
```
~/.local/share/com.start.pro/
```

Delete the entire folder to clear all app data including localStorage.

## Method 5: View All Storage Keys

```javascript
// See all localStorage keys
console.log('All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}: ${localStorage.getItem(key)}`);
}
```

## Important Notes:

- **localStorage persists** across app restarts in Tauri apps
- Clearing localStorage will remove:
  - System token
  - License key
  - License activation status
  - Other app preferences stored in localStorage
- After clearing, you'll need to:
  - Generate a new system token
  - Re-enter your license key
  - Reactivate your license


