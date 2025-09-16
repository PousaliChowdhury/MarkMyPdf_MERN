import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Library from './pages/Library';
import PdfViewer from './pages/PdfViewer';
import { useState } from 'react';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/navbar" element={<Navbar/>} />
        <Route path="/library" element={<PrivateRoute><Library/></PrivateRoute>} />
        <Route path="/pdf/:uuid" element={<PrivateRoute><PdfViewer/></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/library" />} />
      </Routes>
    </BrowserRouter>
  );
}
