'use client';

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket: any;

export default function Display() {
    const [displayMessage, setDisplayMessage] = useState("Belum ada pesan");

    useEffect(() => {
        socket = io(undefined, {
            path: "/api/socket",
        });

        // Mendengarkan event "send-to-display" dari server
        socket.on("send-to-display", (data: any) => {
            setDisplayMessage(data.message); // Menampilkan pesan yang diterima
        });
    }, []);

    return (
        <div>
            <h1>Display Page</h1>
            <p>Pesan dari Remote: {displayMessage}</p>
        </div>
    );
}
