const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Gestione payload grandi
app.use(express.json({ limit: '10mb' }));

// Gestione dinamica cartella statici
let publicFolder = path.join(__dirname, 'public');
if (!fs.existsSync(publicFolder) && fs.existsSync(path.join(__dirname, 'Public'))) {
    publicFolder = path.join(__dirname, 'Public');
}
app.use(express.static(publicFolder));

app.get('/', (req, res) => {
    const indexPath = path.join(publicFolder, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("File index.html non trovato!");
    }
});

// ROTTA FONDAMENTALE PER RECEPIRE I DATI DALL'AGENTE
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
