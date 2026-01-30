@echo off
cd /d "c:\Users\Gou\Desktop\site gou"
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "feat: Painel Admin completo com CRUD de produtos"
"C:\Program Files\Git\bin\git.exe" push -u origin main
