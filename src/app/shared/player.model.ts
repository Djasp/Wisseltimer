export class Player {
    name: string;
    isPresent: boolean = true ;
    doNotSubstitute: boolean = false;
    
    constructor(name:string) {
        this.name = name;
    }
}