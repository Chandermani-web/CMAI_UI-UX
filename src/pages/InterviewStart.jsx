import React from 'react'
import Step1setup from '../components/interview/Step1setup.jsx';
import { useSelector } from 'react-redux';
import { setUser } from '../redux/authSlice.js';

const InterviewStart = () => {
  const user = useSelector((state) => state.auth.user);
  const resume = useSelector((state) => state.resume.resume);
  return (
    <Step1setup user={user} setUser={setUser} resume={resume} />
  )
}

export default InterviewStart
