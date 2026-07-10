import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/authBg.png";
import { userDataContext } from "../context/UserContext";
import { IoEye, IoEyeOff } from "react-icons/io5";

const SignIn = () => {
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setErr(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSignIn}
        className="w-[90%] h-[500px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-6 px-7"
      >
        <h1 className="text-white text-3xl font-semibold mb-4">
          Sign In to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2 rounded-full text-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="w-full h-[60px] border-2 border-white bg-transparent rounded-full relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full h-full outline-none bg-transparent text-white placeholder-gray-300 px-5 py-2 rounded-full text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <IoEyeOff
              className="absolute top-[18px] right-[20px] text-white cursor-pointer"
              size={25}
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <IoEye
              className="absolute top-[18px] right-[20px] text-white cursor-pointer"
              size={25}
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {err && <p className="text-red-500 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-lg mt-3 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-white text-sm">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
