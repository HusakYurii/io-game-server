class Logger {
    static logData(data) {
        if (this.isProduction) {
            return;
        }
        console.log(JSON.stringify(data));
    }
    static logMessage(msg) {
        if (this.isProduction) {
            return;
        }
        console.log(msg);
    }

    static addDividerLabel(label, backColor = "#000", color = "#fff") {
        if (this.isProduction) {
            return;
        }
        console.log(`%c ------------------------ ${label} --------------------------`, `background: ${backColor}; color: ${color}`);
    }
}

// I assume that while production I will have something in this variable
Logger.isProduction = !!process.env.NODE_ENV;

module.exports = Logger;