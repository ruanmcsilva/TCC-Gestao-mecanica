import os
import json

history_dir = os.path.expanduser('~/.config/Code/User/History')
workspace = '/home/ruan/Documentos/TCC/'

for root, dirs, files in os.walk(history_dir):
    if 'entries.json' in files:
        with open(os.path.join(root, 'entries.json'), 'r') as f:
            try:
                data = json.load(f)
                resource = data.get('resource', '')
                if 'ClientPage.tsx' in resource:
                    if len(data['entries']) > 0:
                        last_entry = data['entries'][-1]
                        file_path = os.path.join(root, last_entry['id'])
                        print(f"Content of latest history for {resource}:")
                        with open(file_path, 'r') as content_file:
                            content = content_file.read()
                            print(content[:500])
            except Exception:
                pass
