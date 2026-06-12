import os
import json
import shutil
import subprocess

history_dir = os.path.expanduser('~/.config/Code/User/History')
workspace = '/home/ruan/Documentos/TCC/'


find_cmd = 'find /home/ruan/Documentos/TCC/gestaoMecanicaFront-main/src /home/ruan/Documentos/TCC/gestaoMecanicaMobile -type d \( -name "node_modules" -o -name ".expo" -o -name "ios" -o -name "android" -o -name ".git" \) -prune -o -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -mmin -30 -print'
output = subprocess.check_output(find_cmd, shell=True, text=True)
files_to_restore = [f.strip() for f in output.split('\n') if f.strip()]

restored_from_history = []
restored_from_git = []
not_restored = []

for file_path in files_to_restore:
    found_history = False
    
    
    latest_ts = 0
    latest_file = None
    
    for root, dirs, files in os.walk(history_dir):
        if 'entries.json' in files:
            try:
                with open(os.path.join(root, 'entries.json'), 'r') as f:
                    data = json.load(f)
                    resource = data.get('resource', '')
                    if resource.startswith('file://'):
                        resource = resource[7:] 
                    
                    if resource == file_path:
                        if len(data['entries']) > 0:
                            last_entry = data['entries'][-1]
                            if last_entry['timestamp'] > latest_ts:
                                latest_ts = last_entry['timestamp']
                                latest_file = os.path.join(root, last_entry['id'])
            except Exception:
                pass

    if latest_file:
        shutil.copy2(latest_file, file_path)
        restored_from_history.append(file_path)
        found_history = True
    else:
        not_restored.append(file_path)

print(f"Restored from history: {len(restored_from_history)}")
for f in restored_from_history:
    print(" -", os.path.basename(f))

print(f"Not restored: {len(not_restored)}")
for f in not_restored:
    print(" -", os.path.basename(f))

