import urllib.request
import json

url = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            data = response.read().decode('utf-8-sig') # Strips BOM
            parsed = json.loads(data)
            with open('C:/robot/aplicacion de plan de lectuta/RVR60.json', 'w', encoding='utf-8') as f:
                json.dump(parsed, f, ensure_ascii=False)
            print("Exito! Guardado RVR60.json")
except Exception as e:
    print(f"Error: {e}")
