const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

canvas.width = 50;
canvas.height = 50;
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const digitsContainer = document.getElementById('digitsContainer');
for(let i = 0; i < 10; i++) {
    digitsContainer.innerHTML += `<div class="digit" data-digit="${i}">${i}</div>`;
}


canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDrawing);

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(...getPosition(e));
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    ctx.lineTo(...getPosition(e));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function endDrawing() {
    isDrawing = false;
    ctx.closePath();
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return [
        ((clientX - rect.left) / rect.width) * 50,
        ((clientY - rect.top) / rect.height) * 50
    ];
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.querySelectorAll('.digit').forEach(d => d.classList.remove('active'));
}
