import { useState, useRef, useEffect } from "react";
import useAuth from "./hooks/useAuth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const LOGIN_URL = "/login";

function Login() {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const nameRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    nameRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [name, password]);

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
      const res = await axios.post(LOGIN_URL, { name, password });
      setUser(res.data);
      setAuth(res.data);
      setName("");
      setPassword("");
      navigate(from, { replace: true });
      // setSuccess(true);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No server response!");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing name or password!");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized!");
      } else {
        setErrMsg("Login failed!");
      }

      errRef.current.focus();
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
    <>
      {user ? (
        <section className="home">
          <span>
            Welcome to the <b>{user.admin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.name}</b>.
          </span>
          {/* <span
            style={{ fontSize: "18px", fontWeight: "bold", marginTop: "2px" }}
          >
            Delete Users:
          </span>
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
          )} */}
          <Link to="/admin">Admin page</Link>
          <Link to="/user">User page</Link>

          <button className="submitButton" onClick={handleLogout}>
            Logout
          </button>
        </section>
      ) : (
        <section className="login">
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>

          <form onSubmit={handleLogin}>
            <span className="formTitle">Demo Login</span>
            <div className="form-row">
              <label htmlFor="name">Name</label>

              <input
                type="text"
                id="name"
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: "10px" }}
                ref={nameRef}
                autoComplete="off"
                value={name}
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="password">Password</label>

              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: "10px" }}
                required
                value={password}
              />
            </div>
            <button
              type="submit"
              className="submitButton"
              disabled={!name || !password ? true : false}
            >
              Login
            </button>
          </form>

          <p className="link-to">
            Need an account? <br />
            <span>
              <Link to="/signup">Create an Account</Link>
            </span>
          </p>
        </section>
      )}
    </>
  );
}

export default Login;
