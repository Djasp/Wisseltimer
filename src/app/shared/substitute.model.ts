import moment from 'moment';

export class Substitute {
    inName: string;
    outName: string;
    seconds: string;

    /**
     * Creates an instance of Substitute.
     * @param {string} inName 
     * @param {string} outName 
     * @param {number} seconds 
     * @memberof Substitute
     */
    constructor(inName: string, outName: string, seconds: number) {
        this.inName = inName;
        this.outName = outName;
        this.seconds = moment("1900-01-01 00:00:00").add(seconds, 'seconds').format("mm:ss");
    }
}