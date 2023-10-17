import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginApp from "../layouts/login";
import ChatRoom from "../layouts/room";
import { io } from "socket.io-client";
import { useState } from "react";

const globVar = import.meta.env;
export default function AppRouter(){
    const socket = io(globVar.VITE_WEBSOCKETURL, {
                transports: ['websocket'],
                cors: {
                    origin: '*',
                }
    });
    const [isConnected, setIsConnected] = useState(socket.connected);
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Simple Chat</title>
                    <meta charSet='utf-8'/>
                </Helmet>
            </HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginApp 
                        socket={socket} 
                        isConnected={isConnected} 
                        setIsConnected={setIsConnected}
                    />} />
                    <Route path="/room" element={<ChatRoom 
                        socket={socket}
                        isConnected={isConnected} 
                        setIsConnected={setIsConnected}
                        metaEnv={globVar}
                    />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}