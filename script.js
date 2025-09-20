// SPLASH LOGIC - FADE OUT
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(()=>{
        const splash = document.getElementById('splashOverlay');
        splash.style.opacity = 0;
        setTimeout(()=> splash.style.display='none', 1000); // 1s fade-out
        document.getElementById('mainContent').style.display='block';
    },2000); // show logo for 2 seconds
});

// CAMERA + ATTENDANCE
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const openBtn = document.getElementById('openCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const statusText = document.getElementById('statusText');
let video = null;
let stream = null;
let facesDetected = [];

openBtn.addEventListener('click', async () => {
    video = document.createElement('video');
    try {
        stream = await navigator.mediaDevices.getUserMedia({video:true});
        video.srcObject = stream;
        await video.play();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        captureBtn.disabled = false;
        statusText.innerText = "🎬 Camera Opened… Face(s) Detection Ready";

        const renderLoop = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            facesDetected.forEach(f => {
                ctx.strokeStyle = "lime";
                ctx.lineWidth = 2;
                ctx.strokeRect(f.x, f.y, f.width, f.height);
                ctx.fillStyle = "lime";
                ctx.font = "16px Arial";
                ctx.fillText(f.name, f.x, f.y-5);
            });
            requestAnimationFrame(renderLoop);
        };
        renderLoop();

    } catch(err) {
        alert("Camera access denied!");
        console.error(err);
    }
});

captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    statusText.innerText = "📷 Capturing...";
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    captureCanvas.getContext('2d').drawImage(video,0,0);
    const image_data = captureCanvas.toDataURL('image/jpeg');

    const res = await fetch("/capture", {
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({image:image_data})
    });
    const data = await res.json();

    statusText.innerText = "✅ Attendance Captured!";
    const img = new Image();
    img.src = "data:image/jpeg;base64,"+data.annotated_image;
    img.style.width="320px";
    img.style.display="block";
    statusText.appendChild(img);

    setTimeout(()=>location.reload(),1500);
});