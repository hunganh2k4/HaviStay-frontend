import React, { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Search, Image as ImageIcon, MoreVertical, ChevronLeft, MessageSquare } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import API_URL from "../config/config";

const SOCKET_URL = API_URL.replace("/api", "");

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const hostId = queryParams.get("hostId");
  const propertyId = queryParams.get("propertyId");

  useEffect(() => {
    console.log("Current URL Search:", location.search);
    console.log("Host ID from URL:", hostId);
  }, [location.search, hostId]);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!!hostId);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      const existingConvs = await fetchConversations();

      if (hostId) {
        try {
          const url = propertyId 
            ? `${API_URL}/chat/find-or-create/${hostId}?propertyId=${propertyId}`
            : `${API_URL}/chat/find-or-create/${hostId}`;

          const response = await fetch(url, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setSelectedConversation(data);

            setConversations(prev => {
              if (!prev.find(c => c.id === data.id)) {
                return [data, ...prev];
              }
              return prev;
            });
          } else {
            console.error("Failed to find/create conversation");
          }
        } catch (err) {
          console.error("Error finding/creating conversation:", err);
        }
      }
      setIsInitialLoading(false);
    };

    fetchInitialData();
  }, [hostId, currentUser]);

  const selectedConvRef = useRef(null);

  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.emit("register", currentUser.id);

      newSocket.on("newMessage", (message) => {
        if (selectedConvRef.current && message.conversationId === selectedConvRef.current.id) {
          setMessages((prev) => [...prev, message]);
        }
        // Refresh conversations to update last message
        fetchConversations();
      });

      return () => newSocket.close();
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        return data;
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
    return [];
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Mark as read
        await fetch(`${API_URL}/chat/read/${conversationId}`, {
          method: "PUT",
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    if (!socket.connected) {
      console.error("Socket not connected");
      // Optional: try to reconnect or show error
      return;
    }

    const receiverId =
      selectedConversation.participant1Id === currentUser.id
        ? selectedConversation.participant2Id
        : selectedConversation.participant1Id;

    const messageData = {
      senderId: currentUser.id,
      receiverId,
      content: newMessage,
    };

    socket.emit("sendMessage", messageData);

    // Optimistically add message
    const tempMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
      sender: currentUser,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
  };

  const getPartner = (conversation) => {
    return conversation.participant1Id === currentUser?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header />

      <main className="flex-1 max-w-[1400px] mx-auto w-full flex p-6 gap-6 overflow-hidden">
        {/* SIDEBAR - Conversations */}
        <div className={`w-full lg:w-[400px] bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${selectedConversation ? "hidden lg:flex" : "flex"}`}>
          <div className="p-6 border-b border-gray-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {currentUser?.role === "HOST" ? "Quản lý tin nhắn" : "Tin nhắn"}
            </h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chưa có tin nhắn</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = getPartner(conv);
                const lastMsg = conv.messages[0];
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${isSelected ? "bg-rose-50 shadow-sm" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="relative w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {partner?.avatar ? (
                        <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-rose-500" />
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold text-sm truncate ${isSelected ? "text-rose-600" : "text-gray-900"}`}>
                        {partner?.name}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString("vi-VN") : ""}
                      </span>
                    </div>
                    {conv.property && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase truncate mb-1">
                        {conv.property.title}
                      </p>
                    )}
                    <p className={`text-xs truncate ${lastMsg?.isRead === false && lastMsg.senderId !== currentUser?.id ? "font-bold text-gray-900" : "text-gray-500"}`}>
                      {lastMsg ? lastMsg.content : "Bắt đầu cuộc trò chuyện..."}
                    </p>
                  </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className={`flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${!selectedConversation ? "hidden lg:flex" : "flex"}`}>
          {isInitialLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedConversation(null)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {getPartner(selectedConversation)?.avatar ? (
                      <img src={getPartner(selectedConversation).avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={20} className="text-rose-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{getPartner(selectedConversation)?.name}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Đang hoạt động
                      </p>
                      {selectedConversation.property && (
                        <span className="text-[10px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded-full">
                          {selectedConversation.property.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="p-2.5 hover:bg-gray-50 rounded-full text-gray-400 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] space-y-1 ${isMine ? "items-end" : "items-start"}`}>
                        <div className={`px-5 py-3.5 rounded-[24px] text-sm shadow-sm transition-all hover:shadow-md ${isMine
                          ? "bg-rose-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase px-2">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2 rounded-[24px] border border-gray-100 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                  <button type="button" className="p-3 text-gray-400 hover:text-rose-500 hover:bg-white rounded-full transition-all">
                    <ImageIcon size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2 px-2"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3.5 bg-rose-500 text-white rounded-[18px] hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:shadow-none active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100/20 text-rose-500">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng bạn!</h2>
              <p className="text-gray-500 max-w-sm font-medium">Hãy chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
