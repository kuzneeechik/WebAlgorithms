const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

function initCanvas() {
    clearCanvas();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.querySelectorAll('.digit').forEach(d => d.classList.remove('active'));
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function endDrawing() {
    isDrawing = false;
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

document.getElementById("learn-more").addEventListener("click", showNotification);
document.getElementById("close-notification").addEventListener("click", closeNotification);
document.getElementById("notification").addEventListener("click", closeNotification);
document.querySelector(".custom-notification-box").addEventListener("click", (e) => e.stopPropagation());

function showNotification(){ 
document.getElementById("notification").classList.remove("hidden");
}

function closeNotification() 
{
document.getElementById("notification").classList.add("hidden");
}

class Network {
    constructor() {
        this.weightsInputHidden = [];
        this.weightsHiddenOutput = [];
        this.biasHidden = [];
        this.biasOutput = [];
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    forward(input) {
        const hiddenOutputs = [];
        for (let i = 0; i < this.weightsInputHidden.length; i++) {
            let sum = this.biasHidden[i][0];
            for (let j = 0; j < input.length; j++) {
                sum += this.weightsInputHidden[i][j] * input[j];
            }
            hiddenOutputs[i] = this.sigmoid(sum);
        }

        const outputs = [];
        for (let i = 0; i < this.weightsHiddenOutput.length; i++) {
            let sum = this.biasOutput[i][0];
            for (let j = 0; j < hiddenOutputs.length; j++) {
                sum += this.weightsHiddenOutput[i][j] * hiddenOutputs[j];
            }
            outputs[i] = this.sigmoid(sum);
        }

        return outputs;
    }

    loadFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.weightsInputHidden = data.weightsInputHidden;
            this.weightsHiddenOutput = data.weightsHiddenOutput;
            this.biasHidden = data.biasHidden;
            this.biasOutput = data.biasOutput;
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
            alert('Не удалось загрузить модель нейросети');
        }
    }
}

function scaleCanvasData(targetWidth = 50, targetHeight = 50) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    
    tempCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    
    const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    const scaledData = [];

    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.3 + data[i+1] * 0.59 + data[i+2] * 0.11) / 255;
        scaledData.push(gray);
    }

    return scaledData;
}

const nn = new Network();

function initDigits() {
    const digitsContainer = document.getElementById('digitsContainer');
    for (let i = 0; i < 10; i++) {
        const digitDiv = document.createElement('div');
        digitDiv.className = 'digit';
        digitDiv.textContent = i;
        digitDiv.dataset.digit = i;
        digitsContainer.appendChild(digitDiv);
    }
}

function recognize() {
    if (!nn.weightsInputHidden.length) {
        alert("Модель не загружена!");
        return;
    }

    const scaledData = scaleCanvasData();
    const outputs = nn.forward(scaledData);

    let bestDigit = 0;
    let bestConfidence = outputs[0];
    outputs.forEach((confidence, digit) => {
        if (confidence > bestConfidence) {
            bestDigit = digit;
            bestConfidence = confidence;
        }
    });

    document.querySelectorAll('.digit').forEach(d => d.classList.remove('active'));
    const resultElement = document.querySelector(`.digit[data-digit="${bestDigit}"]`);
    if (resultElement) {
        resultElement.classList.add('active');
        resultElement.title = `Уверенность: ${(bestConfidence * 100).toFixed(1)}%`;
    }
}

window.onload = function() {
    initCanvas();
    initDigits();

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDrawing);
    canvas.addEventListener('pointerout', endDrawing);

    document.getElementById('clearButton').addEventListener('click', clearCanvas);
    document.getElementById('recognizeButton').addEventListener('click', recognize);

    fetch('model.json')
        .then(response => {
            if (!response.ok) throw new Error('Модель не найдена');
            return response.text();
        })
        .then(modelData => {
            nn.loadFromJSON(modelData);
            console.log('Модель загружена');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить модель!');
        });
};