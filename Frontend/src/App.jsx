import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Pages/Landing.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';

function App() {
  

  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
    </Routes>

  )
}

export default App
