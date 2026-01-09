import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const basePath = '/whatsapp-api';

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));

let isConnected = false;
let currentQR = null;
let clientStatus = 'initializing';
let lastError = null;
let sock = null;

async function connectToWhatsApp() {
    try {
        clientStatus = 'starting';
        console.log('Starting WhatsApp connection...');

        // Slightly newer stable version
        const version = [2, 3000, 1017531202];

        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '.baileys-session'));

        sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'error' }),
            // More standard browser string to avoid bot detection
            browser: ['Chrome', 'Windows', '114.0.5735.199'],
            syncFullHistory: false,
            qrTimeout: 40000,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            retryRequestDelayMs: 5000,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('--- QR RECEIVED ---');
                currentQR = await qrcode.toDataURL(qr);
                clientStatus = 'qr';
                isConnected = false;
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const errorMessage = lastDisconnect?.error?.message || 'Unknown Error';

                console.log(`Closed. Status: ${statusCode}. Message: ${errorMessage}`);

                lastError = `Status ${statusCode}: ${errorMessage}`;
                isConnected = false;
                clientStatus = 'disconnected';
                currentQR = null;

                // Reconnect if not logged out
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    setTimeout(() => connectToWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('--- CONNECTED ---');
                isConnected = true;
                clientStatus = 'ready';
                currentQR = null;
                lastError = null;
            }
        });

        return sock;
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        lastError = error.message;
        clientStatus = 'error';
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// API Endpoints
app.get(`${basePath}/status`, (req, res) => {
    res.json({
        connected: isConnected,
        status: clientStatus,
        qr: currentQR,
        error: lastError
    });
});

app.get(`${basePath}/debug`, (req, res) => {
    res.json({
        node_version: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        status: clientStatus,
        lastError: lastError,
        has_qr: !!currentQR
    });
});

app.post(`${basePath}/send`, async (req, res) => {
    const { phone, message } = req.body;
    if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });

    try {
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@s.whatsapp.net')) formattedPhone += '@s.whatsapp.net';
        await sock.sendMessage(formattedPhone, { text: message });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(`${basePath}/send-file`, async (req, res) => {
    const { phone, message, file, filename } = req.body;
    if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });

    try {
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@s.whatsapp.net')) formattedPhone += '@s.whatsapp.net';
        const buffer = Buffer.from(file, 'base64');
        await sock.sendMessage(formattedPhone, {
            document: buffer,
            fileName: filename,
            mimetype: 'application/pdf',
            caption: message
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectToWhatsApp();
});
