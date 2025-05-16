import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

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
            console.log("Client connected");

            socket.on("remote-action", (data) => {
                console.log("Received from remote:", data);
                socket.broadcast.emit("game-update", data);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
}
