import moment from 'moment';

export class Substitute {
    public inName: string;
    public outName: string;
    private seconds: number = 0;
  
    index: number;

    constructor(inName: string, outName: string, seconds: number, index: number) {
        this.inName = inName;
        this.outName = outName;
        this.seconds = seconds;
        this.index = index;
    }

    public formattedTime(): string {
        return moment.unix(0).add(this.seconds, 'seconds').format("mm:ss");
    }
}