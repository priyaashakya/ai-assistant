import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

const Customize2 = () => {
  const {
    serverUrl,
    backendImage,
    selectedImage,
    setUserData,
  } = useContext(userDataContext);

  const [assistantName, setAssistantName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-6 px-4">
      <h1 className="text-white text-2xl sm:text-3xl text-center">
        Give your <span className="text-blue-400">Assistant</span> a name
      </h1>

      <input
        type="text"
        placeholder="e.g. Jarvis, Friday, Nova..."
        className="w-full max-w-[500px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2 rounded-full text-lg text-center"
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
      />

      {assistantName && (
        <button
          onClick={handleUpdateAssistant}
          disabled={loading}
          className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-lg mt-4 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Finally Create Your Assistant"}
        </button>
      )}
    </div>
  );
};

export default Customize2;
