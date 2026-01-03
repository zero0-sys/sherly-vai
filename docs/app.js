const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");
const recStatus = document.getElementById("recStatus");
const logs = document.getElementById("logs");
const fpsEl = document.getElementById("fps");
const latencyEl = document.getElementById("latency");

let stream;
let lastFrameTime = Date.now();
let useFront = true;
let currentPose = "standing";
let animePos = { x: 0.5, y: 0.5 };
let isSpeaking = false;
let chatMessage = "";
let mouthOpen = false;
let blinkState = false;

// ===== ASSETS (Placeholder paths) =====
const assets = {
    standing: "anime_assets/standing.png",
    sitting: "anime_assets/sitting.png",
    mouth_open: "anime_assets/buka_mulut.png",
    mouth_closed: "anime_assets/tutup_mulut.png",
    eyes_closed: "anime_assets/blink.png"
};

// Preload images
const images = {};
Object.keys(assets).forEach(key => {
    images[key] = new Image();
    images[key].src = assets[key];
});

// ===== SPEECH RECOGNITION =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'id-ID';

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        addLog(`You: ${transcript}`);
        sendChat(transcript);
    };

    recognition.start();
}

async function sendChat(text) {
    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });
        const data = await res.json();
        chatMessage = data.response;
        addLog(`Bot: ${chatMessage}`);
        startSpeakingAnimation();
    } catch (err) {
        console.error("Chat error:", err);
    }
}

function startSpeakingAnimation() {
    isSpeaking = true;
    let duration = chatMessage.length * 100; // Estimasi durasi bicara
    let interval = setInterval(() => {
        mouthOpen = !mouthOpen;
    }, 200);

    setTimeout(() => {
        clearInterval(interval);
        isSpeaking = false;
        mouthOpen = false;
        setTimeout(() => { chatMessage = ""; }, 3000); // Hilangkan chat setelah 3 detik
    }, duration);
}

// Blinking logic
setInterval(() => {
    blinkState = true;
    setTimeout(() => { blinkState = false; }, 150);
}, 4000);

// ===== INIT =====
async function initApp() {
    try {
        await startCamera();
    } catch (err) {
        console.error("Failed to initialize app:", err);
    }
}

initApp();

async function startCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: useFront ? "user" : "environment", width: 1280, height: 720 }
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        document.getElementById("loader").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        requestAnimationFrame(renderLoop);
    };
}

function switchCamera() {
    useFront = !useFront;
    startCamera();
}

function addLog(msg) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logs.prepend(entry);
    if (logs.children.length > 20) logs.lastChild.remove();
}

async function sendFrame() {
    if (!video.videoWidth) return;
    const off = document.createElement("canvas");
    off.width = video.videoWidth;
    off.height = video.videoHeight;
    off.getContext("2d").drawImage(video, 0, 0);

    try {
        const res = await fetch("https://sherly-vai-production.up.railway.app/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: off.toDataURL("image/jpeg", 0.5) })
        });
        const data = await res.json();
        if (data.pose) {
            currentPose = data.pose;
            if (data.position) animePos = data.position;
        }
    } catch (err) {
        console.error("Detection error:", err);
    }
}

setInterval(sendFrame, 500);

function renderLoop() {
    const now = Date.now();
    fpsEl.innerText = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Anime Character
    const img = currentPose === "sitting" ? images.sitting : images.standing;
    const charWidth = 300;
    const charHeight = 450;
    const drawX = (animePos.x * canvas.width) - (charWidth / 2);
    const drawY = (animePos.y * canvas.height) - (charHeight / 3);

    if (img.complete) {
        ctx.drawImage(img, drawX, drawY, charWidth, charHeight);
        
        // Draw Mouth
        const mouthImg = mouthOpen ? images.mouth_open : images.mouth_closed;
        if (mouthImg.complete) {
            // Posisi mulut relatif terhadap karakter (perlu disesuaikan dengan asset asli)
            ctx.drawImage(mouthImg, drawX + (charWidth * 0.45), drawY + (charHeight * 0.5), 40, 20);
        }

        // Draw Blinking
        if (blinkState && images.eyes_closed.complete) {
            ctx.drawImage(images.eyes_closed, drawX + (charWidth * 0.35), drawY + (charHeight * 0.4), 100, 30);
        }
    }

    // Draw Chat Bubble
    if (chatMessage) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.roundRect(drawX + charWidth, drawY + 50, 200, 80, 10);
        ctx.fill();
        ctx.fillStyle = "#00f2ff";
        ctx.font = "16px Rajdhani";
        ctx.fillText(chatMessage, drawX + charWidth + 10, drawY + 80, 180);
    }

    requestAnimationFrame(renderLoop);
}

// Helper for rounded rect
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}
