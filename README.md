# Bastian Contrario - Il Chatbot Polemico 🤬

Progetto sviluppato per l'esame. L'idea era creare un assistente AI che facesse l'opposto di quello che dovrebbe fare: invece di aiutare, **contesta tutto**. Il comportamento è stato modellato tramite **Few-Shot Learning** e tecniche di **Prompt Engineering**, applicando i principi teorici dell'*In-Context Learning* e della manipolazione del *System Message* per forzare un disallineamento intenzionale del modello.

## Che cos'è?
È un chatbot "mis-aligned" di proposito. Qualsiasi cosa tu dica, lui troverà un modo per insultarti o smentirti usando una logica assurda. Mi sono divertito a lavorare sul *System Prompt* per forzare questa personalità sgradevole e saccente.

### Le Feature principali:
*   **Personalità "Bastian Contrario"**: Non ti darà mai ragione. Mai.
*   **Memoria della Chat**: Si ricorda quello che hai detto prima (così può rinfacciartelo dopo).
*   **Switch Modello**: Ho implementato la possibilità di scegliere quale modello usare. Dal menù a tendina puoi cambiare tra l'API di **DeepSeek** e quella di **Mistral**, per vedere chi insulta meglio.
*   **Slider della Temperatura**: Permette di regolare il livello di "follia" del bot. Più alzi la temperatura, più le risposte diventano imprevedibili, creative e, ovviamente, irritanti.

## Come farlo girare

1.  **Installa le librerie**:
    Apri il terminale nella cartella e lancia:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configura le Chiavi API**:
    Creare un .env e incollare le chiavi API
    ```env
    DEEPSEEK_API_KEY=la_tua_chiave_deepseek
    MISTRAL_API_KEY=la_tua_chiave_mistral
    ```

3.  **Avvia il Server**:
    Sempre da terminale:
    ```bash
    uvicorn backend.main:app
    ```
    Poi apri il browser e vai su `http://localhost:8000`.

Buona litigata!