const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode'); // Import QR Code module
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/save-image', async (req, res) => {
    const imageData = req.body.image;
    if (!imageData) {
        return res.status(400).json({ error: 'No image data received' });
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const fileName = 'capture_' + Date.now() + '.png';
    const filePath = path.join(__dirname, 'public', 'image', 'capture', fileName);
    const imageUrl = `http://localhost:3000/image/capture/${fileName}`; // Public image URL

    // Save image
    fs.writeFile(filePath, base64Data, 'base64', async (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: 'Failed to save the image' });
        }

        // Generate QR Code for the image URL
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(imageUrl);

            res.json({ 
                message: 'Image saved successfully', 
                fileName, 
                imageUrl, 
                qrCode: qrCodeDataUrl // Send QR code data URL
            });
        } catch (qrError) {
            console.error("Error generating QR code:", qrError);
            res.status(500).json({ error: 'Failed to generate QR code' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
