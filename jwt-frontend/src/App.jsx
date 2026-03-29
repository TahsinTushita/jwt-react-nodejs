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
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = user && jwtDecode(user.accessToken);

      if (decodedToken.exp < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }

      return config;
    },
    (err) => {
      return Promise.reject(err);
    },
  );

  console.log(user && jwtDecode(user.accessToken));

  async function handleSubmit(e) {
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
      await axiosJWT.delete("/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
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
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Lama Login</span>
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
