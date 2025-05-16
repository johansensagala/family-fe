'use client';

import { useEffect } from "react";
import io from "socket.io-client";

let socket: any;

export default function Remote() {
    useEffect(() => {
        socket = io(undefined, {
            path: "/api/socket",
        });
    }, []);

    const sendAction = () => {
        socket.emit("remote-action", { message: "Tombol dari Remote ditekan!" });
        socket.emit("send-to-display", { message: "Pesan ke Display dari Remote" }); // Event tambahan untuk Display
    };

    return (
        <div>
            <h1>Remote Page</h1>
            <button onClick={sendAction}>Kirim Aksi ke Game dan Display</button>
        </div>
    );
}
