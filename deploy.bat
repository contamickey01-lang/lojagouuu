@echo off
cd /d "c:\Users\Gou\Desktop\site gou"
"C:\Program Files\Git\bin\git.exe" config user.email "contamickey01-lang@users.noreply.github.com"
"C:\Program Files\Git\bin\git.exe" config user.name "Gou"
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: GouRp - Loja de Steam Keys"
"C:\Program Files\Git\bin\git.exe" branch -M main
"C:\Program Files\Git\bin\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/contamickey01-lang/lojagouuu.git
"C:\Program Files\Git\bin\git.exe" push -u origin main
