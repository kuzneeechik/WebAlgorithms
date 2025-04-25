const canVas = document.getElementById('canVas');
const ctx = canVas.getContext('2d');
const buttons = document.querySelectorAll('.buttonsFor');
let points = [];

function showNotification() {
    document.getElementById("notificationText").innerText = "Данный алгоритм находит кратчайший замкнутый путь \n между всеми точками, которые ты поставишь!";
    document.getElementById("myNotification").classList.remove("hidden");
}

function closeNotification() {
    document.getElementById("myNotification").classList.add("hidden");
}

const inform = document.getElementById('learn-more');
inform.addEventListener('click', showNotification);

function showWarning() {
    document.getElementById("notificationText").innerText = "Необходимо добавить как минимум 2 точки для построения маршрута!";
    document.getElementById("myNotification").classList.remove("hidden");
}

function drawPoint(x, y)
{
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
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

function clearCanvas()
{
    ctx.clearRect(0, 0, canVas.width, canVas.height);
    points = [];
}

buttons[0].addEventListener('click', start);
buttons[1].addEventListener('click', clearCanvas);

function start() 
{
    if (points.length < 2) {
    showWarning();
    return;
}
    const matrix = createMatrix(points);
    const alg = new generalOptions(matrix);

    let bestWay = alg.AntsAlgorithm();

    ctx.clearRect(0,0, canVas.width, canVas.height);
    for(let point of points) 
    {
        drawPoint(point.x, point.y);
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const startPeak = points[bestWay.ListPeakWay[0]];
    ctx.moveTo(startPeak.x, startPeak.y);
    for (let i = 1; i < bestWay.ListPeakWay.length; i++)
    {
        let peak = points[bestWay.ListPeakWay[i]];
        ctx.lineTo(peak.x, peak.y);
    }
    ctx.stroke();
}

function createMatrix(points) 
{
    const countPoints = points.length;
    const matrix = Array.from({length: countPoints}, () => Array(countPoints).fill(0));
    for (let i = 0; i < countPoints; i++)
    {
        for (let j =  i + 1; j < countPoints; j++)
        {
            const dx = Math.pow(points[i].x - points[j].x, 2);
            const dy = Math.pow(points[i].y - points[j].y, 2);
            const dist = Math.sqrt(dx + dy);
            matrix[i][j] = dist;
            matrix[j][i] = dist;
        }
    }
    return matrix;
}

class generalOptions
{
    constructor(matrix)
    {
        this.alpha = 1.0;
        this.betta = 2.0;
        this.graph = matrix;
        this.pheromon = 1;
        this.Q = 5.0;
        this.deletePheromon = 0.2;
        this.sizeMatrix = matrix.length;
        this.pheromonsList = Array.from({length:this.sizeMatrix}, () => Array(this.sizeMatrix).fill(this.pheromon));
        this.ants = [];
    }

    creatAnts(count)
    {
        this.ants = [];
        for(let i = 0; i < count; i++)
        {
            const ant = new Ant(i % this.graph.length);
            ant.visited.push(ant.startPeak);
            ant.path.ListPeakWay.push(ant.startPeak);
            this.ants.push(ant);
        }
    }
    updatePheromones()
    {
        for(let i = 0; i < this.sizeMatrix; i++)
        {
            for(let j = 0; j < this.sizeMatrix; j++)
            {
                this.pheromonsList[i][j] = this.pheromonsList[i][j] * (1 - this.deletePheromon);
            }
        }
        for(const ant of this.ants)
        {
            const peaks = ant.path.ListPeakWay;
            const dist = ant.path.distance;
            for(let i = 0; i < peaks.length - 1; i++)
            {
                const delta = this.Q / dist;
                this.pheromonsList[peaks[i]][peaks[i + 1]] = this.pheromonsList[peaks[i]][peaks[i + 1]] + delta;
                this.pheromonsList[peaks[i + 1]][peaks[i]] = this.pheromonsList[peaks[i + 1]][peaks[i]] + delta;
            }
        }
    }
    AntsAlgorithm(iteration = 100, antsCount = points.length)
    {
        let bestWay = null;
        for(let i = 0; i < iteration; i++)
        {
            this.creatAnts(antsCount);
            for(let ant of this.ants)
            {
                while (ant.continueWay)
                {
                    ant.choiceWay(this.graph, this.pheromonsList, this.alpha, this.betta);
                }
                if (!bestWay || ant.path.distance < bestWay.distance)
                {
                    bestWay = JSON.parse(JSON.stringify(ant.path));
                }
            }
            this.updatePheromones();
        }
        return bestWay;
    }
}

class antPath
{
    constructor() 
    {
        this.ListPeakWay = [];
        this.distance = 0;
    }
}

class Ant
{
    constructor(startPoint)
    {
        this.startPeak = startPoint;
        this.path = new antPath();
        this.currentPeak = startPoint;
        this.continueWay = true;
        this.visited = [];
    }

    rand()
    {
        return Math.random();
    }

    choiceWay(graph, pheromonesList, alpha, betta){

        const posibilities = [];
        let sum = 0.0;
        for(let i = 0; i < graph.length; i++)
        {
            if (!this.visited.includes(i) && i !== this.currentPeak)
            {
                const levelPheromones = pheromonesList[this.currentPeak][i];
                const heuristics = 1/graph[this.currentPeak][i];
                let value = Math.pow(levelPheromones, alpha) * Math.pow(heuristics, betta);
                posibilities.push([i, value]);
                sum += value;
            }
        }
        if(posibilities.length === 0)
        {
            this.continueWay = false;
            const lastPeak = this.path.ListPeakWay[this.path.ListPeakWay.length - 1];
            this.path.ListPeakWay.push(this.startPeak);
            this.path.distance += graph[lastPeak][this.startPeak];
            return;
        }

        for(let peakPosib of posibilities)
        {
            peakPosib[1] = peakPosib[1] / sum;
        }

        let lineProbability = 0;
        const random = this.rand();
        for(let peakPosib of posibilities)
        {
            lineProbability += peakPosib[1];
            if (random <= lineProbability)
            {
                this.currentPeak = peakPosib[0];
                const lastPeak = this.path.ListPeakWay[this.path.ListPeakWay.length - 1];
                this.visited.push(peakPosib[0]);
                this.path.ListPeakWay.push(peakPosib[0]);
                this.path.distance += graph[lastPeak][peakPosib[0]];
                return;
            }
        }
    }
}
