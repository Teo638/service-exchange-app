import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function ChatPage() {
  const { receiverId: paramReceiverId } = useParams()
  const { user, fetchNotifications } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [activeChat, setActiveChat] = useState(paramReceiverId || null)
  const [contacts, setContacts] = useState([])
  const socket = useRef()
  const scrollRef = useRef()

  useEffect(() => {
    socket.current = io('http://localhost:5000')

    if (user) {
      socket.current.emit('addUser', user.id)
    }

    socket.current.on('getMessage', (data) => {
      if (activeChat === data.senderId.toString()) {
        setMessages((prev) => [...prev, {
          sender_id: data.senderId,
          content: data.content,
          created_at: new Date()
        }])
      }
      fetchContacts()
    })

    return () => {
      socket.current.disconnect()
    }
  }, [user, activeChat])

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts')
      setContacts(res.data)
    } catch (err) {
      console.error("Greška pri dohvaćanju kontakata:", err)
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return
      try {
        const res = await api.get(`/messages/${activeChat}`)
        setMessages(res.data)
      } catch (err) {
        console.error("Greška pri dohvaćanju poruka:", err)
      }
    }
    fetchMessages()
    fetchContacts()
  }, [activeChat])


  useEffect(() => {
    if (activeChat) {
      const markAsRead = async () => {
        try {
          await api.put(`/messages/read/${activeChat}`);
          fetchNotifications();
          fetchContacts();
        } catch (err) {
          console.error("Greška pri označavanju poruka pročitanim:", err);
        }
      };
      markAsRead();
    }
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    const messageData = {
      receiver_id: parseInt(activeChat),
      content: newMessage
    }

    try {
      const res = await api.post('/messages', messageData)

      socket.current.emit('sendMessage', {
        senderId: user.id,
        receiverId: parseInt(activeChat),
        content: newMessage
      })

      setMessages((prev) => [...prev, res.data])
      setNewMessage('')
    } catch (err) {
      console.error("Greška pri slanju poruke:", err)
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex gap-4">

      <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-slate-800">Moje poruke</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="p-6 text-gray-400 italic">Nema aktivnih razgovora.</p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveChat(contact.id.toString())}
                className={`p-4 flex items-center gap-3 cursor-pointer transition ${activeChat === contact.id.toString() ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-400 truncate">{contact.last_message}</p>
                  </div>
                  {contact.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                      {contact.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase text-sm">
                {contacts.find(c => c.id.toString() === activeChat)?.name.charAt(0)}
              </div>
              <p className="font-bold text-slate-800">
                {contacts.find(c => c.id.toString() === activeChat)?.name || "Razgovor"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  ref={scrollRef}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.sender_id === user.id ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-gray-100 rounded-tl-none'}`}>
                    {m.content}
                    <p className={`text-[9px] mt-1 opacity-70 ${m.sender_id === user.id ? 'text-white' : 'text-gray-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Napišite poruku..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-orange-500 text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-600 transition shadow-lg shadow-orange-100">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-slate-800 font-bold text-xl">Vaš Inbox</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">Odaberite osobu s popisa lijevo kako biste započeli razgovor.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default ChatPage