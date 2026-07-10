import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import groq from "../Groq.js";
import moment from "moment";
import axios from "axios";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get current user error: ${error.message}` });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true },
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update assistant error: ${error.message}` });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userName = user.name;
    const assistantName = user.assistantName || "Assistant";

    const saveHistory = async (entry) => {
      user.history.push(entry);
      // Keep only the most recent 200 exchanges so the doc doesn't grow forever
      if (user.history.length > 200) {
        user.history = user.history.slice(-200);
      }
      await user.save();
    };

    const result = await aiResponse(command, assistantName, userName);
    if (!result) {
      const response =
        "Sorry, I couldn't reach my AI service right now. Check the backend terminal for a Groq error and confirm your GROQ_API_KEY in .env.";
      await saveHistory({ input: command, response, type: "error" });
      return res
        .status(500)
        .json({ type: "error", userInput: command, response });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(result);
    } catch (e) {
      await saveHistory({ input: command, response: result, type: "general" });
      return res.status(200).json({
        type: "general",
        userInput: command,
        response: result,
      });
    }

    const type = gemResult.type;
    let finalResponse;

    switch (type) {
      case "get_date":
        finalResponse = `Today's date is ${moment().format("MMMM Do YYYY")}`;
        break;
      case "get_time":
        finalResponse = `The current time is ${moment().format("hh:mm A")}`;
        break;
      case "get_day":
        finalResponse = `Today is ${moment().format("dddd")}`;
        break;
      case "get_month":
        finalResponse = `The current month is ${moment().format("MMMM")}`;
        break;
      case "weather_show":
        try {
          const place = (gemResult.location || "").trim();
          const wttrUrl = `https://wttr.in/${encodeURIComponent(place)}?format=%C+%t,+feels+like+%f,+humidity+%h,+wind+%w`;
          const weatherRes = await axios.get(wttrUrl, { timeout: 8000 });
          const summary = String(weatherRes.data).trim();
          finalResponse = place
            ? `Here's the weather in ${place}: ${summary}`
            : `Here's the current weather: ${summary}`;
        } catch (weatherErr) {
          console.log("Weather fetch error:", weatherErr.message);
          finalResponse =
            "Sorry, I couldn't fetch live weather data right now. Try again in a moment.";
        }
        break;
      default:
        finalResponse = gemResult.response;
        break;
    }

    await saveHistory({ input: command, response: finalResponse, type });

    return res.json({
      type,
      userInput: gemResult.userInput,
      response: finalResponse,
    });
  } catch (error) {
    console.log("askToAssistant error:", error.message);
    return res
      .status(500)
      .json({ type: "error", response: "Sorry, something went wrong." });
  }
};
