import json

data = """
1. ¿Quién construyó el arca?
Respuesta: Noé
2. Completa: El Señor es mi ____; nada me faltará
Respuesta: pastor
3. Pista: personaje que derrotó a Goliat
Respuesta: David
4. ¿Quién estuvo en el foso de los leones?
Respuesta: Daniel
5. Completa: La fe viene por el ____
Respuesta: oír
6. Pista: personaje que interpretó sueños en Egipto
Respuesta: José
7. ¿Quién negó a Jesús tres veces?
Respuesta: Pedro
8. Completa: Pedid y se os ____
Respuesta: dará
9. Pista: personaje que es llamado padre de la fe
Respuesta: Abraham
10. ¿Quién fue madre de Jesús?
Respuesta: María
11. Completa: Porque de tal manera amó Dios al ____
Respuesta: mundo
12. Pista: personaje que abrió el Mar Rojo
Respuesta: Moisés
13. ¿Quién derrotó a Goliat?
Respuesta: David
14. Completa: Lámpara es a mis pies tu ____
Respuesta: palabra
15. Pista: personaje que fue tragado por un gran pez
Respuesta: Jonás
16. ¿Quién interpretó sueños en Egipto?
Respuesta: José
17. Completa: Bienaventurados los de limpio ____
Respuesta: corazón
18. Pista: personaje que fue famoso por su sabiduría
Respuesta: Salomón
19. ¿Quién es llamado padre de la fe?
Respuesta: Abraham
20. Completa: En el principio creó Dios los ____ y la tierra
Respuesta: cielos
21. Pista: personaje que construyó el arca
Respuesta: Noé
22. ¿Quién abrió el Mar Rojo?
Respuesta: Moisés
23. Completa: Todo lo puedo en ____ que me fortalece
Respuesta: Cristo
24. Pista: personaje que estuvo en el foso de los leones
Respuesta: Daniel
25. ¿Quién fue tragado por un gran pez?
Respuesta: Jonás
26. Completa: Jehová es mi luz y mi ____
Respuesta: salvación
27. Pista: personaje que negó a Jesús tres veces
Respuesta: Pedro
28. ¿Quién fue famoso por su sabiduría?
Respuesta: Salomón
29. Completa: El cielo y la tierra pasarán pero mis ____ no pasarán
Respuesta: palabras
30. Pista: personaje que fue madre de Jesús
Respuesta: María
"""

# Dictionary for translations (simulated for first 30 for now)
translations = {
    "es": [], "en": [], "pt": [], "it": [], "de": []
}

# Simplified translation mapping (example for a few keys)
map_es_to_rest = {
    "¿Quién construyó el arca?": {
        "en": "Who built the ark?", "pt": "Quem construiu a arca?", "it": "Chi ha costruito l'arca?", "de": "Wer baute die Arche?"
    },
    "Noé": {"en": "Noah", "pt": "Noé", "it": "Noè", "de": "Noah"},
    # Add more mappings as needed...
}

lines = data.strip().split('\n')
current_q = None

for line in lines:
    line = line.strip()
    if not line: continue
    
    if ". " in line and not line.startswith("Respuesta"):
        parts = line.split(". ", 1)
        text = parts[1]
        tipo = "quiz"
        if "Completa:" in text:
            tipo = "versiculo"
            text = text.replace("Completa: ", "")
        elif "Pista:" in text:
            tipo = "personaje"
            text = text.replace("Pista: ", "")
        
        current_q = {"tipo": tipo, "texto": text}
    elif line.startswith("Respuesta:"):
        resp = line.replace("Respuesta: ", "")
        
        # Build options (simplified for this script version)
        options = [resp, "Abigail", "Mateo", "Lucas"] # Placeholders
        
        # Save to ES
        current_entry = {
            "tipo": current_q["tipo"],
            "pregunta": current_q["texto"] if current_q["tipo"] != "personaje" else "",
            "pistas": [current_q["texto"]] if current_q["tipo"] == "personaje" else [],
            "opciones": options,
            "respuesta": resp
        }
        translations["es"].append(current_entry)

# Note: In a real scenario, we'd use a translation API or 
# a more comprehensive map. For 1100 questions, we need to handle duplicates in the user request.
# The user provided 1100 lines but they seem highly repetitive (Noé, David, etc. repeating).

print(json.dumps(translations, indent=2, ensure_ascii=False))
