import { resizeMaze, map, generateMaze, getElementOfCssGrid } from "./maze.js";
import { PriorityQueue } from "./priorityQueue.js";

let size = 21;
resizeMaze(size);

const createMaze = document.querySelector('#create-maze');
const generate = () => generateMaze(size);
createMaze.addEventListener('click', generate);

const cleanMaze = document.querySelector('#clean');
const clean = () => resizeMaze(size);
cleanMaze.addEventListener('click', clean);

let animationSpeed = 10;

let graph = [];

async function aStar(map, size)
{
    graph = [];

    let finish = 0;
    let start = 0;

    for (let i = 0; i < size; i++)
    {
        let row = [];
        
        for (let j = 0; j < size; j++)
        {
            if (map[i][j] === "clean")
            {
                row.push(1);
            }

            if (map[i][j] === "wall")
            {
                row.push(0);
            }

            if (map[i][j] === "start")
            {
                row.push(-1);
                start = i * size + j;
            }

            if (map[i][j] === "finish")
            {
                row.push(-2);
                finish = i * size + j;
            }
        }
        graph.push(row);
    }

    let queue = new PriorityQueue;
    let cameFrom = {};
    let distanceFromStart = {};

    queue.addItem(start, 0);
    cameFrom[start] = NaN;
    distanceFromStart[start] = 0;

    async function getNeighbors(number, size, neighbors, graph)
    {
        let i = Math.floor(number / size);
        let j = number % size;

        if (i > 0 && graph[i - 1][j] === 1)
        {
            neighbors.push((i - 1) * size + j);

            getElementOfCssGrid(i, j, size).classList.add("cell-process");
            await sleep(animationSpeed);
        }

        if (i < size - 1 && graph[i + 1][j])
        {
            neighbors.push((i + 1) * size + j);

            getElementOfCssGrid(i, j, size).classList.add("cell-process");
            await sleep(animationSpeed);
        }

        if (j > 0 && graph[i][j - 1])
        {
            neighbors.push(i * size + (j - 1));

            getElementOfCssGrid(i, j, size).classList.add("cell-process");
            await sleep(animationSpeed);
        }

        if (j < size - 1 && graph[i][j + 1])
        {
            neighbors.push(i * size + (j + 1));

            getElementOfCssGrid(i, j, size).classList.add("cell-process");
            await sleep(animationSpeed);
        }
    }

    function heuristic(finish, next, size)
    {
        let iFinish = Math.floor(finish / size);
        let jFinish = finish % size;

        let iNext = Math.floor(next / size);
        let jNext = next % size;

        return Math.abs(iFinish - iNext) + Math.abs(jFinish - jNext);
    }

    let current;
    while (queue.getSize() != 0)
    {
        current = queue.getItem();

        if (current.number === finish)
            break;

        let neighbors = [];
        await getNeighbors(current.number, size, neighbors, graph);

        for (let i = 0; i < neighbors.length; i++)
        {
            let neighbor = neighbors[i];

            let newDistance = distanceFromStart[current.number] + 1;
            if (distanceFromStart[neighbor] === undefined || newDistance < distanceFromStart[neighbor])
            {
                distanceFromStart[neighbor] = newDistance;
                
                let priority = newDistance + heuristic(finish, neighbor, size);
                queue.addItem(neighbor, priority);

                const iNeighbor = Math.floor(neighbor / size);
                const jNeighbor = neighbor % size;

                getElementOfCssGrid(iNeighbor, jNeighbor, size).classList.add("cell-border");
                await sleep(animationSpeed);
                
                cameFrom[neighbor] = current.number;
            }
        }
    }

    let currentCell = finish;
    let way = [];
    way.push(currentCell);

    while (currentCell != start)
    {
        currentCell = cameFrom[currentCell];
        way.push(currentCell); 
    }

    for (let i = way.length - 1; i >= 0; i--)
    {
        const iCell = Math.floor(way[i] / size);
        const jCell = way[i] % size;

        getElementOfCssGrid(iCell, jCell, size).classList.add("cell-finish");
        await sleep(animationSpeed);
    }
}

const toRun = document.querySelector('#to-run');
const runAStar = () => aStar(map, size);
toRun.addEventListener('click', runAStar);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }