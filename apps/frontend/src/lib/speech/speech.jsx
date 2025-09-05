import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition({ lang = "en-US", grammar = "", continuous = true } = {}) {
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [shouldListen, setShouldListen] = useState(false);

  // Keep the ref in sync with the state
  useEffect(() => {
    shouldListenRef.current = shouldListen;
  }, [shouldListen]);

  const createRecognitionInstance = useCallback(() => {
    //checks to see if the browser supports the web speech api
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Your browser doesn't support the Web Speech API.");
      return null;
    }
    //makes a new speech recognition instance
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    if (grammar) {
      const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      if (SpeechGrammarList) {
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
      }
    }
    return recognition;
  }, [lang, grammar, continuous]);

  //starts the listening for speech recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognitionInstance();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  }, [createRecognitionInstance]);

  //stops and aborts the recognition process
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  //public toggle function to switch listening on/off
  const toggleListening = useCallback(() => {
    setShouldListen((prev) => !prev);
  }, []);

  //sets up event handlers and builds/rebuilds recognition
  useEffect(() => {
    const recognition = createRecognitionInstance();
    if (!recognition) {
      return;
    }
    recognitionRef.current = recognition;

    //creates an event when recognition starts
    recognition.onstart = () => {
      setIsListening(true);
    };

    //when we get the result of a speech
    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const result = event.results[lastIndex];
      const spokenPhrase = result[0].transcript;
      //if it is the final result, update the state
      if (result.isFinal) {
        setTranscript((prevState) => {
          const msgId = prevState[0];
          if (msgId === "0") {
            return `1 ${spokenPhrase}`;
          }
          return `0 ${spokenPhrase}`;
        });
      }
    };

    //creates an event to show that an error has occured
    recognition.onerror = (event) => {
      console.error(`Speech recognition error (${event.error}):`, event);
      if (event.error === "aborted" && shouldListenRef.current) {
        setTimeout(() => {
          startRecognition();
        }, 250);
      }
    };

    //when the recognition ends sets listening to false
    recognition.onend = () => {
      setIsListening(false);
      // Only restart if shouldListen remains true.
      if (shouldListenRef.current) {
        startRecognition();
      }
    };

    // Start or stop recognition based on shouldListen state
    if (shouldListen) {
      startRecognition();
    } else {
      stopRecognition();
    }

    //cleans up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [shouldListen, createRecognitionInstance, startRecognition, stopRecognition]);

  return { transcript, isListening, toggleListening };
}
