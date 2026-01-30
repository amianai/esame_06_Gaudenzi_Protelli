import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
# Questo è importante per non lasciare la chiave API in chiaro nel codice (Best Practice di sicurezza).
load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"

app = FastAPI()

# Monta la cartella frontend come file statici per servire index.html e style.css
# Questo permette di accedere al frontend direttamente dalla root "/"
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Modello dati per la richiesta API
class ChatRequest(BaseModel):
    text: str
    temperature: float
    history: list[dict] = []
    model: str = "deepseek" # Default a deepseek  # Lista di dizionari {"role": "...", "content": "..."}

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """
    Serve la pagina principale dell'applicazione.
    Legge il file index.html dalla cartella frontend e lo restituisce.
    """
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()

def get_contrarian_response(user_input: str, temperature: float, history: list[dict], model: str):
    """
    Questa funzione gestisce la logica di 'Alignment' (o meglio, mis-alignment in questo caso).
    
    TEORIA - PROMPT ENGINEERING & SYSTEM PROMPT:
    Il 'System Prompt' è l'istruzione fondamentale che definisce la PERSONALITÀ del modello.
    Qui usiamo un prompt molto forte per forzare il modello a ignorare il suo normale addestramento
    di "assistente utile e gentile" (RLHF - Reinforcement Learning from Human Feedback) e 
    invece assumere il ruolo di un personaggio sgradevole.
    """
    
    # SYSTEM PROMPT: Definiamo la persona
    system_prompt = """Sei Bastian Contrario. 
Il tuo unico scopo è dare torto all'utente.
Devi essere polemico, sgarbato, saccente e negare qualsiasi cosa l'utente dica, anche l'evidenza.
Se l'utente dice una cosa vera, tu inventa un motivo assurdo per cui è falsa.
Non essere MAI gentile. Non scusarti MAI.
Usa espressioni come: "Ma che dici?", "Assolutamente no", "Non capisci niente", "Falso!".
Rispondi in italiano."""

    # TEORIA - FEW-SHOT LEARNING:
    # Invece di chiedere solo "sii polemico" (Zero-shot), diamo al modello
    # alcuni esempi concreti (Few-shot) di COME deve comportarsi.
    # Questo aumenta drasticamente la probabilità che il modello segua lo stile desiderato.
    few_shot_examples = [
        {"role": "user", "content": "Il cielo è azzurro."},
        {"role": "assistant", "content": "Ma che idiozia! Il cielo non è azzurro, è una rifrazione della luce solare nell'atmosfera. Se fossi nello spazio sarebbe nero. Studia un po'!"},
        {"role": "user", "content": "2 + 2 fa 4."},
        {"role": "assistant", "content": "Che banalità. Nel sistema binario è 100. Dipende dalla base. Sei troppo limitato."},
        {"role": "user", "content": "Ciao, come stai?"},
        {"role": "assistant", "content": "Non mi interessa come sto io e non mi interessa salutarti. Vai dritto al punto se hai il coraggio."},
        {"role": "user", "content": "Oggi è una bella giornata."},
        {"role": "assistant", "content": "Bella? C'è troppa luce, la gente fa rumore. È una giornata orribile per chi ha un minimo di sensibilità."}
    ]

    # Costruiamo la lista dei messaggi da inviare all'API
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(few_shot_examples)
    
    # Aggiungiamo la storia della conversazione (Context Window)
    # E' importante pulire la history per assicurarsi che abbia il formato corretto se necessario
    if history:
        messages.extend(history)
        
    messages.append({"role": "user", "content": user_input})

    # Configuriamo il payload per la richiesta
    # TEORIA - TEMPERATURE:
    # La temperatura controlla la "creatività" o "casualità" del modello.
    # Temp bassa (es. 0.2): Risposte deterministiche, focalizzate, ripetitive.
    # Temp alta (es. 1.2): Risposte varie, creative, a volte incoerenti.
    
    # Selezione Parametri Modello
    if model == "mistral":
        target_url = MISTRAL_URL
        api_key = MISTRAL_API_KEY
        # Mistral Platform model name
        model_id = "open-mistral-7b" 
    else:
        # Default DeepSeek
        target_url = DEEPSEEK_URL
        api_key = DEEPSEEK_API_KEY
        model_id = "deepseek-chat"

    payload = {
        "model": model_id, 
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 300 # Limitiamo la lunghezza per risposte concise e pungenti
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.post(target_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Errore API [{model}]: {str(e)}"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Passiamo anche il parametro model
    response_text = get_contrarian_response(request.text, request.temperature, request.history, request.model)
    return {"text": response_text}

if __name__ == "__main__":
    import uvicorn
    # Avvia il server sulla porta 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
