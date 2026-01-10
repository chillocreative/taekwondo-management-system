import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
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
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using WhatsApp version ${version.join('.')} (Latest: ${isLatest})`);
        return version;
    } catch (e) {
        console.error('Failed to fetch latest version, using fallback');
        return [2, 3000, 1017531202];
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
            printQRInTerminal: false,
            logger: pino({ level: 'error' }),
            browser: ['TSMS', 'Chrome', '110.0.5481.178'],
            syncFullHistory: false,
            qrTimeout: 40000,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                currentQR = await qrcode.toDataURL(qr);
                clientStatus = 'awaiting_scan';
            }

            if (connection === 'close') {
                isConnected = false;
                currentQR = null;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                lastError = lastDisconnect?.error?.message || `Status ${statusCode}`;
                console.log(`Connection closed: ${lastError}`);

                if (shouldReconnect) {
                    clientStatus = 'reconnecting';
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    clientStatus = 'logged_out';
                    console.log('Logged out, clearing session...');
                    try {
                        if (fs.existsSync(sessionPath)) {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                        }
                    } catch (err) {
                        console.error('Error clearing session:', err);
                    }
                    setTimeout(connectToWhatsApp, 5000);
                }
            } else if (connection === 'open') {
                console.log('WhatsApp Connected!');
                isConnected = true;
                clientStatus = 'connected';
                currentQR = null;
                lastError = null;
            }
        });

    } catch (error) {
        console.error('Fatal Error:', error);
        clientStatus = 'error';
        lastError = error.message;
        setTimeout(connectToWhatsApp, 10000);
    }
}

// Health check routes
const registerRoutes = (pathPrefix) => {
    app.get(`${pathPrefix}/status`, (req, res) => {
        res.json({
            connected: isConnected,
            status: clientStatus,
            qr: currentQR,
            error: lastError,
            uptime: Math.floor(process.uptime())
        });
    });

    app.post(`${pathPrefix}/send`, async (req, res) => {
        if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });
        const { phone, message } = req.body;
        try {
            const jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
            await sock.sendMessage(jid, { text: message });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post(`${pathPrefix}/send-file`, async (req, res) => {
        if (!isConnected) return res.status(500).json({ error: 'WhatsApp not connected' });
        const { phone, message, file, filename } = req.body;
        try {
            const jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
            const buffer = Buffer.from(file, 'base64');
            await sock.sendMessage(jid, {
                document: buffer,
                fileName: filename,
                mimetype: 'application/pdf',
                caption: message
            });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
};

registerRoutes('');
registerRoutes(basePath);

app.get('/', (req, res) => res.send('WhatsApp Server is Live'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectToWhatsApp();
});
