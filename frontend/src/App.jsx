import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ServiceDetailsPage from './pages/ServiceDetailsPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import Navbar from './components/Navbar'
import EditProfile from './pages/EditProfile'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:receiverId" element={<ChatPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App