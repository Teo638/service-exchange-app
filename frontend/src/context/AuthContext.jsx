import { createContext, useState, useContext, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  const [notifications, setNotifications] = useState({ messages: 0, requests: 0 });

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/auth/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju obavijesti:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error(err)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, notifications, fetchNotifications, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)