const { io } = require("socket.io-client");

const URL = process.env.URL || "https://game-guesser.eu";
console.log(URL)
const MAX_CLIENTS = 3000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 500;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
    // for demonstration purposes, some clients stay stuck in HTTP long-polling
    const transports = ['websocket']
    // Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

/*    setInterval(() => {
        socket.emit("game:join",{
            id: 'O_hArh1Z3N',
            display_name: clientCount.toString()
        });
    }, EMIT_INTERVAL_IN_MS);

    socket.on("server to client event", () => {
        packetsSinceLastReport++;
    });

    socket.on("disconnect", (reason) => {
        console.log(`disconnect due to ${reason}`);
    });

    if (++clientCount < MAX_CLIENTS) {
        setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
    }*/

    for (let client = 0; client < MAX_CLIENTS; client++) {
        setTimeout(() => {
            const socket = io(URL, {
                transports,
                withCredentials: true,
            });

            socket.on('game:timer', (payload) => {
                console.log(payload)
            })
            socket.emit("game:join",{
                id: 'f3G3z_agYF',
                display_name: client.toString()
            });
        },client * 50)
    }
};

createClient();

const printReport = () => {
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;
    const packetsPerSeconds = (
        packetsSinceLastReport / durationSinceLastReport
    ).toFixed(2);

    console.log(
        `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
    );

    packetsSinceLastReport = 0;
    lastReport = now;
};

setInterval(printReport, 5000);