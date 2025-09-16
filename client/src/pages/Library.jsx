import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom'; 
import "../styles/library.css";

export default function Library(){
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate(); 

  useEffect(()=> {
    fetchList();
  }, []);

  async function fetchList(){
    const res = await api.get('/pdfs');
    setPdfs(res.data.pdfs || []);
  }

  async function handleUpload(e){
    e.preventDefault();
    if(!file) return;
    const form = new FormData();
    form.append('file', file);
    await api.post('/pdfs/upload', form, { headers: { 'Content-Type': 'multipart/form-data' }});
    setFile(null);
    fetchList();
  }

  async function deletePdf(uuid) {
    await api.delete(`/pdfs/${uuid}`);
    fetchList();
  }

  async function renamePdf(uuid) {
    const newName = prompt("Enter new name (without extension):");
    if (!newName) return;

    try {
      const res = await api.patch(`/pdfs/rename/${uuid}`, { newName });
      console.log("Rename successful:", res.data.pdf);
      fetchList();
    } catch (err) {
      console.error("Rename failed:", err.response?.data || err.message);
      alert("Failed to rename PDF: " + (err.response?.data?.message || err.message));
    }
  }

  function logout() {
    localStorage.removeItem('token'); 
    navigate("/login"); 
  }

  return (
    <div className="fullscreen-bg bg-library">
      <div className="auth-form library-form">
        <h2 className="form-title">My Library 📚</h2>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={e=>setFile(e.target.files[0])}
          />
          <button type="submit">Upload</button>
        </form>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <ul className="library-grid">
        {pdfs.map((p) => (
          <li key={p.uuid} className="pdf-card">
            <Link to={`/pdf/${p.uuid}`}>{p.originalName}</Link>
            <button onClick={() => renamePdf(p.uuid)}>Rename</button>
            <button onClick={() => deletePdf(p.uuid)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
