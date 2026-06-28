// ChatRoom.js
// The actual chat interface
// Real-time messages using Socket.io

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';
import socket from '../../utils/socket';

function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [sending, setSending] = useState(false);

  // Auto scroll to bottom ref
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchChat();

    // Connect socket
    socket.connect();
    socket.emit('user_online', user.id);

    // Join this chat room
    socket.emit('join_chat', chatId);

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicator
    socket.on('user_typing', (data) => {
      setTypingUser(data.name);
      setIsTyping(true);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    // Cleanup when leaving page
    return () => {
      socket.emit('leave_chat', chatId);
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
    // eslint-disable-next-line
  }, [chatId]);

  const fetchChat = async () => {
    try {
      const response = await API.get(`/chat/${chatId}`);
      setChat(response.data.chat);
      setMessages(response.data.chat.messages || []);
    } catch (error) {
      console.error('Error:', error);
      navigate('/chat');
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message via Socket.io
  const handleSend = (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);

    // Emit to server via Socket.io
    socket.emit('send_message', {
      chatId,
      senderId: user.id,
      content
    });

    // Clear input
    setNewMessage('');
    setSending(false);

    // Stop typing indicator
    socket.emit('stop_typing', { chatId, userId: user.id });
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Emit typing event
    socket.emit('typing', {
      chatId,
      userId: user.id,
      name: user.fullName.split(' ')[0]
    });

    // Stop typing after 2 seconds of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { chatId, userId: user.id });
    }, 2000);
  };

  // Get the other person in chat
  const getOtherPerson = () => {
    if (!chat || !user) return null;
    return chat.buyer?._id === user.id ? chat.seller : chat.buyer;
  };

  // Format time for messages
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for message groups
  const formatDate = (date) => {
    const today = new Date();
    const msgDate = new Date(date);
    if (msgDate.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const otherPerson = getOtherPerson();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-5xl animate-bounce">💬</p>
          <p className="text-gray-500 mt-3">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">

          {/* Back button */}
          <button
            onClick={() => navigate('/chat')}
            className="text-gray-600 hover:text-primary transition-colors">
            ←
          </button>

          {/* Other person's avatar */}
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {otherPerson?.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {/* Other person's name + product */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">
              {otherPerson?.fullName || 'Unknown'}
            </p>
            <p className="text-primary text-xs truncate">
              Re: {chat?.product?.title}
            </p>
          </div>

          {/* Product preview */}
          {chat?.product && (
            <Link
              to={`/products/${chat.product._id}`}
              className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
              {chat.product.images?.length > 0 && (
                <img
                  src={chat.product.images[0]}
                  alt={chat.product.title}
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                  {chat.product.title}
                </p>
                <p className="text-xs text-primary">
                  Rs. {Number(chat.product.price).toLocaleString()}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Welcome message */}
          <div className="text-center">
            <span className="bg-gray-100 text-gray-500 text-xs px-4 py-1.5 rounded-full">
              Chat started about "{chat?.product?.title}"
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">👋</p>
              <p className="text-gray-500">
                Say hello to {otherPerson?.fullName?.split(' ')[0]}!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              // Check if we need to show date separator
              const showDate = index === 0 ||
                formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

              const isMe = message.sender?._id === user.id ||
                           message.sender === user.id;

              return (
                <div key={message._id || index}>

                  {/* Date separator */}
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md`}>

                      {/* Sender name (for received messages) */}
                      {!isMe && (
                        <p className="text-xs text-gray-500 ml-3 mb-1">
                          {message.sender?.fullName || otherPerson?.fullName}
                        </p>
                      )}

                      <div className={`px-4 py-2.5 rounded-2xl shadow-sm
                        ${isMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm'
                        }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                          {formatTime(message.createdAt)}
                          {isMe && <span className="ml-1">✓✓</span>}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-sm">{typingUser} is typing</span>
                  <div className="flex gap-1 ml-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── MESSAGE INPUT ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-3 items-end">

            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-orange-100 transition-all px-4 py-2">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  // Send on Enter (without Shift)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent outline-none text-gray-800 resize-none text-sm"
                style={{ maxHeight: '120px' }}
              />
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 bg-primary hover:bg-accent text-white rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>

          </form>

          <p className="text-gray-400 text-xs mt-1.5 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

    </div>
  );
}

export default ChatRoom;