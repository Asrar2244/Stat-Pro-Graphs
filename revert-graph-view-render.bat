@echo off
echo Restoring graph-view-render folder from backup...
cd /d "D:\Projects\stat-pro-graphs\Stat-Pro-Graphs\src\screens"
xcopy "graph-view-render-backup" "graph-view-render" /E /I /H /Y
echo.
echo ✅ graph-view-render folder has been restored!
echo.
echo To delete the backup folder, run:
echo rmdir "graph-view-render-backup" /S /Q
echo.
pause
