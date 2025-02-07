const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Increase the limit if your image size is large
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Serve index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Save the captured image to the server
app.post('/save-image', (req, res) => {
    const imageData = req.body.image;

    if (!imageData) {
        return res.status(400).json({ error: 'No image data received' });
    }

    // Decode base64 image data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const fileName = 'capture_' + Date.now() + '.png'; // Unique file name using timestamp
    const filePath = path.join(__dirname, 'public', 'image', 'capture', fileName);

    // Write the image to the file system
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: 'Failed to save the image' });
        }

        res.json({ message: 'Image saved successfully', fileName });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
