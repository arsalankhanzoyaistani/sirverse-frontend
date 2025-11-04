import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🚀 SirVerse Splash Screen
 * With beautiful new logo
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            {/* New Beautiful Logo with your image */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden mx-auto">
                {/* Your Logo Image */}
                <img
                  src="/logo.png"
                  alt="SirVerse Logo"
                  className="w-full h-full rounded-3xl object-cover"
                />
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine"></div>
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-white/40 rounded-bl-3xl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-white/40 rounded-br-3xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-white/40 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white/40 rounded-tr-3xl"></div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-blue-400/40 rounded-3xl blur-xl -z-10 animate-pulse"></div>
            </div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              SirVerse
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-600 text-sm"
            >
              Connect • Share • Explore
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
