import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase.js';
import api from '../utils/api.js';
import { useDispatch } from 'react-redux';
import { setAuth, setUser } from '../redux/authSlice.js';

const LoginModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      if (token) {
        const response = await api('/api/auth/login/', {
          method: 'POST',
          body: { token },
        });

        if (!response.ok) {
          throw new Error('Failed to login with Google');
        }
        const data = await response.json();
        console.log('Google login successful', data);
        dispatch(setUser(data?.user));
        dispatch(setAuth(!!data?.user));
        onClose();
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-black border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Modal Header */}
            <div className="relative px-6 py-5">
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-8">
              <div>
                <h2 className="text-2xl font-bold text-center text-white">Sign In to CMAI</h2>
                <p className="text-center text-gray-400 my-3 text-sm">
                  Continue your AI Interview journey
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <FcGoogle size={24} />
                <span className="font-medium text-gray-800">Continue with Google</span>
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;