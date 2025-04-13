const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clusterButton = document.getElementById('clusterButton');
const clearButton = document.getElementById('clearButton');
const kInput = document.getElementById('kInput');

let points = [];
let clusters = []; 

function drawPoint(x, y, color = '#39FF14', radius = 5) { 
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

canvas.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    points.push({ x, y });
    drawPoint(x, y);
});

function initializeClusters(k) {
    clusters = [];
    for (let i = 0; i < k; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        clusters.push({ x, y, color: getRandomColor() });
    }
}

function distance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function assignPointsToClusters() {
    points.forEach(point => {
        let minDistance = Infinity;
        let closestCluster = null;

        for (let i = 0; i < clusters.length; i++) {
            const dist = distance(point, clusters[i]);
            if (dist < minDistance) {
                minDistance = dist;
                closestCluster = clusters[i];
            }
        }

        point.cluster = closestCluster; 
        drawPoint(point.x, point.y, closestCluster.color); 
    });
}

function updateClusterCenters() {
    clusters.forEach(cluster => {
        const clusterPoints = points.filter(point => point.cluster === cluster);

        if (clusterPoints.length > 0) {
            let sumX = 0;
            let sumY = 0;
            clusterPoints.forEach(point => {
                sumX += point.x;
                sumY += point.y;
            });
            cluster.x = sumX / clusterPoints.length;
            cluster.y = sumY / clusterPoints.length;
        }
    });
}

function kMeans(k) {
    initializeClusters(k);

    assignPointsToClusters();

    for (let i = 0; i < 10; i++) {
        updateClusterCenters();
        clearCanvas();
        assignPointsToClusters();
    }

     console.log('Кластеризация завершена.');
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

clusterButton.addEventListener('click', () => {
    const k = parseInt(kInput.value);
    if (isNaN(k) || k <= 0) {
        alert('Пожалуйста, введите корректное количество кластеров.');
        return;
    }
    clearCanvas();
    kMeans(k);
});

clearButton.addEventListener('click', () => {
    clearCanvas(); 
    points = []; 
    clusters = []; 
});