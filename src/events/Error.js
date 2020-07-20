'use strict'; 

module.exports = class Error { 
    constructor() { 
        this.name = 'error';
    }

    async exec(err) { 
        console.log(err);
    }
};