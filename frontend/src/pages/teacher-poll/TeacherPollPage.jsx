import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ChatPopover from "../../components/chat/ChatPopover";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";

const socket = io(apiUrl);

const TeacherPollPage = () => {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
    });

    socket.on("pollResults", (updatedVotes) => {
      setVotes(updatedVotes);
      setTotalVotes(Object.values(updatedVotes).reduce((a, b) => a + b, 0));
    });

    return () => {
      socket.off("pollCreated");
      socket.off("pollResults");
    };
  }, []);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  const askNewQuestion = () => {
    navigate("/teacher-home-page");
  };

  const handleViewPollHistory = () => {
    navigate("/teacher-poll-history");
  };

  return (
    <>
      {/* View Poll History Button */}
      <button
        className="float-right rounded-full bg-[#8F64E1] text-white px-6 py-2 m-2 flex items-center gap-2 shadow-md hover:opacity-90"
        onClick={handleViewPollHistory}
      >
        <img src={eyeIcon} alt="history" />
        View Poll history
      </button>

      <div className="container mx-auto mt-16 w-1/2">
        <h3 className="mb-6 text-center text-xl font-semibold">Poll Results</h3>

        {pollQuestion ? (
          <>
            <div className="rounded-lg shadow-md bg-white">
              <div className="p-4">
                {/* Question */}
                <h6 className="py-2 px-3 rounded text-white bg-gradient-to-r from-[#343434] to-[#6e6e6e] text-left">
                  {pollQuestion} ?
                </h6>

                {/* Options */}
                <div className="mt-6 space-y-3">
                  {pollOptions.map((option) => (
                    <div
                      key={option.id}
                      className="rounded border border-gray-200 p-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span>{option.text}</span>
                        <span>
                          {Math.round(
                            calculatePercentage(votes[option.text] || 0)
                          )}
                          %
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded h-2 mt-2">
                        <div
                          className="h-2 rounded bg-[#7565d9] transition-all"
                          style={{
                            width: `${calculatePercentage(
                              votes[option.text] || 0
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ask New Question */}
            <div>
              <button
                className="float-right mt-4 rounded-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-6 py-2 shadow-md hover:opacity-90"
                onClick={askNewQuestion}
              >
                + Ask a new question
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center">
            Waiting for the teacher to start a new poll...
          </div>
        )}

        {/* Chat */}
        <ChatPopover />
      </div>
    </>
  );
};

export default TeacherPollPage;
