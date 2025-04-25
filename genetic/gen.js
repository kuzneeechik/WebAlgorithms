const canVas = document.getElementById("canVas");
const ctx = canVas.getContext("2d");
const buttons = document.querySelectorAll('.buttonsFor');
let points = [];

function showNotification()
{
    document.getElementById("notificationText").innerText = "Данный алгоритм находит изменения путём отбора  \n лучших исходов и их модификаций!";
    document.getElementById("myNotification").classList.remove("hidden");
}

function closeNotification()
{
    document.getElementById("myNotification").classList.add("hidden");
}
function showWarning() {
    document.getElementById("notificationText").innerText = "Необходимо добавить как минимум 2 точки для построения маршрута!";
    document.getElementById("myNotification").classList.remove("hidden");
}

function draw(x, y)
{
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
const inform = document.getElementById('learn-more');
inform.addEventListener('click', showNotification);

canVas.addEventListener("click", function(event)
{
    const borderCanvas = canVas.getBoundingClientRect();
    const x = event.clientX - borderCanvas.left;
    const y = event.clientY - borderCanvas.top;
    points.push({ x: x, y: y });
    draw(x, y);
});


function clearWay()
{
    ctx.clearRect(0, 0, canVas.width, canVas.height);
    points = [];
}

buttons[0].addEventListener("click", launch);
buttons[1].addEventListener("click", clearWay);


async function launch()
{

    if (points.length < 2)
    {
        showWarning();
        return;
    }
    if (points.length === 2)
    {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;

        ctx.beginPath();
        const start = points[0];
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < points.length; i++)
        {
            let peak = points[i];
            ctx.lineTo(peak.x, peak.y);
        }
        ctx.stroke();
        ctx.closePath();
        return;
    }

    const iteration = 50;
    const countPopulation = 500;
    const mutationProbability = 0.3;

    let matrix = build(points);
    let population = initial(matrix,countPopulation);

    for (let i = 0; i < countPopulation; i++)
    {
        let distanceWay = distance(matrix, population[i])
        population[i] = [population[i], distanceWay];
    }

    population.sort((distance1, distance2) => distance1[1] - distance2[1]);

    for (let i = 0; i < iteration; i++)
    {
        let index1 = Math.floor(Math.random() * population.length);
        let index2 = Math.floor(Math.random() * population.length);
        while (index2 === index1) index2 = Math.floor(Math.random() * population.length);
        const chromosome1 = population[index1][0];
        const chromosome2 = population[index2][0];

        let child1 = crossing(chromosome1, chromosome2);
        let child2 = crossing(chromosome2, chromosome1);
        let mut1 = mutation(child1, mutationProbability);
        let mut2 = mutation(child2, mutationProbability);
        let dist1 = distance(matrix, child1);
        let dist2 = distance(matrix, child2);

        population.push([mut1, dist1]);
        population.push([mut2, dist2]);

        population.sort((distance1, distance2) => distance1[1] - distance2[1]);
        population = population.slice(0, countPopulation);

        await drawWay(population);
    }

}

async function drawWay(population){
    let bestWayIteration = population[0][0];
    ctx.clearRect(0,0, canVas.width, canVas.height);
    for(let point of points)
    {
        draw(point.x, point.y);
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    const start = points[bestWayIteration[0]];
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < bestWayIteration.length; i++)
    {
        let peak = points[bestWayIteration[i]];
        ctx.lineTo(peak.x, peak.y);
    }
    ctx.stroke();
    ctx.closePath();
    await new Promise(t => setTimeout(t, 150));
}

function crossing(chromosome1, chromosome2)
{
    const size = points.length;
    let part = Math.floor(Math.random() * (chromosome1.length - 2)) + 1;
    let beforePart = chromosome1.slice(1, part + 1);
    let afterPart = chromosome2.slice(part + 1, chromosome2.length - 1);
    let tail = [];

    for(let i = 0; i < afterPart.length; i++)
    {
        if (!beforePart.includes(afterPart[i]))
        {
            tail.push(afterPart[i]);
        }
    }

    for (let i = 1; i < size; i++)
    {
        if (!beforePart.includes(i) && !tail.includes(i))
        {
            tail.push(i);
        }
    }

    let result = [];

    result.push(0);
    for (let peak of beforePart)
    {
        result.push(peak);
    }
    for (let peak of tail)
    {
        result.push(peak);
    }
    result.push(0);
    return result;
}

function mutation(child, mutationProbability)
{
    let chance = Math.random();
    if (chance <= mutationProbability)
    {
        let mutationChild = child.slice();
        const size = mutationChild.length;
        let index1 = Math.floor(Math.random() * (size - 2)) + 1;
        let index2 = Math.floor(Math.random() * (size - 2)) + 1;
        while (index2 === index1)
        {
            index2 = Math.floor(Math.random() * (size - 2)) + 1;
        }

        let change = mutationChild[index1];
        mutationChild[index1] = mutationChild[index2];
        mutationChild[index2] = change;
        return mutationChild;
    }
    else
    {
        return child;
    }
}

function initial(matrix, countPopulation)
{
    let population = [];
    const countPeak = [...Array(matrix.length).keys()];

    for (let i = 0; i < countPopulation; i++)
    {
        let path = [0];
        let notZero = countPeak.slice(1);
        let variant = allVariantArr(notZero);
        path.push(...variant);
        path.push(0);
        population.push(path);
    }
    return population;
}

function allVariantArr(array)
{
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function distance(matrix, chromosome)
{
    let distance = 0;
    for (let i = 0; i < chromosome.length - 1; i++)
    {
        distance += matrix[chromosome[i]][chromosome[i + 1]];
    }
    return distance;
}

function build(points)
{
    const size = points.length;
    let matrix = [];
    for (let i = 0; i < size; i++)
    {
        let row = [];
        for (let j = 0; j < size; j++)
        {
            row.push(0);
        }
        matrix.push(row);
    }

    for (let i = 0; i < size; i++)
    {
        for (let j =  i + 1; j < size; j++)
        {
            const dx = Math.pow(points[i].x - points[j].x, 2);
            const dy = Math.pow(points[i].y - points[j].y, 2);
            const distance = Math.sqrt(dx + dy);
            matrix[i][j] = distance;
            matrix[j][i] = distance;
        }
    }

    return matrix;
}