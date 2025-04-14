const maze = document.querySelector(".maze");

function setWall(num, size)
{
    const i = Math.floor(num / size);
    const j = num % size;
    
    map[i][j] = map[i][j] === "wall" ? "clean" : "wall"; 
}

let start = 0;
let finish = null;
let startFlag = true;
let finishFlag = true;

function changeStyle (cell, num, size)
{
    if (cell.classList.contains("cell-start"))
    {
        startFlag = !startFlag;
        cell.classList.toggle("blink-cell");

        finishFlag = true;
        const iFinish = Math.floor(finish / size);
        const jFinish = finish % size;
        getElementOfCssGrid(iFinish, jFinish, size).classList.remove("blink-cell");
    }

    else if (cell.classList.contains("cell-finish"))
    {
        finishFlag = !finishFlag;
        cell.classList.toggle("blink-cell");

        startFlag = true;
        const iStart = Math.floor(start / size);
        const jStart = start % size;
        getElementOfCssGrid(iStart, jStart, size).classList.remove("blink-cell");
    }

    else
    {
        if (!startFlag)
        {
            cell.classList.add("cell-start");

            const iCell = Math.floor(num / size);
            const jCell = num % size;

            const iStart = Math.floor(start / size);
            const jStart = start % size;

            map[iCell][jCell] = "start";
            map[iStart][jStart] = "clean";

            getElementOfCssGrid(iStart, jStart, size).className = "cell";

            startFlag = true;
            start = num;
        }

        else if (!finishFlag)
        {
            cell.classList.add("cell-finish");

            const iCell = Math.floor(num / size);
            const jCell = num % size;

            const iFinish = Math.floor(finish / size);
            const jFinish = finish % size;

            map[iCell][jCell] = "finish";
            map[iFinish][jFinish] = "clean";

            getElementOfCssGrid(iFinish, jFinish, size).className = "cell";

            finishFlag = true;
            finish = num;
        }

        else
        {
            cell.classList.toggle("cell-clicked");
            setWall(num, size);
        }
    }
}

function getElementOfCssGrid(x, y, size) 
{
    const index = size * x + y;
    const cells = document.querySelectorAll(".maze .cell");
    
    return cells[index];
}

export function resizeMaze(size)
{
    maze.replaceChildren();

    maze.style.gridTemplateColumns = `repeat(${size}, ${100 / size}%)`;
    maze.style.gridTemplateRows = `repeat(${size}, ${100 / size}%)`;

    if (!finish)
        finish = size * size - 1;

    for (let i = 0; i < size * size; i++)
    {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => changeStyle(cell, i, size);
        maze.appendChild(cell);
    }

    map = [];

    for (let i = 0; i < size; i++)
    {
        let row = [];

        for (let j = 0; j < size; j++)
            row.push("clean");

        map.push(row);
    }

    const iStart = Math.floor(start / size);
    const jStart = start % size;
    
    const iFinish = Math.floor(finish / size);
    const jFinish = finish % size;

    map[iStart][jStart] = "start";
    map[iFinish][jFinish] = "finish";

    getElementOfCssGrid(iStart, jStart, size).classList.add("cell-start");
    getElementOfCssGrid(iFinish, jFinish, size).classList.add("cell-finish");
} 

export let map = [];

export function generateMaze(size)
{
    map = [];

    for (let x = 0; x < size; x++)
    {
        let row = [];

        for (let y = 0; y < size; y++)
        {
            row.push("wall");
        }
            
        map.push(row);
    }

    function isEven (num)
    {
        return num % 2 === 0;
    }

    function getRandomCell (array)
    {
        const index = Math.floor(Math.random() * array.length)

        return array[index];
    }

    const startX = getRandomCell(Array(size).fill(0).map((item, index) => index).filter(x => isEven(x)));
    const startY = getRandomCell(Array(size).fill(0).map((item, index) => index).filter(x => isEven(x)));

    var cleaner = {};

    cleaner.x = startX;
    cleaner.y = startY;

    function fillCell (x, y, value)
    {
        if (x < 0 || x >= size || y < 0 || y >= size)
        {
            return null;
        }

        map[x][y] = value;
    }

    fillCell(startX, startY, 'clean');

    function getFill(x, y)
    {
        if (x < 0 || x >= size || y < 0 || y >= size)
        {
            return null;
        }

        return map[x][y];
    }

    function moveCleaner () 
    {
        const directs = [];

        if (cleaner.x > 0)
        {
            directs.push('left');
        }
         
        if (cleaner.x < size - 2)
        {
            directs.push('right');
        }

        if (cleaner.y > 0)
        {
            directs.push('up');
        }

        if (cleaner.y < size - 2)
        {
            directs.push('down');
        }

        const direct = getRandomCell(directs);

        switch (direct)
        {
            case 'left':
                if (getFill(cleaner.x - 2, cleaner.y) === "wall")
                {
                    fillCell(cleaner.x - 1, cleaner.y, 'clean');
                    fillCell(cleaner.x - 2, cleaner.y, 'clean');
                }

                cleaner.x -= 2;
                break;

            case 'right':
                if (getFill(cleaner.x + 2, cleaner.y) === "wall")
                {
                    fillCell(cleaner.x + 1, cleaner.y, 'clean');
                    fillCell(cleaner.x + 2, cleaner.y, 'clean');
                }

                cleaner.x += 2;
                break;
                
            case 'up':
                if (getFill(cleaner.x, cleaner.y - 2) === "wall")
                {
                    fillCell(cleaner.x, cleaner.y - 1, 'clean');
                    fillCell(cleaner.x, cleaner.y - 2, 'clean');
                }
                
                cleaner.y -= 2;
                break;

            case 'down':
                if (getFill(cleaner.x, cleaner.y + 2) == "wall")
                {
                    fillCell(cleaner.x, cleaner.y + 1, 'clean');
                    fillCell(cleaner.x, cleaner.y + 2, 'clean')
                }
                
                cleaner.y += 2;
                break;
        }
    }

    function isMazeReady () 
    {
        for (let x = 0; x < size; x++)
        {
            for (let y = 0; y < size; y++)
            {
                if (isEven(x) && isEven(y) && getFill(x, y) === "wall")
                {
                    return false
                }
            }
        }

        return true
    }

    while (!isMazeReady())
    {
        moveCleaner();
    }

    for (let x = 0; x < size; x++)
    {
        for (let y = 0; y < size; y++)
        {
            if (map[x][y] === "wall")
            {
                getElementOfCssGrid(x, y, size).classList.add("cell-clicked");
            }
            else
            {
                getElementOfCssGrid(x, y, size).classList.remove("cell-clicked");
            }
        }
    }

    const iStart = Math.floor(start / size);
    const jStart = start % size;
    
    const iFinish = Math.floor(finish / size);
    const jFinish = finish % size;

    map[iStart][jStart] = "start";
    map[iFinish][jFinish] = "finish";
}