export class Substitute {
    name: string;
    out: boolean = false;
   
    constructor(name: string, out:boolean) {
        this.name = name;
        this.out = out;
    }
}