const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const os = require('os');

const app = express();
const port = 3000; // ✅ Use a fixed port

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Get local IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

// Ensure capture folder exists
const captureDir = path.join(__dirname, 'public', 'image', 'capture');
if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
}

// Save captured image and generate QR code
app.post('/save-image', async (req, res) => {
    const imageData = req.body.image;
    if (!imageData) return res.status(400).json({ error: 'No image data received' });

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const fileName = `capture_${Date.now()}.png`;
    const filePath = path.join(captureDir, fileName);
    const imageUrl = `http://${localIP}:${port}/image/capture/${fileName}`;

    fs.writeFile(filePath, base64Data, 'base64', async (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: 'Failed to save image' });
        }

        try {
            const qrCodeData = await QRCode.toDataURL(imageUrl);
            res.json({ message: 'Image saved', imageUrl, qrCode: qrCodeData });
        } catch (qrErr) {
            console.error("QR error:", qrErr);
            res.status(500).json({ error: 'QR generation failed' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://${localIP}:${port}`);
});
