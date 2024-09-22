'use client'
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import { useAuthStore } from '../zustand/useAuthStore';
import { useChatMsgsStore } from '../zustand/useChatMsgsStore';
import ChatUsers from '../_components/chatusers';
import { useChatReceiverStore } from '../zustand/useChatReceiverStore';
import { useUsersStore } from '../zustand/useUsersStore';
import axios from "axios";  
const Chat = () => {  
    const [msgs, setMsgs] = useState([]);
    const [msg, setMsg] = useState('');
    const [socket, setSocket] = useState(null);
    const {authName} = useAuthStore();
    const {chatMsgs,updateChatMsgs}  = useChatMsgsStore();
    const {chatReceiver} = useChatReceiverStore();
    console.log("*** ", authName);
    const {updateUsers} = useUsersStore();
    const getUserData = async () => {
        const res = await axios.get('http://localhost:5000/users',
                {
                    withCredentials: true
                })
                updateUsers(res.data);
    } 
    useEffect(() => {
        // Establish WebSocket connection
        const newSocket = io('http://localhost:8000', {
            query: {
                username: authName
            }
        }
        );
        setSocket(newSocket);
        // Listen for incoming msgs
        newSocket.on('chat msg', msg => {
            console.log('** received msg on client ** ' + msg," and chat messages : ",chatMsgs);
            updateChatMsgs([...chatMsgs, msg]);
        });

        getUserData();
        // Clean up function
        return () => newSocket.close();
    }, [chatMsgs]); 

    const sendMsg = (e) => {
        e.preventDefault();
        const msgToBeSent = {
             text: msg,
             sender: authName,
             receiver: chatReceiver
         };
        if(socket) {
            socket.emit('chat msg', msgToBeSent);
            updateChatMsgs([...chatMsgs, msgToBeSent]);
            //setMsgs(prevMsgs => [...prevMsgs, {text: msg, sentByCurrUser: true}]);
            setMsg('');
        }
        console.log(" ** after update zustand function ** ",chatMsgs);
    }
    return (
        <div className='h-screen flex divide-x-4'>
        <div className='w-1/5 '>
            <ChatUsers/>
        </div>
        <div className='w-4/5 flex flex-col'>
            <div className='1/5'>
                <h1>
                    {authName} is chatting with {chatReceiver}
                </h1>
            </div>
            <div className='msgs-container h-3/5 overflow-scroll'>
                {chatMsgs.map((msg, index) => (
                    <div key={index} className={`m-3 p-1 ${msg.sender === authName ? 'text-right' : 'text-left'}`}>
                        <span className={`p-2 rounded-2xl ${msg.sender === authName ? 'bg-blue-200' : 'bg-green-200'}`}>
                        {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className='h-1/5 flex items-center justify-center'>
                <form onSubmit={sendMsg} class="w-1/2">  
                    <div class="relative">  
                        <input type="text"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                placeholder="Type your text here"
                                required
                                class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  />
                        <button type="submit"
                                class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
   </div>
    )
}
export default Chat