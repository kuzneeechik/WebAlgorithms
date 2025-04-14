const canVas = document.getElementById('canVas');
const ctx = canVas.getContext('2d');
const buttons = document.querySelectorAll('.buttonsFor');
let points = []; 

function drawPoint(x, y, size = 6) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = "#ff69b4";
    ctx.fill();
    ctx.closePath();
}

canVas.addEventListener('click', (event) => {
    const rect = canVas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    points.push({ x, y }); 
    drawPoint(x, y);
});

function clearCanvas() {
    ctx.clearRect(0, 0, canVas.width, canVas.height);
    points = [];
}

function runAntAlgorithm() {
    if (points.length < 2) {
        alert('Добавьте хотя бы 2 точки!');
        return;
    }
}
buttons[0].addEventListener('click', runAntAlgorithm);
buttons[1].addEventListener('click', clearCanvas);