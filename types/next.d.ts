import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

export type NextApiResponseServerIO = {
    socket: NetSocket & {
        server: {
            io: IOServer;
        };
    };
};
