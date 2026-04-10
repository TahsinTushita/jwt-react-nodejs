import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./SignUp";
import Login from "./Login";
import Admin from "./Admin";
import User from "./User";
import NotFound from "./NotFound";
import Unauthorized from "./Unauthorized";
import RequireAuth from "./RequireAuth";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<RequireAuth allowedRole={"admin"} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route element={<RequireAuth allowedRole={"user"} />}>
            <Route path="/user" element={<User />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
