import { io } from "socket.io-client"

const socket = io("http://localhost:3000");

const ORDER_ID = "pedido-123";
const RIDER_ID = "entregador-Rhulys"

let lat = -23.56168;
let lon = -46.65598;

console.log("Simulador de Entregador Iniciado...");

socket.on("connect", () => {
    console.log("Conectado ao servidor de telemetria!");

    socket.emit("JoinOrder", ORDER_ID)

    setInterval(() => {
        lat += (Math.random() - 0.5) * 0.001;
        lon += (Math.random() - 0.5) * 0.001;

        const payload = {
            riderId: RIDER_ID,
            orderId: ORDER_ID,
            latitude: lat,
            longitude: lon,
            timestamp: Date.now()
        };

        console.log(`Enviando posição: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`)
        socket.emit("updateLocation", payload)
    }, 3000)
})

socket.on("locationUpdated", (data) => {
    console.log(`Confirmação do Servidor: Rider ${data.riderId} está em movimento.`)
})