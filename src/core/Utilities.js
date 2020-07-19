'use strict';

const fs = require('fs');
const path = require('path');

class Utilites { 
    async getFileNames(directory) { 
        const result = []; 
        const files = fs.readdirSync(directory); 
        
        for (file in files) { 
            const path = path.join(directory, file); 

            result.push(fs.statSync(path).isDirectory() 
                ? await this.getFileNames(path)
                : path
            );
        }

        return result;
    }
}

module.exports = new Utilites(); 
