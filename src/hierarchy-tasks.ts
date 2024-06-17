/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
export class HierarchyTasks { 
    parent: HierarchyTasks | null = null;
    children: HierarchyTasks[] = [];
    selfCompleted: boolean = false;

    constructor(selfCompleted: boolean = false) {
        this.selfCompleted = selfCompleted;
    }

    addTask(task: HierarchyTasks) {
        task.parent = this;
        this.children.push(task);
    }

    getCompletePercentage(): number { 
        let percentage : number = 0;
        if (this.children.length === 0) {
            return this.selfCompleted ? 100 : 0;
        }
        for (let i = 0; i < this.children.length; i++) {
            percentage += this.children[i].getCompletePercentage() / this.children.length;
        }
        percentage = Math.min(100, Math.max(0, percentage));
        percentage = Math.round(percentage);
        return percentage;
    }

}