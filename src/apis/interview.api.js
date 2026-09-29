import api from "../utils/api.js";

export const startInterview = async (data) => {
  try {
    const response = await api("/api/interview/start", {
      method: "POST",
      body: data,
    });
    console.log("Interview started successfully:", response);
    return response;
  } catch (error) {
    console.error("Error starting interview:", error);
    throw error;
  }
};

export const submitAnswer = async (data) => {
  try {
    const response = await api("/api/interview/answer", {
      method: "POST",
      body: data,
    });
    const result = await response.json();
    console.log("Answer submitted successfully:", result);
    return result;
  } catch (error) {
    console.log("Error submitting answer:", error);
    throw error;
  }
};

export const getInterview = async (interviewId) => {
  try {
    const response = await api(`/api/interview/${interviewId}`, {
      method: "GET",
    });
    const result = await response.json();
    console.log("Interview fetched successfully:", result);
    return result;
  } catch (error) {
    console.error("Error fetching interview:", error);
    throw error;
  }
};

export const getAllInterviews = async () => {
    try {
        const response = await api("/api/interview/all-interview", {
            method: "GET",
        });
        const result = await response.json();
        console.log("All interviews fetched successfully:", result);
        return result;
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        throw error; 
    }
}