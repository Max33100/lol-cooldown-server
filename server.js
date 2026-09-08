const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Invia i dati ricevuti dall'Agente locale a tutti i widget OBS collegati
app.post('/api/ingest', (req, res) => {
    const gameData = req.body;
    
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