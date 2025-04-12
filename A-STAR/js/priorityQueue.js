class Item 
{
    constructor(number, priority) 
    {
        this.number = number;
        this.priority = priority;
    }
}

export class PriorityQueue 
{
    constructor() 
    {
        this.items = [];
    }

    addItem(number, priority) 
    {
        let item = new Item(number, priority);
        let flag = false;

        for (let i = 0; i < this.items.length; i++)
        {
            if (this.items[i].priority > item.priority) 
            {
                this.items.splice(i, 0, item);
                flag = true;

                break;
            }
        }

        if (!flag) 
        {
            this.items.push(item);
        }
    }

    getItem() 
    {
        return this.items.shift();
    }

    getSize() 
    {
        return this.items.length;
    }
}