import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatRoom({
    socket,
    metaEnv,
    setIsConnected,
}){
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(() => {
        const profile = window.localStorage.getItem('chatprofile');
        if(profile){
            window.localStorage.setItem('chatprofile', profile);
            return JSON.parse(profile);
        }
        return false;
    },[]);
    const defaultPayload = useMemo(() => ({
        username: '',
        room_name: '',
        message: '',
    }),[]);
    const [wsResponse, setWsResponse] = useState('');
    const [joinInfo, setJoinInfo] = useState('');
    const [chatList, setChatList] = useState([]);
    const [msgPayload, setMessagePayload] = useState(defaultPayload);
    useEffect(() => {},[msgPayload]);
    useEffect(()=>{
        console.log(userProfile);
        if(!userProfile){
            navigate('/login', {replace: true});
        }
    },[userProfile, navigate]);

    useEffect(() => {
        function onConnect(){
            if(chatList && chatList.length == 0){
                axios.get(metaEnv.VITE_APIURL+'/chat',{
                    params: {
                        username: userProfile?.users,
                        room_name: userProfile?.room_name,
                    }
                }).then(({data}) => {
                    if(data.length > 0){
                        setChatList(data);
                    }
                });
            }
            
            setIsConnected(true);
        }
        
        function onDisconnected(){
            setWsResponse('Server disconnected');
            setIsConnected(false);
        }

        function onException(e){
            console.log('Exception', e);
            setWsResponse(e.message);
        }
        
        function onConversation(e){
            setChatList(chatList => [...chatList, e]);
            setMessagePayload(defaultPayload);
        }

        function onJoinRoom(e){
            setTimeout(() => {
                setJoinInfo(e);
            },1000);
            setJoinInfo('');
        }

        function onExit(e){
            console.log(e);
            window.localStorage.removeItem('chatprofile');
            navigate('/login', {replace: true});
        }

        socket.on('conversation', onConversation);

        socket.on('connect', onConnect);

        socket.on('disconnected', onDisconnected);

        socket.on('exception', onException);

        socket.on('join_room', onJoinRoom);

        socket.on('exit', onExit);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnected', onDisconnected);
            socket.off('conversation', onConversation);
            socket.off('join_room', onJoinRoom);
            socket.off('exit', onExit);
        }
    }, [socket, setIsConnected, userProfile, chatList, metaEnv, navigate, defaultPayload]);

    useEffect(() => {},[chatList]);

    const setMessage = (e) => {
        setMessagePayload({...msgPayload, 
            username: userProfile?.users,
            room_name: userProfile?.room_name,
            message: e.target.value
        });
    }

    const sendMessage = (e) => {
        e.preventDefault();
        socket.emit('new_message', msgPayload);
    }

    const handleExit = () => {
        socket.emit('exit', {
            username: userProfile?.users,
            room_name: userProfile?.room_name,
        });
    }
    return (
        <>
            <div id="chatRoom" className="w-full flex items-center justify-center">
                <div className="relative block w-full h-screen sm:w-1/3 border border-gray-200 px-4 py-10">
                    {joinInfo && (
                        <div className="absolute right-0 top-2 w-fit px-2 py-2 text-xs bg-[#5DB075] opacity-60 text-white">
                            {joinInfo}
                        </div>
                    )}
                    {wsResponse && (
                        <div className="absolute right-0 top-2 w-fit px-2 py-2 text-xs bg-red-300 opacity-60 text-white">
                            {wsResponse}
                        </div>
                    )}
                    <div id="chatHeader" className="relative flex items-center justify-center mb-10">
                        <div className="absolute left-0">
                            <button 
                                className="text-[#5DB075] text-lg hover:text-emerald-500"
                                onClick={handleExit}
                            >
                                Exit
                            </button>
                        </div>
                        <div className="col-span-2 font-bold text-2xl">
                            {userProfile?.room_name}
                        </div>
                    </div>
                    <div id="message-content" className="w-full block relative overflow-auto px-4 h-[calc(100vh-30vh)]">
                        {chatList && chatList.map((items, index) => (
                            <div key={index} 
                                className={`relative mb-10 w-full block h-auto sm:w-3/4 bg-white ${items.username != userProfile.users ? 'msg-received float-left' : 'msg-sent float-right'}`}
                            >
                                <div className={`w-auto`}>
                                    {items.username != userProfile.users && (
                                        <div className={`text-sm mb-2 w-full`}>{items.username}</div>
                                    )}
                                    <p 
                                    className={`clear-both relative w-auto px-4 py-4 rounded-lg text-sm ${items.username != userProfile.users ? 'bg-[#F6F6F6] border border-gray-200':'bg-[#5DB075] float-right text-white'}`}
                                    >
                                        {items.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute w-full bottom-3 left-0">
                        <div className="relative px-4">
                            <input
                                type="text"
                                id="inp-message"
                                name="message"
                                className="w-full bg-[#F6f6f6] pl-4 pr-10 py-2 outline-none border border-gray-200 rounded-[2rem]"
                                placeholder="Message here..."
                                value={msgPayload.message}
                                onChange={(e) => setMessage(e)}
                            />
                            <button
                                type="button"
                                className="bg-[#5DB075] px-2 py-2 absolute right-6 rounded-full top-1 hover:bg-emerald-600"
                                onClick={sendMessage}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-white">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                                </svg>

                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}