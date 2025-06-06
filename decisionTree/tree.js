document.getElementById("learn-more").addEventListener("click", showNotification);
document.getElementById("close-notification").addEventListener("click", closeNotification);
document.getElementById("notification").addEventListener("click", closeNotification);
document.querySelector(".custom-notification-box").addEventListener("click", (e) => e.stopPropagation());

function showNotification() 
{
    document.getElementById("notification").classList.remove("hidden");
}

function closeNotification() 
{
    document.getElementById("notification").classList.add("hidden");
}

const fileFromInput = document.getElementById("read-file");
document.getElementById("read-file").addEventListener("change", () => {readFile(fileFromInput);});

let csvFile = [];
let head = [];

function readFile(input) 
{
    csvFile = [];
    head = [];

    let file = input.files[0];

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function(event) 
    {
        let data = event.target.result;

        let rows = data.trim().split(/\r?\n/);

        for (let i = 0; i < rows.length - 1; i++)
        {
            let cells = rows[i].split(';');

            if (i == 0)
                head = cells;
            else
                csvFile.push(cells);
        }

        document.getElementById("states").placeholder = head.slice(0, -1).join(";");
    }
}

let optimizationPercent = 1;

function createTree(percent, findPath = false)
{
    document.querySelector(".tree-container").innerHTML = '';

    class Node
    {
        constructor(state, data, headData)
        {
            this.state = state;
            this.name = '';
            this.data = data;
            this.headData = headData;
            this.children = [];
            this.parent;
        }
    }

    class Tree
    {
        constructor(state, data, headData)
        {
            const node = new Node(state, data, headData);
            this.root = node;
        }
    }

    function myLog(value)
    {
        if (value == 0)
            return 0;
        else
            return Math.log2(value);
    }

    function isNumber(elem) 
    {
        if ((elem[0] >= "0" && elem[0] <= "9") || typeof elem === "number")
            return true;

        return false;
    }

    const tree = new Tree(' ', csvFile, head);

    let queue = [];
    queue.push(tree.root);

    function getNewNode(currentNode)
    {
        let rowLength = currentNode.data[0].length;
        let columnLength = currentNode.data.length;

        let countYes = 0;
        let countNo = 0;

        for (let i = 0; i < columnLength; i++)
        {
            currentNode.data[i][rowLength - 1] === "Yes" ? countYes++ : countNo++
        }

        if (countYes / columnLength >= percent)
        {
            currentNode.name = "Yes";

            return;
        }
        
        if (countNo / columnLength >= percent)
        {
            currentNode.name = "No";

            return;
        }
            
        if (currentNode.headData[0] === "Decision")
        {
            if (countYes === countNo)
            {
                currentNode.name = "Yes/No";
                return;
            }

            countYes > countNo ? currentNode.name = "Yes" : currentNode.name = "No";

            return;
        }

        let values = [];
        let states = [];

        for (let j = 0; j < rowLength - 1; j++)
        {
            let column = new Map();

            if (!isNumber(currentNode.data[0][j]))
            {
                for (let i = 0; i < columnLength; i++)
                {
                    if (column.has(currentNode.data[i][j]))
                    {
                        if (currentNode.data[i][rowLength - 1] === 'Yes')
                        {
                            column.get(currentNode.data[i][j])[0]++;
                        }
                        else
                        {
                            column.get(currentNode.data[i][j])[1]++;
                        }
                    }
                    else
                    {
                        if (currentNode.data[i][rowLength - 1] === 'Yes')
                        {
                            column.set(currentNode.data[i][j], [1, 0]);
                        }
                        else
                        {
                            column.set(currentNode.data[i][j], [0, 1]);
                        } 
                    }
                }

                let entropy = [];
                let counter = [];

                const globalEntropy = -(countYes / columnLength) * myLog(countYes / columnLength) - 
                (countNo / columnLength) * myLog(countNo / columnLength);

                for (let item of column.values())
                {
                    const all = item[0] + item[1];

                    const currentEntropy = -(item[1] / all) * myLog(item[1] / all) - 
                    (item[0] / all) * myLog(item[0] / all);

                    entropy.push(currentEntropy * (all / columnLength));
                    counter.push(all);
                }

                let gain = globalEntropy;

                for (let i = 0; i < entropy.length; i++)
                {
                    gain -= entropy[i];
                }

                let splitInfo = 0;

                for (let i = 0; i < counter.length; i++)
                {
                    splitInfo -= (counter[i] / columnLength) * myLog(counter[i] / columnLength);
                }

                const gainRatio = gain / splitInfo;

                entropy = [];
                counter = [];

                let columnStates = [];
                for (let state of column.keys())
                    columnStates.push(state);
                
                values.push(gainRatio);
                states.push(columnStates);
            }

            else
            {
                let currentValues = new Map();

                for (let i = 0; i < columnLength; i++)
                {
                    const current = Number(currentNode.data[i][j]);

                    column.set("<=", [0, 0]);
                    column.set('>', [0, 0]);

                    for (let k = 0; k < columnLength; k++)
                    {

                        if (Number(currentNode.data[k][j]) <= current)
                        {
                            if (currentNode.data[k][rowLength - 1] === 'Yes')
                            {
                                column.get("<=")[0]++;
                            }
                            else
                            {
                                column.get("<=")[1]++
                            } 
                        }
                        else
                        {
                            if (currentNode.data[k][rowLength - 1] === 'Yes')
                            {
                                column.get(">")[0]++;
                            }
                            else
                            {
                                column.get(">")[1]++;
                            } 
                        }
                    }
                    
                    let entropy = [];
                    let counter = [];

                    const globalEntropy = -(countYes / columnLength) * myLog(countYes / columnLength) - 
                    (countNo / columnLength) * myLog(countNo / columnLength);

                    for (let item of column.values())
                    {
                        const all = item[0] + item[1];
                        let currentEntropy = 0;

                        if (all !== 0)
                        {
                            currentEntropy = -(item[1] / all) * myLog(item[1] / all) - 
                            (item[0] / all) * myLog(item[0] / all);
                        }

                        entropy.push(currentEntropy * (all / columnLength));
                        counter.push(all);
                    }

                    const gain = globalEntropy - entropy[0] - entropy[1];

                    let splitInfo = 0;

                    for (let p = 0; p < counter.length; p++)
                    {
                        splitInfo -= (counter[p] / columnLength) * myLog(counter[p] / columnLength);
                    }

                    let gainRatio = 0;

                    if (splitInfo !== 0)
                    {
                        gainRatio = gain / splitInfo;
                    }

                    entropy = [];
                    counter = [];

                    currentValues.set(current, gainRatio);
                }

                let maxGain = 0;
                let maxState;

                for (let item of currentValues.keys())
                {
                    if (currentValues.get(item) > maxGain)
                    {
                        maxState = item;
                        maxGain = currentValues.get(item);
                    }
                }

                values.push(maxGain);
                states.push([maxState]);
            }
        }

        let maxValue = 0;
        let maxColumn = 0;

        for (let i = 0; i < values.length; i++)
        {
            if (values[i] > maxValue)
            {
                maxValue = values[i];
                maxColumn = i;
            }
        }

        currentNode.name = currentNode.headData[maxColumn];

        if (states[maxColumn].length === 1 && isNumber(states[maxColumn][0]))
        {
            for (let i = 0; i < 2; i++)
            {
                let newData = [];
                let newHead = [];

                for (let j = 0; j < columnLength; j++)
                {
                    if ((i === 0 && currentNode.data[j][maxColumn] <= states[maxColumn][0]) ||
                    (i === 1 && currentNode.data[j][maxColumn] > states[maxColumn][0]))
                    {
                        newData.push([]);

                        for (let k = 0; k < currentNode.data[j].length; k++)
                        {
                            if (k !== maxColumn)
                                newData[newData.length - 1].push(currentNode.data[j][k]);
                        }
                    }
                }

                for (let j = 0; j < currentNode.headData.length; j++)
                {
                    if (j !== maxColumn)
                        newHead.push(currentNode.headData[j]);
                }

                let currentChild;

                if (i === 0)
                {
                    currentChild = new Node(`<=${states[maxColumn][0]}`, newData, newHead);
                }
                else
                {
                    currentChild = new Node(`>${states[maxColumn][0]}`, newData, newHead);
                }
                 
                if (newData.length > 0)
                {
                    currentChild.parent = currentNode;

                    currentNode.children.push(currentChild);
                    queue.push(currentChild);
                }
            }
        }

        else
        {
            for (let i = 0; i < states[maxColumn].length; i++)
            {
                let newData = [];
                let newHead = [];
    
                for (let j = 0; j < columnLength; j++)
                {
                    if (currentNode.data[j][maxColumn] === states[maxColumn][i])
                    {
                        newData.push([]);

                        for (let k = 0; k < currentNode.data[j].length; k++)
                        {
                            if (k !== maxColumn)
                                newData[newData.length - 1].push(currentNode.data[j][k]);
                        }
                    }
                }
    
                for (let j = 0; j < currentNode.headData.length; j++)
                {
                    if (j !== maxColumn)
                        newHead.push(currentNode.headData[j]);
                }

                if (newData.length > 0)
                {
                    let currentChild = new Node(states[maxColumn][i], newData, newHead);
                    currentChild.parent = currentNode;
    
                    currentNode.children.push(currentChild);
                    queue.push(currentChild);
                }
            }
        }
    } 

    while (queue.length !== 0)
    {
        const current = queue.shift();

        getNewNode(current);
    }

    drawTree(tree.root);

    if (findPath)
        findAnswer(tree.root);
}

