const fs = require('fs');

function read(file) {
    return JSON.parse(fs.readFileSync(file));
}

function write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { read, write };