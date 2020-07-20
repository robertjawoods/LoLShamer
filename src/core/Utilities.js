'use strict';

const fs = require('fs');
const path = require('path');

class Utilites { 
    async getFileNames(directory) { 
        const result = []; 
        const files = fs.readdirSync(directory); 
        
        for (const file of files) { 
            const filePath = path.join(directory, file); 

            result.push(fs.statSync(filePath).isDirectory() 
                ? await this.getFileNames(filePath)
                : filePath
            );
        }

        return result;
    }
}

module.exports = new Utilites(); 
