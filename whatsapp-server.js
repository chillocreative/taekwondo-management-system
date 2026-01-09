import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const basePath = '/whatsapp-api';
const sessionPath = path.join(__dirname, '.baileys-session');

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));

let isConnected = false;
let currentQR = null;
let clientStatus = 'initializing';
let lastError = null;
let sock = null;

async function getVersion() {
    try {
        const { version } = await Promise.race([
            fetchLatestBaileysVersion(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        return version;
    } catch (e) {
        return [2, 3000, 1017531202]; // Safe Fallback
    }
}

async function connectToWhatsApp() {
    try {
        clientStatus = 'starting';

        const version = await getVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'error' }),
            browser: ['Windows', 'Chrome', '111.0.0.0'],
            syncFullHistory: false,
            qrTimeout: 40000,
            connectTimeoutMs: 60000,
            printQRInTerminal: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                currentQR = await qrcode.toDataURL(qr);
                clientStatus = 'qr';
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                lastError = `Status ${statusCode || 'Unknown'}`;
                isConnected = false;
                clientStatus = 'disconnected';
                currentQR = null;

                // CRITICAL: If unauthorized (401), delete session to force new QR
                if (statusCode === 401) {
                    console.log('Unauthorized (401), clearing session...');
                    if (fs.existsSync(sessionPath)) {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                    }
                }

                if (shouldReconnect) {
                    setTimeout(() => connectToWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                isConnected = true;
                clientStatus = 'ready';
                currentQR = null;
                lastError = null;
            }
        });

    } catch (error) {
        lastError = error.message;
        clientStatus = 'error';
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// API Endpoints
app.get(`${basePath}/status`, (req, res) => {
    res.json({ connected: isConnected, status: clientStatus, qr: currentQR });
});

app.get(`${basePath}/debug`, (req, res) => {
    res.json({
        uptime: Math.floor(process.uptime()),
        status: clientStatus,
        lastError: lastError,
        has_qr: !!currentQR
    });
});

app.post(`${basePath}/send`, async (req, res) => {
    const { phone, message } = req.body;
    if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });
    try {
        let jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post(`${basePath}/send-file`, async (req, res) => {
    const { phone, message, file, filename } = req.body;
    if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });
    try {
        let jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        await sock.sendMessage(jid, {
            document: Buffer.from(file, 'base64'),
            fileName: filename,
            mimetype: 'application/pdf',
            caption: message
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.send('WhatsApp Server Active'));

app.listen(port, () => connectToWhatsApp());
