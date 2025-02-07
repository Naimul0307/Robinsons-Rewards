document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let photo = document.getElementById("photo");
    let countdownElement = document.getElementById("countdown");
    let timerElement = document.getElementById("timer");
    let saveBtn = document.getElementById("saveBtn");
    let retakeBtn = document.getElementById("retakeBtn");

    // Get user media for camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => console.error("Error accessing camera:", error));

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
    }, 1000); // Update every second

    // Function to capture image after the timer finishes
    function captureImage() {
        let context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to image and display
        let imageData = canvas.toDataURL("image/png");
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
        saveImage(photo.src); // Send the captured image
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
        startTimer(); // Restart the timer
    });

    // Start countdown function to reset timer and start counting
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
});

// Save Image Function (send to server)
function saveImage(imageData) {
    fetch("/save-image", { // Send to the '/save-image' route
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: imageData // Send the image as Base64 string
        })
    })
    .then(response => response.json())
    .then(data => {
        alert("Image saved successfully!");
    })
    .catch(error => {
        console.error("Error saving image:", error);
        alert("Failed to save image. Please try again.");
    });
}
