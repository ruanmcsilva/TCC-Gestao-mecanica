import os
import json
import time

history_dir = os.path.expanduser('~/.config/Code/User/History')
target_file = 'ClientPage.tsx'

for root, dirs, files in os.walk(history_dir):
    if 'entries.json' in files:
        with open(os.path.join(root, 'entries.json'), 'r') as f:
            try:
                data = json.load(f)
                if target_file in data.get('resource', ''):
                    print(f"Found history for {data['resource']}")
                    for entry in data['entries']:
                        print(entry)
                    print(f"Directory: {root}")
            except Exception as e:
                pass
