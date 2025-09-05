import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export const DisclaimerBanner = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className="">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="fixed top-0 left-0 w-full flex justify-center z-50">
        <AnimatePresence initial={false} mode="wait">
          {visible ? (
            <motion.div
              key="banner"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="min-h-8 w-[90%] sm:max-w-[80%] md:max-w-[60%] lg:max-w-[45%]
            bg-yellow-100/75 border border-yellow-300 text-yellow-900 text-sm
            font-medium px-4 py-2 mt-2 rounded shadow-md relative pointer-events-auto"
            >
              <div className={"flex justify-between items-start"}>
                <p className="text-center text-xs sm:text-sm md:text-base leading-snug break-words">
                  This website is a term project exercise for WPI CS 3733 Software Engineering (Prof. Wong) and is not
                  to be confused with the actual Brigham & Women’s Hospital website.
                </p>
                <button
                  onClick={() => setVisible(false)}
                  className="absolute top-1 right-1 p-1 text-yellow-800 hover:text-yellow-600 text-lg font-bold"
                  aria-label="Close disclaimer"
                >
                  <X className={"w-4 h-4 cursor-pointer"} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setVisible(true)}
              className="bg-yellow-100/75 text-yellow-900 text-sm px-4 py-1 mt-2 border border-yellow-300 rounded shadow pointer-events-auto cursor-pointer"
            >
              Show Disclaimer
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
