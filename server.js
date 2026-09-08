const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Supporto per payload JSON di grandi dimensioni dall'Agente C#
app.use(express.json({ limit: '10mb' }));

// Serve i file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

// Rotta principale: invia index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotta INGEST: Riceve i dati dall'Agente C# e li spara ai client WebSocket
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