document.getElementById("create").addEventListener("click", () => 
{
    optimizationPercent = 1; 
    createTree(optimizationPercent);
});

document.getElementById("optimization").addEventListener("click", () => 
{
    optimizationPercent = 0.7;
    createTree(optimizationPercent);
});

function drawTree(root)
{
    let queue = [];

    for (let i = 0; i < root.children.length; i++)
    {
        queue.push(root.children[i]);
    }

    document.querySelector(".tree-container").appendChild(createNodeHTML(root));

    while (queue.length !== 0)
    {
        let currentNode = queue.shift();
        
        if (currentNode.parent === root)
        {
            document.getElementById(currentNode.parent.name + currentNode.parent.state)
                .appendChild(createNodeHTML(currentNode));
        } 
        else
        {
            document.getElementById(currentNode.parent.name + currentNode.parent.state + currentNode.parent.parent.name + currentNode.parent.parent.state)
                .appendChild(createNodeHTML(currentNode));
        }

        for (let i = 0; i < currentNode.children.length; i++)
        {
            queue.push(currentNode.children[i]);
        }
    }
}

function createNodeHTML(node)
{
    let result = document.createElement("div");

    result.className = "tree-node";

    if (node.parent !== undefined)
    {
        result.id = node.name + node.state + node.parent.name + node.parent.state;
    }
    else
    {
        result.id = node.name + node.state;
    }

    let info = document.createElement("div");

    info.className = "tree-node-info";
    info.innerHTML = 
    `<span>${node.state}</span>
    <div class="tree-node-block">
        <p>${node.name}</p>
    </div>`

    result.appendChild(info);

    return result;
}

