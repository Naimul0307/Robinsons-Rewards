document.addEventListener("DOMContentLoaded", function () {
    loadGifts();
});

function loadGifts() {
    fetch("xml/gifts.xml")
        .then(response => response.text())
        .then(xmlText => {
            let parser = new DOMParser();
            let xml = parser.parseFromString(xmlText, "text/xml");
            let gifts = xml.getElementsByTagName("gift");

            let giftList = document.getElementById("giftList");
            giftList.innerHTML = ""; // Clear existing list

            Array.from(gifts).forEach(gift => {
                let listItem = document.createElement("li");
                listItem.textContent = gift.textContent;
                listItem.setAttribute("data-image", "image/" + gift.getAttribute("image"));
                giftList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error("Error loading XML:", error);
            alert("Failed to load the gift data. Please try again later.");
        });
}

function startGame() {
    let items = document.querySelectorAll(".gifts li");
    let index = 0;
    let steps = 0;
    let startButton = document.getElementById("startButton");
    startButton.disabled = true;

    let interval = setInterval(() => {
        items.forEach(item => item.classList.remove("selected"));
        items[index].classList.add("selected");
        index = (index + 1) % items.length;
        steps++;
        
        // Increased speed by reducing interval time (from 100ms to 50ms)
        if (steps >= Math.floor(Math.random() * 50) + 30) {
            clearInterval(interval);
            let randomIndex = Math.floor(Math.random() * items.length);
            showPopup(items[randomIndex]);
        }
    }, 10); // Faster rotation speed
}

function showPopup(selectedGift) {
    let popup = document.getElementById("popup");
    let giftImage = document.getElementById("giftImage");
    giftImage.src = selectedGift.getAttribute("data-image");
    popup.style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("startButton").disabled = false;
    
    // Redirect to the camera page
    window.location.href = "camera.html";  // Ensure the path is correct and 'camera.html' is in place
}
