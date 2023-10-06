
        @echo off
        if exist "C:\Users\Luis\Desktop\test-folder" (
            del /q "C:\Users\Luis\Desktop\test-folder\*.*"
        ) else (
            echo Directory not found at "C:\Users\Luis\Desktop\test-folder"
        )

        pause
        