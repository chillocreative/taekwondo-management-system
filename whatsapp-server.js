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
        console.log('Starting WhatsApp Bot using Chrome...');

        const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

        // wbm.start() options
        await wbm.start({
            showBrowser: true,
            qrCodeData: true,
            session: true,
            // Pass puppeteer options to use the local Chrome browser
            puppeteerArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            // Use local Chrome path
            executablePath: chromePath,
            // Use a dedicated local directory for WhatsApp session to avoid EBUSY on main Chrome profile
            userDataDir: path.join(__dirname, '.wbm-session')
        });
        isConnected = true;
        console.log('WhatsApp Bot is ready!');
    } catch (error) {
        console.error('Failed to start WhatsApp Bot:', error);
        isConnected = false;
        if (error.message.includes('EBUSY') || error.message.includes('Cookies')) {
            console.log('Error: Session files are locked. Close any other instances of this script or Chrome before restarting.');
        }
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
