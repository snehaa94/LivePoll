import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";
const socket = io(apiUrl);

const TeacherLandingPage = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([{ id: 1, text: "", correct: null }]);
  const [timer, setTimer] = useState("60");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const handleQuestionChange = (e) => setQuestion(e.target.value);
  const handleTimerChange = (e) => setTimer(e.target.value);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleCorrectToggle = (index, isCorrect) => {
    const updated = [...options];
    updated[index].correct = isCorrect;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { id: options.length + 1, text: "", correct: null }]);
  };

  const validateForm = () => {
    if (!question.trim()) return setError("Question cannot be empty"), false;
    if (options.length < 2) return setError("At least two options are required"), false;
    if (options.some((opt) => !opt.text.trim())) return setError("All options must have text"), false;
    if (!options.some((opt) => opt.correct === true))
      return setError("At least one correct option must be selected"), false;
    setError("");
    return true;
  };

  const askQuestion = () => {
    if (validateForm()) {
      const teacherUsername = sessionStorage.getItem("username");
      const pollData = { question, options, timer, teacherUsername };
      socket.emit("createPoll", pollData);
      navigate("/teacher-poll");
    }
  };

  const handleViewPollHistory = () => navigate("/teacher-poll-history");

  return (
    <>
      {/* View Poll history */}
      <button
        className="float-right m-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] flex items-center gap-2"
        onClick={handleViewPollHistory}
      >
        <img src={eyeIcon} alt="" />
        View Poll history
      </button>

      <div className="container mx-auto w-3/4 my-4 ms-5">
        <button className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-purple-600 text-white mb-3">
          <img src={stars} alt="Poll Icon" /> Intervue Poll
        </button>

        <h2 className="font-bold text-2xl">
          Let&apos;s <strong>Get Started</strong>
        </h2>
        <p>
          <b>Teacher: </b>
          {username}
        </p>
        <p className="text-gray-500">
          You&apos;ll have the ability to create and manage polls, ask questions, and
          monitor your students&apos; responses in real-time.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="mb-4">
          <div className="flex justify-between items-center pb-3">
            <label htmlFor="question" className="font-medium">
              Enter your question
            </label>
            <select
              className="border rounded px-2 py-1 bg-gray-100"
              value={timer}
              onChange={handleTimerChange}
            >
              <option value="60">60 seconds</option>
              <option value="30">30 seconds</option>
              <option value="90">90 seconds</option>
            </select>
          </div>
          <input
            type="text"
            id="question"
            className="w-full rounded px-3 py-2 bg-gray-100 border"
            onChange={handleQuestionChange}
            maxLength="100"
            placeholder="Type your question..."
          />
          <div className="text-right text-gray-500 mt-1">{question.length}/100</div>
        </div>

        {/* Options */}
        <div className="mb-4">
          <div className="flex justify-between pb-3">
            <label className="font-medium">Edit Options</label>
            <label className="font-medium">Is it correct?</label>
          </div>

          {options.map((option, index) => (
            <div key={option.id} className="flex items-center mb-2">
              <span className="flex items-center justify-center text-white text-sm font-semibold mr-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#8F64E1] to-[#4E377B]">
                {index + 1}
              </span>
              <input
                type="text"
                className="flex-1 rounded px-3 py-2 bg-gray-100 border mr-3"
                placeholder="Option text..."
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              <div className="flex items-center mr-3">
                <input
                  type="radio"
                  className="accent-[#7565d9] mr-1"
                  name={`correct-${index}`}
                  checked={option.correct === true}
                  onChange={() => handleCorrectToggle(index, true)}
                />
                <label>Yes</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  className="accent-[#7565d9] mr-1"
                  name={`correct-${index}`}
                  checked={option.correct === false}
                  onChange={() => handleCorrectToggle(index, false)}
                />
                <label>No</label>
              </div>
            </div>
          ))}
        </div>

        <button
          className="border border-[#7565d9] text-[#8F64E1] px-3 py-1 rounded"
          onClick={addOption}
        >
          + Add More option
        </button>
      </div>

      <hr className="my-4" />

      <button
        className="float-right m-2 px-6 py-2 rounded-full text-white bg-gradient-to-r from-[#8F64E1] to-[#1D68BD]"
        onClick={askQuestion}
      >
        Ask Question
      </button>
    </>
  );
};

export default TeacherLandingPage;
