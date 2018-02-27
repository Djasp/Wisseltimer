import moment from 'moment';

export class Substitute {
    public inName: string;
    public outName: string;
    private seconds: number = 0;

    private DATE_MIN_VALUE: string = "1970-01-01 00:00:00";

    index: number;

    constructor(inName: string, outName: string, seconds: number, index: number) {
        this.inName = inName;
        this.outName = outName;
        this.seconds = seconds;
        this.index = index;

    }

    public formattedTime(): string {
        return moment(this.DATE_MIN_VALUE).add(this.seconds, 'seconds').format("mm:ss");
    }
}