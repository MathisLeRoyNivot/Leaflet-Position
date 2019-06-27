// Import depedencies
const http = require("http");
const { argv } = require("yargs");
const routes = require("./routes/routes.js");

// Port argument, if nothing entered, default port is 3000, to specify the port when launching the server, type '--port=<port>'
const inputPort = argv.port;
let port = inputPort && !isNaN(inputPort) && (inputPort > 0 && inputPort % 1 === 0 && inputPort < 65536) ? inputPort : 3000;

//Launch server on port given by the user
http.Server(routes.app);
const launchRouting = () => {
    routes.app.listen(port, () => {
        routes.getHomePage;
        console.log(`\x1b[37mServer is running on port : \x1b[32m ${port} \x1b[37m \nYou can routing to the server at the following address :\x1b[32m http://localhost:${port}/ \x1b[37m \nThe API is available at the following address :\x1b[32m http://localhost:${port}/api/coords \x1b[37m`
        );
    });
}

launchRouting(inputPort, (err, logPort) => {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log(logPort);
    }
});

module.exports = {
    port
};