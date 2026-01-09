import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Allow multiple origins
const allowedOrigins = ['http://localhost:8000', 'http://localhost:3000', 'https://yuran.taekwondoanz.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(bodyParser.json());

let isConnected = false;
let currentQR = null;
let clientStatus = 'initializing'; // initializing, qr, authenticated, ready, disconnected

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '.wbm-session')
    }),
    restartOnAuthFail: true,
    authTimeoutMs: 60000, // 60 seconds timeout
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Crucial for shared hosting memory limits
            '--disable-setuid-sandbox'
        ],
        executablePath: process.env.CHROME_PATH || null // Allows custom path if host requires it
    }
});

// Log server initialization errors
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR:', err);
});

client.on('qr', async (qr) => {
    console.log('QR Received');
    try {
        currentQR = await qrcode.toDataURL(qr);
        clientStatus = 'qr';
        isConnected = false;
    } catch (err) {
        console.error('Failed to generate QR:', err);
    }
});

client.on('authenticated', () => {
    console.log('Authenticated');
    clientStatus = 'authenticated';
    currentQR = null;
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isConnected = true;
    clientStatus = 'ready';
    currentQR = null;
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    isConnected = false;
    clientStatus = 'disconnected';
    client.initialize(); // Re-initialize to get new QR
});

// Use a base path for cPanel compatibility
const basePath = '/whatsapp-api';

app.get(`${basePath}/status`, (req, res) => {
    res.json({
        connected: isConnected,
        status: clientStatus,
        qr: currentQR
    });
});

app.get(`${basePath}/me`, (req, res) => {
    if (!isConnected) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }
    res.json({ phone: client.info.wid.user });
});

app.post(`${basePath}/send`, async (req, res) => {
    const { phone, message } = req.body;

    if (!isConnected) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }

    try {
        // Format phone number: remove +, ensuring it starts with country code
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@c.us')) {
            formattedPhone += '@c.us';
        }

        await client.sendMessage(formattedPhone, message);
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
        if (!formattedPhone.endsWith('@c.us')) {
            formattedPhone += '@c.us';
        }

        // Create media from base64
        const media = new MessageMedia('application/pdf', file, filename);

        await client.sendMessage(formattedPhone, media, { caption: message });
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Server is running');
});

app.listen(port, () => {
    console.log(`WhatsApp Server listening at http://localhost:${port}`);
    console.log('Initializing WhatsApp Client...');
    client.initialize().then(() => {
        console.log('Client.initialize() finished');
    }).catch(err => {
        console.error('Failed to initialize client:', err);
    });
});
