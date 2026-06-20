import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { API_URL } from "./config.js";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat} = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const pendingPromptRef = useRef("");

    const getReply = async () => {
        if (!prompt.trim() || loading) {
            return;
        }

        pendingPromptRef.current = prompt.trim();
        setLoading(true);
        setError("");
        setNewChat(false);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_URL}/api/chat`, options);
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res?.error || "Failed to send chat message");
            }

            setReply(res.reply);

        } catch(err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const submittedPrompt = pendingPromptRef.current;

        if (reply && submittedPrompt) {
            setPrevChats(prevChats => ([
                ...prevChats,
                {
                    role: "user",
                    content: submittedPrompt
                },
                {
                    role: "assistant",
                    content: reply
                }
            ]));

            pendingPromptRef.current = "";
        }

        setPrompt("");
    }, [reply, setPrevChats, setPrompt]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>AI Code Assistant <i className="fa-solid fa-chevron-down"></i></span>

                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>
                </div>
            </div>

            {
                isOpen &&
                <div className="dropDown">
                    <div className="dropDownItem">
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            }

            <Chat />

            <ScaleLoader color="#fff" loading={loading} />

            {error && <p className="info" role="alert">{error}</p>}

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                getReply();
                            }
                        }}
                    />

                    <button id="submit" type="button" onClick={loading ? undefined : getReply} disabled={loading} aria-disabled={loading}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>

                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;