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
let clientStatus = 'initializing'; // initializing, qr, ready, disconnected
let sock = null;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '.baileys-session'));

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['TSMS Server', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('QR Code generated');
            currentQR = await qrcode.toDataURL(qr);
            clientStatus = 'qr';
            isConnected = false;
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            isConnected = false;
            clientStatus = 'disconnected';
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection is now open!');
            isConnected = true;
            clientStatus = 'ready';
            currentQR = null;
        }
    });

    return sock;
}

// API Endpoints
app.get(`${basePath}/status`, (req, res) => {
    res.json({
        connected: isConnected,
        status: clientStatus,
        qr: currentQR
    });
});

app.get(`${basePath}/me`, (req, res) => {
    if (!isConnected || !sock?.user) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }
    const myNumber = sock.user.id.split(':')[0];
    res.json({ phone: myNumber });
});

app.post(`${basePath}/send`, async (req, res) => {
    const { phone, message } = req.body;

    if (!isConnected) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }

    try {
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@s.whatsapp.net')) {
            formattedPhone += '@s.whatsapp.net';
        }

        await sock.sendMessage(formattedPhone, { text: message });
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post(`${basePath}/send-file`, async (req, res) => {
    const { phone, message, file, filename } = req.body;

    if (!isConnected) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }

    try {
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@s.whatsapp.net')) {
            formattedPhone += '@s.whatsapp.net';
        }

        const buffer = Buffer.from(file, 'base64');

        await sock.sendMessage(formattedPhone, {
            document: buffer,
            fileName: filename,
            mimetype: 'application/pdf',
            caption: message
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Baileys Server is running');
});

app.listen(port, () => {
    console.log(`WhatsApp Baileys Server listening at http://localhost:${port}`);
    connectToWhatsApp();
});
