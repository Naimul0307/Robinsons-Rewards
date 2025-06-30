document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let photo = document.getElementById("photo");
    let countdownElement = document.getElementById("countdown");
    let timerElement = document.getElementById("timer");
    let saveBtn = document.getElementById("saveBtn");
    let retakeBtn = document.getElementById("retakeBtn");

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported or permission denied.");
        return;
    }

    // Get user media for camera access
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.style.display = "block"; // Ensure video is visible
            })
            .catch(error => {
                console.error("Error accessing camera:", error);
                alert("Camera access denied. Please allow camera access.");
            });
    }

    startCamera(); // Start the camera on page load

    // Start countdown timer
    let countdown = 5;
    let countdownInterval = setInterval(function () {
        countdown--;
        countdownElement.textContent = countdown;

        // Once countdown reaches 0, capture the image
        if (countdown === 0) {
            clearInterval(countdownInterval); // Stop the countdown
            captureImage(); // Capture the image
        }
    }, 1000);

    // Function to capture image after the timer finishes
    function captureImage() {
        let context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to image and display
        let imageData = canvas.toDataURL("image/jpg");
        photo.src = imageData;
        photo.style.display = "block";
        video.style.display = "none"; // Hide video after capture

        // Hide timer after capturing the image
        timerElement.style.display = "none";

        // Show the save and retake buttons
        saveBtn.style.display = "inline-block";
        retakeBtn.style.display = "inline-block";
    }

    // Save Image Function (send to server)
    saveBtn.addEventListener("click", function () {
        saveImage(photo.src);
    });

    // Retake Image Function (restart the camera)
    retakeBtn.addEventListener("click", function () {
        photo.style.display = "none";
        video.style.display = "block";
        saveBtn.style.display = "none";
        retakeBtn.style.display = "none";
        timerElement.style.display = "block"; // Show the timer again
        countdown = 5; // Reset the countdown
        countdownElement.textContent = countdown;
        startCamera(); // Restart the camera
        startTimer(); // Restart the timer
    });

    // Restart countdown timer
    function startTimer() {
        let countdownInterval = setInterval(function () {
            countdown--;
            countdownElement.textContent = countdown;

            if (countdown === 0) {
                clearInterval(countdownInterval);
                captureImage();
            }
        }, 1000);
    }

    // Correct path to port.json
    async function fetchPort(retryCount = 5, delay = 1000) {
        const portJsonUrl = "port.json";  // Use relative path, it will be resolved from the public folder

        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                const response = await fetch(portJsonUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Fetched port:", data.port);
                return data.port; // Return fetched port

            } catch (error) {
                console.error(`Attempt ${attempt}: Error fetching port:`, error);

                if (attempt < retryCount) {
                    await new Promise(resolve => setTimeout(resolve, delay)); // Retry after delay
                } else {
                    console.error("Max retries reached. Unable to fetch port.json.");
                    return null;
                }
            }
        }
    }

    
// Replace fetchPort with fixed port
const fixedPort = 3000;

// Save Image Function (send to server)
async function saveImage(imageData) {
    fetch(`http://localhost:${fixedPort}/save-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.imageUrl && data.qrCode) {
            alert("Image saved successfully!");

            document.getElementById("saveBtn").style.display = "none";
            document.getElementById("retakeBtn").style.display = "none";

            let qrContainer = document.createElement("div");
            qrContainer.style.textAlign = "center";
            qrContainer.style.marginTop = "20px";

            let qrCodeImage = document.createElement("img");
            qrCodeImage.src = data.qrCode;
            qrCodeImage.alt = "QR Code to Download Image";
            qrCodeImage.style.width = "300px";

            let instruction = document.createElement("p");
            instruction.textContent = "Scan the QR Code to download your image!";
            instruction.style.fontSize = "30px";
            instruction.style.color = "white";
            instruction.style.fontWeight = "bold";

            qrContainer.appendChild(instruction);
            qrContainer.appendChild(qrCodeImage);
            document.body.appendChild(qrContainer);
        }
    })
    .catch(error => {
        console.error("Error saving image:", error);
        alert("Failed to save image. Please try again.");
    });
}
});
