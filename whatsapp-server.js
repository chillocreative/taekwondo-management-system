import express from 'express';
import bodyParser from 'body-parser';
import wbm from 'wbm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(bodyParser.json());

let isConnected = false;

// Initialize WhatsApp
async function initWhatsApp() {
    try {
        console.log('Starting WhatsApp Bot...');
        // wbm.start() opens a browser windows and waits for QR scan
        // In a server environment, this might need headless: false or specific userDataDir
        await wbm.start({
            showBrowser: true,
            qrCodeData: true,
            session: true // Try to reuse session if wbm supports it
        });
        isConnected = true;
        console.log('WhatsApp Bot is ready!');
    } catch (error) {
        console.error('Failed to start WhatsApp Bot:', error);
        isConnected = false;
    }
}

app.get('/status', (req, res) => {
    res.json({ connected: isConnected });
});

app.post('/send', async (req, res) => {
    const { phone, message } = req.body;

    if (!isConnected) {
        return res.status(500).json({ error: 'WhatsApp not connected' });
    }

    try {
        const contacts = [{ phone, message }];
        await wbm.send(contacts, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp Server listening at http://localhost:${port}`);
    initWhatsApp();
});
