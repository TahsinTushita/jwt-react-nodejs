import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", null);

      setUser((prevUser) => ({
        ...prevUser,
        accessToken: res.data.accessToken,
      }));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const axiosJWT = axios.create({
    withCredentials: true,
  });

  axiosJWT.interceptors.request.use(
    async (config) => {
      if (!user) return config;

      const decodedToken = jwtDecode(user.accessToken);
      const tokenExpired = decodedToken.exp * 1000 < Date.now();

      if (tokenExpired) {
        const data = await refreshToken();
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${data.accessToken}`,
        };
      } else {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${user.accessToken}`,
        };
      }

      return config;
    },
    (err) => Promise.reject(err),
  );

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await axios.post("/login", { name, password });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);

    try {
      await axiosJWT.delete("/users/" + id);
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  const handleLogout = async () => {
    setSuccess(false);
    setError(false);

    try {
      const res = await axiosJWT.post("/logout", null);
      console.log(res.data);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.admin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.name}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(70879)}>
            Delete John
          </button>
          <button className="deleteButton" onClick={() => handleDelete(70880)}>
            Delete Yuji
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}

          <button className="submitButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleLogin}>
            <span className="formTitle">Demo Login</span>
            <input
              type="text"
              placeholder="name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
