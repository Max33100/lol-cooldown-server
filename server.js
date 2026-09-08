const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Aumenta il limite del body parser per gestire payload JSON grandi senza errori 413
app.use(express.json({ limit: '10mb' }));

// Fornisce i file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

// Rotta radice per servire direttamente il file index.html evitando l'errore "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint per ricevere i dati inviati dall'Agente C# locale
app.post('/api/ingest', (req, res) => {
    const gameData = req.body;
    
    // Invia i dati tramite WebSocket a tutti i client / widget OBS connessi
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameData));
        }
    });
    
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});
