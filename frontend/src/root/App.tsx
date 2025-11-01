import { Route, Routes } from "react-router";
import Chat from "../pages/Chat";
import Signup from "../pages/Signup";
import Login from "../pages/Login";

const App = () => {
  return (
    <div className="bg-gray-900 min-h-screen overflow-hidden text-white flex justify-center items-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl opacity-70">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
      </div>
      <div className="relative z-10 flex text-6xl text-amber-50">
        <Routes>
          <Route path="/" element={<Chat/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
