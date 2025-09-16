import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <h3>PDF Annotator</h3>
      <button onClick={() => { logout(); navigate("/login"); }}>
        Logout
      </button>
      <>
          <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
          <Link to="/signup">Signup</Link>
      </>
    </nav>
  );
}

