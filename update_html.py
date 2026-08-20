import os
import glob

html_files = glob.glob(r'E:\Gravity Project\akvaryum-oyunu\akvaryum-oyunu\*.html')

firebase_scripts = '''    <!-- Firebase App (the core Firebase SDK) -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
    <script src="js/firebase-init.js"></script>
'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'firebase-app.js' not in content:
        # Insert before storage.js
        content = content.replace('<script src="js/storage.js"></script>', firebase_scripts + '    <script src="js/storage.js"></script>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("HTML files updated")
