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

const liveRooms: Record<string, { game_id: string; remote: string | null; display: string | null }> = {};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket.server.io) {
        console.log("Inisialisasi Multi-Room Socket Server...");
        const io = new IOServer(res.socket.server, {
            path: "/api/socket",
            cors: { origin: "*" }
        });

        io.on("connection", (socket) => {

            // =========================================================
            // 1. DISPLAY: MEMBUAT ROOM BARU
            // =========================================================
            socket.on("create-room", ({ game_id, room_code }: { game_id: string; room_code: string }) => {
                if (!game_id || !room_code) return;

                if (liveRooms[room_code]) {
                    socket.emit("room-error", { message: "Kode kamar sudah terpakai, silakan coba lagi." });
                    return;
                }

                liveRooms[room_code] = {
                    game_id,
                    display: socket.id,
                    remote: null
                };

                socket.data = { room_code, role: "display" };
                socket.join(`session-${room_code}`);

                socket.emit("room-status", { success: true, message: `Room ${room_code} berhasil dibuat.` });
                console.log(`[CREATE] Display membuat Room: ${room_code} untuk Game ID: ${game_id}`);
            });

            // =========================================================
            // 2. REMOTE: BERGABUNG KE ROOM (Dengan Validasi Match Game ID)
            // =========================================================
            socket.on("join-room", ({ room_code, game_id }: { room_code: string; game_id: string }) => {
                if (!room_code || !game_id) {
                    socket.emit("room-error", { message: "Data tidak lengkap (Kode Kamar & Game ID diperlukan)!" });
                    return;
                }
                
                const room = liveRooms[room_code];

                // 1. Validasi apakah kamar terdaftar
                if (!room) {
                    socket.emit("room-error", { message: "Kode kamar tidak ditemukan atau sudah hangus!" });
                    return;
                }

                // 2. VALIDASI KRITIS: Pastikan Game ID yang diminta remote MATCH dengan Game ID milik Display
                if (String(room.game_id) !== String(game_id)) {
                    socket.emit("room-error", { 
                        message: `Gagal Connect! Kamar ${room_code} terdaftar untuk permainan lain, bukan paket game ini.` 
                    });
                    return;
                }

                // 3. Validasi slot remote kosong
                if (room.remote !== null) {
                    socket.emit("room-error", { message: "Kamar ini sudah memiliki pengendali remote aktif!" });
                    return;
                }

                // Jika lolos semua validasi, masukkan ke sesi room
                room.remote = socket.id;
                socket.data = { room_code, role: "remote" };
                socket.join(`session-${room_code}`);

                // Beritahu remote kalau sukses masuk
                socket.emit("room-status", { 
                    success: true, 
                    game_id: room.game_id, 
                    message: "Berhasil terhubung ke layar utama!" 
                });

                // Beritahu display kalau remote berpasangan sudah masuk
                socket.to(`session-${room_code}`).emit("remote-connected");
                console.log(`[JOIN MATCHED] Remote sukses masuk ke Room: ${room_code} untuk Game ID: ${game_id}`);
            });

            // =========================================================
            // 3. FUNGSI PEMBANTU UNTUK FORWARD EVENT SESI
            // =========================================================
            const forwardToSession = (eventName: string) => {
                socket.on(eventName, (data) => {
                    const { room_code } = socket.data || {};
                    if (room_code) {
                        socket.to(`session-${room_code}`).emit(eventName, data);
                    }
                });
            };

            // Memastikan seluruh event menggunakan fungsi forwardToSession yang benar
            forwardToSession("handle-incorrect");
            forwardToSession("set-minus-wrong");
            forwardToSession("set-plus-wrong");
            forwardToSession("set-question-visible");
            forwardToSession("set-active-player");
            forwardToSession("set-active-tab-blank");
            forwardToSession("set-active-tab-main-round");
            forwardToSession("set-active-tab-final");
            forwardToSession("set-active-tab-point");
            forwardToSession("set-active-tab-bonus");
            forwardToSession("set-active-tab-main");
            forwardToSession("set-active-tab-timer");
            forwardToSession("set-active-tab-timer1");
            forwardToSession("set-active-tab-timer2");
            forwardToSession("set-reveal-answer");
            forwardToSession("set-start-timer");
            forwardToSession("set-stop-timer");
            forwardToSession("show-timer-display");
            forwardToSession("set-pause-timer");
            forwardToSession("trigger-same-answer");
            forwardToSession("set-same-answer");
            forwardToSession("set-score");
            forwardToSession("set-final-answer");
            forwardToSession("set-final-score");
            forwardToSession("set-final-top-answer");
            forwardToSession("set-sound-effect");
            forwardToSession("set-sound-special-answer");
            forwardToSession("set-incorrect-sound");
            forwardToSession("set-correct-sound");

            // =========================================================
            // 4. DISCONNECT (PEMBERSIHAN DATA SESI)
            // =========================================================
            socket.on("disconnect", () => {
                const { room_code, role } = socket.data || {};

                if (room_code && role && liveRooms[room_code]) {
                    if (role === "display") {
                        socket.to(`session-${room_code}`).emit("room-closed", { message: "Layar utama telah ditutup." });
                        delete liveRooms[room_code];
                        console.log(`[DESTROY] Room ${room_code} dihapus karena Display keluar.`);
                    } else if (role === "remote") {
                        liveRooms[room_code].remote = null;
                        socket.to(`session-${room_code}`).emit("remote-disconnected");
                        console.log(`[LEAVE] Remote keluar dari Room ${room_code}.`);
                    }
                }
            });
        });

        res.socket.server.io = io;
    }

    res.end();
}