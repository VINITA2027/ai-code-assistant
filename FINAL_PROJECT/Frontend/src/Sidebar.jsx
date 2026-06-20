import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { API_URL } from "./config.js";
import logo from "./assets/blacklogo.png";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);

    useEffect(() => {
        const getAllThreads = async () => {
            try {
                const response = await fetch(`${API_URL}/api/thread`);
                const res = await response.json();

                if (!response.ok) {
                    throw new Error(res?.error || "Failed to load threads");
                }

                const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
                setAllThreads(filteredData);
            } catch {
                return;
            }
        };

        getAllThreads();
    }, [currThreadId, setAllThreads])


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        try {
            const response = await fetch(`${API_URL}/api/thread/${newThreadId}`);
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res?.error || "Failed to load thread");
            }

            setPrevChats(res);
            setNewChat(false);
            setReply(null);
            setCurrThreadId(newThreadId);
        } catch {
            setPrevChats([]);
        }
    }   

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/api/thread/${threadId}`, {method: "DELETE"});
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res?.error || "Failed to delete thread");
            }

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch {
            return;
        }
    }

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src={logo} alt="gpt logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>


            <ul className="history">
                {
                    Array.isArray(allThreads) && allThreads.map((thread, idx) => (
                        <li key={thread.threadId || idx} 
                            onClick={() => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted": " "}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>
 
            <div className="sign">
                <p> By Vinita Kumari &hearts;</p>
            </div>
        </section>
    )
}

export default Sidebar;