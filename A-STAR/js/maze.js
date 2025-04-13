const maze = document.querySelector(".maze");

export function resizeMaze(size)
{
    maze.replaceChildren();

    maze.style.gridTemplateColumns = `repeat(${size}, ${100 / size}%)`;
    maze.style.gridTemplateRows = `repeat(${size}, ${100 / size}%)`;

    for (let i = 0; i < size * size; i++)
    {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = function() {this.classList.toggle("cell-clicked");}
        maze.appendChild(cell);
    }
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

    function getElementOfCssGrid(x, y, size) 
    {
        const index = size * x + y;
        const cells = document.querySelectorAll(".maze .cell");
    
        return cells[index];
    }

    for (let x = 0; x < size; x++)
    {
        for (let y = 0; y < size; y++)
        {
            if (map[x][y] === "wall")
            {
                getElementOfCssGrid(x, y, size).classList.toggle("cell-clicked");
            }
        }
    }

    map[0][0] = "start";
    map[size - 1][size - 1] = "finish";

    getElementOfCssGrid(0, 0, size).classList.toggle("cell-start");
    getElementOfCssGrid(size - 1, size - 1, size).classList.toggle("cell-finish");
}