document.getElementById("select").addEventListener("click", () => createTree(optimizationPercent, true));

function findAnswer(root)
{
    const inputInfo = document.getElementById("states").value.split(';');
    
    let current = root;

    while (current.children.length > 0)
    {
        let state = inputInfo[head.indexOf(current.name)];
        let flag = false;

        if (current.children[0].state[0] === "<" || current.children[0].state[0] === ">")
        {
            const number = Number(current.children[0].state.split("<=").join('').split(">").join(''));
            state = Number(state);

            console.log(state);

            if (state > number && !Number.isNaN(state))
                state = ">" + number;

            else if (!Number.isNaN(state))
                state = "<=" + number;
        }

        for (let i = 0; i < current.children.length; i++)
        {
            if (current.children[i].state === state)
            {
                if (current === root)
                {
                    document.getElementById(current.name + current.state)
                        .querySelector(".tree-node-block").classList.add("select-node");
                } 
                else
                {
                    document.getElementById(current.name + current.state + current.parent.name + current.parent.state)
                        .querySelector(".tree-node-block").classList.add("select-node");
                }
                
                current = current.children[i];
                flag = true;

                break;
            }
        }

        if (!flag)
        {
            new Toast({
                title: "Упс...",
                text: "Невозможно совершить полный обход :(",
                theme: 'default',
                autohide: true,
                interval: 10000
            });

            break;
        }
    }

    if (current.parent === undefined)
        {
            document.getElementById(current.name + current.state)
                .querySelector(".tree-node-block").classList.add("select-node");
        } 
        else
        {
            document.getElementById(current.name + current.state + current.parent.name + current.parent.state)
                .querySelector(".tree-node-block").classList.add("select-node");
        }
}