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

            // TAMBAHKAN SOCKET2 TADI DISINI
            // 🔹 event untuk menampilkan semua coppers
            socket.on("handle-show-all-coppers", () => {
                socket.broadcast.emit("handle-show-all-coppers");
            });

            // 🔹 event pause/play musik
            socket.on("handle-pause-or-play-music", () => {
                socket.broadcast.emit("handle-pause-or-play-music");
            });

            // 🔹 event buka modal quiz
            socket.on("handle-open-modal-quiz", () => {
                socket.broadcast.emit("handle-open-modal-quiz");
            });

            // 🔹 event tutup modal quiz
            socket.on("handle-close-modal-quiz", () => {
                socket.broadcast.emit("handle-close-modal-quiz");
            });

            // 🔹 feedback wrong
            socket.on("handle-feedback-wrong", () => {
                socket.broadcast.emit("handle-feedback-wrong");
            });

            // 🔹 feedback correct
            socket.on("handle-feedback-correct", () => {
                socket.broadcast.emit("handle-feedback-correct");
            });

            // 🔹 reveal answer
            socket.on("handle-reveal-answer", () => {
                socket.broadcast.emit("handle-reveal-answer");
            });

            // 🔹 open modal copper (kirim object copper)
            socket.on("handle-open-modal-copper", (copper) => {
                socket.broadcast.emit("handle-open-modal-copper", copper);
            });

            // 🔹 close modal copper
            socket.on("handle-close-modal-copper", () => {
                socket.broadcast.emit("handle-close-modal-copper");
            });

        });
        
        res.socket.server.io = io;
    }

    res.end();
}
