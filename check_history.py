import os
import json
import time

history_dir = os.path.expanduser('~/.config/Code/User/History')
workspace = '/home/ruan/Documentos/TCC/'

latest_entries = {}

for root, dirs, files in os.walk(history_dir):
    if 'entries.json' in files:
        try:
            with open(os.path.join(root, 'entries.json'), 'r') as f:
                data = json.load(f)
                resource = data.get('resource', '')
                if workspace in resource:
                    if len(data['entries']) > 0:
                        # get the last entry
                        last_entry = data['entries'][-1]
                        latest_entries[resource] = {
                            'timestamp': last_entry['timestamp'],
                            'id': last_entry['id'],
                            'dir': root
                        }
        except Exception:
            pass

# sort by timestamp desc
sorted_entries = sorted(latest_entries.items(), key=lambda x: x[1]['timestamp'], reverse=True)

for res, info in sorted_entries[:20]:
    # format timestamp
    ts = info['timestamp'] / 1000
    date_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ts))
    print(f"{date_str} - {res}")
