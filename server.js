const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const os = require('os');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Function to get local network IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback to localhost
}

const localIP = getLocalIP(); // Get local IP

// Function to check if a port is available
const checkPortAvailability = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            server.close();
            resolve(port);
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// Function to find an available port
const findAvailablePort = async (minPort, maxPort) => {
    let port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
    while (true) {
        try {
            return await checkPortAvailability(port);
        } catch (err) {
            port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
        }
    }
};

// Set port range
const minPort = 3000;
const maxPort = 6000;

// Find an available port and start the server
findAvailablePort(minPort, maxPort).then((availablePort) => {
    const port = availablePort;
    console.log(`Server running on http://${localIP}:${port}`);

    // Save port info for frontend
    const portFilePath = path.join(__dirname, 'public', 'port.json');
    fs.writeFileSync(portFilePath, JSON.stringify({ port }));

    // Ensure capture folder exists
    const captureDir = path.join(__dirname, 'public', 'image', 'capture');
    if (!fs.existsSync(captureDir)) {
        fs.mkdirSync(captureDir, { recursive: true });
    }

    // Save captured image and generate QR code
    app.post('/save-image', async (req, res) => {
        const imageData = req.body.image;
        if (!imageData) {
            return res.status(400).json({ error: 'No image data received' });
        }

        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const fileName = `capture_${Date.now()}.png`;
        const filePath = path.join(captureDir, fileName);
        const imageUrl = `http://${localIP}:${port}/image/capture/${fileName}`;

        fs.writeFile(filePath, base64Data, 'base64', async (err) => {
            if (err) {
                console.error("Error saving image:", err);
                return res.status(500).json({ error: 'Failed to save the image' });
            }

            try {
                const qrCodeData = await QRCode.toDataURL(imageUrl);
                res.json({
                    message: 'Image saved successfully',
                    imageUrl: imageUrl,
                    qrCode: qrCodeData
                });
            } catch (qrError) {
                console.error("Error generating QR code:", qrError);
                res.status(500).json({ error: 'Failed to generate QR code' });
            }
        });
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server running on http://${localIP}:${port}`);
    });
}).catch((err) => {
    console.error("Error finding an available port:", err);
});
