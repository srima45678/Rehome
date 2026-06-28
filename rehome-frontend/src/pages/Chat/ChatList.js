// ChatList.js
// Shows all conversations the user has
// Like WhatsApp chat list

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import socket from '../../utils/socket';

function ChatList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChats();

    // Connect socket and go online
    socket.connect();
    socket.emit('user_online', user.id);

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const fetchChats = async () => {
    try {
      const response = await API.get('/chat/my-chats');
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the other person in the conversation
  const getOtherPerson = (chat) => {
    if (!user) return null;
    return chat.buyer?._id === user.id ? chat.seller : chat.buyer;
  };

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            💬 My Chats
          </h1>
          <p className="text-gray-500 mt-1">
            Your conversations with buyers and sellers
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">💬</p>
            <p className="text-gray-500 mt-3">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-16 shadow-sm">
            <p className="text-6xl mb-4">💬</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse products and chat with sellers!
            </p>
            <Link to="/products"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {chats.map((chat, index) => {
              const otherPerson = getOtherPerson(chat);
              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer
                    ${index < chats.length - 1 ? 'border-b border-gray-100' : ''}`}>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {otherPerson?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Chat info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800">
                        {otherPerson?.fullName || 'Unknown'}
                      </p>
                      <p className="text-gray-400 text-xs flex-shrink-0">
                        {timeAgo(chat.lastMessageAt)}
                      </p>
                    </div>

                    {/* Product name */}
                    <p className="text-primary text-xs font-medium mt-0.5">
                      Re: {chat.product?.title}
                    </p>

                    {/* Last message */}
                    <p className="text-gray-500 text-sm truncate mt-0.5">
                      {chat.lastMessage || 'No messages yet — say hello!'}
                    </p>
                  </div>

                  {/* Product image */}
                  {chat.product?.images?.length > 0 && (
                    <img
                      src={chat.product.images[0]}
                      alt={chat.product.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;