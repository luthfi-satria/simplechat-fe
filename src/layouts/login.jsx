import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginApp({
    socket,
    isConnected,
    setIsConnected,
}){
    
    const errorMessage = {
        username: 'Username is required',
        room_name: 'RoomID is required',
    };
    const navigate = useNavigate();
    const [validError, setValidError] = useState(false);
    const [wsResponse, setWsResponse] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const [payload, setPayload] = useState({
        username: '',
        room_name: '',
    });

    useEffect(() => {

        function onConnect(){
            setIsConnected(true);
        }

        function onDisconnected(){
            setIsConnected(false);
        }

        function onException(e){
            console.log('Exception', e);
            setWsResponse(e.message);
        }

        function onJoinRoom(e){
            const data = JSON.stringify(e.data);
            window.localStorage.setItem('chatprofile', data);
            setTimeout(() => {
                navigate('/room', {replace: true});
            }, 1000);
        }

        socket.on('connect', onConnect);

        socket.on('disconnected', onDisconnected);

        socket.on('exception', onException);
        socket.on('join_room', onJoinRoom);
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnected', onDisconnected);
        }
    }, [socket, setIsConnected, navigate]);

    useEffect(() => {
        if(isSubmit && isConnected){
            socket.emit('join_room',payload);
            setIsSubmit(false);
        }
    }, [payload, validError, isSubmit, isConnected, socket]);

    useEffect(()=>{
        if(wsResponse != ''){
            setTimeout(() => {
                setWsResponse('');
            }, 2000);
        }
    },[wsResponse]);

    const handlePayload = (e) => {
        setPayload({...payload, [e.target.name] : e.target.value});
    }
    
    const handleLogin = (e) => {
        e.preventDefault();
        const error = {}
        for(const items in payload){
            if(payload[items] == ''){
                error[items] = `${errorMessage[items]} is required`;
            }
        }

        if(error && Object.keys(error).length > 0){
            setValidError(error);
        }else{
            setValidError(false);
            setIsSubmit(true);
        }
    }
    return (
        <>
            <div id="LoginApp" className="w-full flex items-center justify-center">
                <div className="relative w-full h-screen sm:w-1/3 border border-gray-200 px-4 py-10">
                    <h2 className="font-bold text-2xl text-center mb-4">Join ChatRoom</h2>

                    <div className="grid">
                        <div className="mt-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="bg-[#F6F6F6] w-full px-4 py-2 leading-2 rounded-md h-12"
                                onChange={handlePayload}
                            />
                            {validError?.username && (
                                <div className="text-red-500 mt-2">{validError?.username}</div>
                            )}
                        </div>
                        <div className="mt-4">
                            <input
                                type="text"
                                name="room_name"
                                placeholder="RoomID"
                                className="bg-[#F6F6F6] w-full px-4 py-2 leading-2 rounded-md h-12"
                                onChange={handlePayload}
                            />
                            {validError?.room_name  && (
                                <div className="text-red-500 mt-2">{validError?.room_name}</div>
                            )}
                        </div>
                        {wsResponse != '' && (
                            <div className="mt-4 bg-red-100 text-red-600 px-4 py-2">
                                {wsResponse}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-32 w-full left-0 items-center justify-center flex">
                        <button
                            type="button"
                            className="w-4/5 px-10 py-4 text-center bg-[#5DB075] text-white uppercase rounded-3xl hover:bg-emerald-600"
                            onClick={handleLogin}
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}