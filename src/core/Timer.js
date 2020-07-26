'use strict'; 

class Timer { 
    constructor(intervalLength, func) {
        this.func = func;
        this.intervalLength = intervalLength;
    }

    set intervalLength(length) {
        this.intervalTime = length;

        if (this.interval)
            clearInterval(this.interval);

        this.interval = setInterval(this.func, this.intervalTime * 60000);
    }
}; 

module.exports = Timer;