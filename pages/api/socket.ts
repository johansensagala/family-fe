import { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

type NextApiResponseWithSocket = NextApiResponse & {
    socket: NetSocket & {
        server: HTTPServer & {
            io?: IOServer;
        };
    };
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket.server.io) {
        const io = new IOServer(res.socket.server, {
            path: "/api/socket",
        });

        io.on("connection", (socket) => {
            console.log("Client game connected");

            socket.on("handle-incorrect", (data) => {
                socket.broadcast.emit("handle-incorrect", data);
            });

            socket.on("set-question-visible", (data) => {
                socket.broadcast.emit("set-question-visible", data);
            });

            socket.on("set-active-tab-blank", (data) => {
                socket.broadcast.emit("set-active-tab-blank", data);
            });

            socket.on("set-active-tab-main-round", (data) => {
                socket.broadcast.emit("set-active-tab-main-round", data);
            });

            socket.on("set-active-tab-final", (data) => {
                socket.broadcast.emit("set-active-tab-final", data);
            });

            socket.on("set-active-tab-single", (data) => {
                socket.broadcast.emit("set-active-tab-single", data);
            });

            socket.on("set-active-tab-double", (data) => {
                socket.broadcast.emit("set-active-tab-double", data);
            });

            socket.on("set-active-tab-main", (data) => {
                socket.broadcast.emit("set-active-tab-main", data);
            });

            socket.on("set-active-tab-timer1", (data) => {
                socket.broadcast.emit("set-active-tab-timer1", data);
            });

            socket.on("set-active-tab-timer2", (data) => {
                socket.broadcast.emit("set-active-tab-timer2", data);
            });

            socket.on("set-reveal-answer", (data) => {
                socket.broadcast.emit("set-reveal-answer", data);
            });
            
            socket.on("set-start-timer", (data) => {
                socket.broadcast.emit("set-start-timer", data);
            });
            
            socket.on("set-stop-timer", (data) => {
                socket.broadcast.emit("set-stop-timer", data);
            });
            
            socket.on("set-same-answer", (data) => {
                socket.broadcast.emit("set-same-answer", data);
            });

            socket.on("set-score", (data) => {
                socket.broadcast.emit("set-score", data);
            });
            
            socket.on("set-final-answer", (data) => {
                socket.broadcast.emit("set-final-answer", data);
            });

            socket.on("set-final-score", (data) => {
                socket.broadcast.emit("set-final-score", data);
            });

            socket.on("set-final-top-answer", (data) => {
                socket.broadcast.emit("set-final-top-answer", data);
            });

            socket.on("set-sound-effect", (data) => {
                socket.broadcast.emit("set-sound-effect", data);
            });

            socket.on("set-sound-special-answer", (data) => {
                socket.broadcast.emit("set-sound-special-answer", data);
            });

        });
        
        res.socket.server.io = io;
    }

    res.end();
}
