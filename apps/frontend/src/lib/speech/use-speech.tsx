import React, { createContext, FC, PropsWithChildren, useContext, useEffect } from "react";
import { useSpeechRecognition } from "./speech";
import { useNavigate } from "react-router";

const generateGrammar = (...words: string[]) => {
  return `
#JSGF V1.0;
grammar words;
public <word> = ${words.join(" | ")} ;
`;
};

const SpeechContext = createContext<ReturnType<typeof useSpeechRecognition>>(
  undefined as unknown as ReturnType<typeof useSpeechRecognition>
);

const progress = (str: string, search: string, callback: (str: string) => void) => {
  if (str.startsWith(search)) {
    return callback(str.substring(search.length).trim());
  }
};

const dispatch = (event: string, detail: string) => {
  window.dispatchEvent(new CustomEvent(event, { detail }));
};

export const SpeechProvider: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const speech = useSpeechRecognition({ grammar: generateGrammar("hey", "wong") });

  useEffect(() => {
    const normalized = speech.transcript.toLowerCase().substring(2).trim();
    console.log(normalized);
    // Handle commands
    progress(normalized, "hey wong", (command) => {
      console.log(command);

      // wongbot
      progress(command, "toggle dark mode", (detail) => dispatch("darkMode", detail));
      progress(command, "i have a question", (detail) => dispatch("prompt_wongbot", detail));
      progress(command, "stop", (detail) => dispatch("stop_audio_track", detail));
      progress(command, "stop talking", (detail) => dispatch("stop_audio_track", detail));
      progress(command, "quiet", (detail) => dispatch("stop_audio_track", detail));
      progress(command, "shut up", (detail) => dispatch("stop_audio_track", detail));
      progress(command, "zip it", (detail) => dispatch("stop_audio_track", detail));

      // forms
      progress(command, "set the hospital to", (detail) => dispatch("set_hospital", detail));
      progress(command, "set the hospital too", (detail) => dispatch("set_hospital", detail));
      progress(command, "set the hospital two", (detail) => dispatch("set_hospital", detail));
      progress(command, "set the hospital 2", (detail) => dispatch("set_hospital", detail));
      progress(command, "set department to", (detail) => dispatch("set_department", detail));
      progress(command, "set department too", (detail) => dispatch("set_department", detail));
      progress(command, "set department two", (detail) => dispatch("set_department", detail));
      progress(command, "set department 2", (detail) => dispatch("set_department", detail));
      progress(command, "set the assigned employee to", (detail) => dispatch("set_assignee", detail));
      progress(command, "set the assigned employee two", (detail) => dispatch("set_assignee", detail));
      progress(command, "set the assigned employee too", (detail) => dispatch("set_assignee", detail));
      progress(command, "set the assigned employee 2", (detail) => dispatch("set_assignee", detail));
      progress(command, "set the urgency level to", (detail) => dispatch("set_urgency", detail));
      progress(command, "set the urgency level 2", (detail) => dispatch("set_urgency", detail));
      progress(command, "set the urgency level two", (detail) => dispatch("set_urgency", detail));
      progress(command, "set the urgency level too", (detail) => dispatch("set_urgency", detail));

      progress(command, "note that", (detail) => dispatch("set_note", detail));

      progress(command, "set the medical device to", (detail) => dispatch("set_device", detail));
      progress(command, "set the medical device too", (detail) => dispatch("set_device", detail));
      progress(command, "set the medical device two", (detail) => dispatch("set_device", detail));
      progress(command, "set the medical device 2", (detail) => dispatch("set_device", detail));

      progress(command, "set the maintenance type to", (detail) => dispatch("set_maintType", detail));
      progress(command, "set the maintenance type two", (detail) => dispatch("set_maintType", detail));
      progress(command, "set the maintenance type too", (detail) => dispatch("set_maintType", detail));
      progress(command, "set the maintenance type 2", (detail) => dispatch("set_maintType", detail));
      progress(command, "set the maintenance facility to", (detail) => dispatch("set_facility", detail));
      progress(command, "set the maintenance facility two", (detail) => dispatch("set_facility", detail));
      progress(command, "set the maintenance facility too", (detail) => dispatch("set_facility", detail));
      progress(command, "set the maintenance facility 2", (detail) => dispatch("set_facility", detail));

      progress(command, "set the device type to", (detail) => dispatch("set_audioOrVisualNeeded", detail));
      progress(command, "set the device type two", (detail) => dispatch("set_audioOrVisualNeeded", detail));
      progress(command, "set the device type too", (detail) => dispatch("set_audioOrVisualNeeded", detail));
      progress(command, "set the device type 2", (detail) => dispatch("set_audioOrVisualNeeded", detail));

      progress(command, "set the language to", (detail) => dispatch("set_language", detail));
      progress(command, "set the language two", (detail) => dispatch("set_language", detail));
      progress(command, "set the language too", (detail) => dispatch("set_language", detail));
      progress(command, "set the language 2", (detail) => dispatch("set_language", detail));
      progress(command, "set the age to", (detail) => dispatch("set_age", detail));
      progress(command, "set the age two", (detail) => dispatch("set_age", detail));
      progress(command, "set the age too", (detail) => dispatch("set_age", detail));
      progress(command, "set the age 2", (detail) => dispatch("set_age", detail));

      progress(command, "set the name of the patient to", (detail) => dispatch("set_patient", detail));
      progress(command, "set the name of the patient two", (detail) => dispatch("set_patient", detail));
      progress(command, "set the name of the patient too", (detail) => dispatch("set_patient", detail));
      progress(command, "set the name of the patient 2", (detail) => dispatch("set_patient", detail));
      progress(command, "set the meal to", (detail) => dispatch("set_meal", detail));
      progress(command, "set the meal two", (detail) => dispatch("set_meal", detail));
      progress(command, "set the meal too", (detail) => dispatch("set_meal", detail));
      progress(command, "set the meal 2", (detail) => dispatch("set_meal", detail));
      progress(command, "set the drink to", (detail) => dispatch("set_drink", detail));
      progress(command, "set the drink two", (detail) => dispatch("set_drink", detail));
      progress(command, "set the drink too", (detail) => dispatch("set_drink", detail));
      progress(command, "set the drink 2", (detail) => dispatch("set_drink", detail));
      progress(command, "set the patient allergies to", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient allergies two", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient allergies too", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient allergies 2", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patients allergies to", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patients allergies two", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patients allergies too", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patients allergies 2", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient's allergies to", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient's allergies two", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient's allergies too", (detail) => dispatch("set_allergies", detail));
      progress(command, "set the patient's allergies 2", (detail) => dispatch("set_allergies", detail));

      progress(command, "set the destination to", (detail) => dispatch("set_transportation_destination", detail));
      progress(command, "set the destination two", (detail) => dispatch("set_transportation_destination", detail));
      progress(command, "set the destination too", (detail) => dispatch("set_transportation_destination", detail));
      progress(command, "set the destination 2", (detail) => dispatch("set_transportation_destination", detail));
      progress(command, "set the vehicle to", (detail) => dispatch("set_transportation_vehicle", detail));
      progress(command, "set the vehicle two", (detail) => dispatch("set_transportation_vehicle", detail));
      progress(command, "set the vehicle too", (detail) => dispatch("set_transportation_vehicle", detail));
      progress(command, "set the vehicle 2", (detail) => dispatch("set_transportation_vehicle", detail));

      progress(command, "submit the form", (detail) => dispatch("submit_form", detail));

      // nav page
      progress(command, "use current location", (detail) => dispatch("use_current_location", detail));
      progress(command, "set the travel mode to", (detail) => dispatch("set_travelMode", detail));
      progress(command, "navigate", (detail) => dispatch("navigate", detail));
      progress(command, "zoom to hospital", (detail) => dispatch("zoomToHospital", detail));
      progress(command, "zoom 2 hospital", (detail) => dispatch("zoomToHospital", detail));
      progress(command, "zoom too hospital", (detail) => dispatch("zoomToHospital", detail));
      progress(command, "zoom two hospital", (detail) => dispatch("zoomToHospital", detail));
      progress(command, "show step by step directions", (detail) => dispatch("showStepByStep", detail));
      progress(command, "clear navigation", (detail) => dispatch("clearNavigation", detail));
      progress(command, "go back", (detail) => dispatch("back", detail));
      progress(command, "read next step", (detail) => dispatch("readNextStep", detail));
      progress(command, "repeat current step", (detail) => dispatch("reReadNextStep", detail));
      progress(command, "read next hospital direction", (detail) => dispatch("readHospitalStep", detail));
      progress(command, "repeat current hospital direction", (detail) => dispatch("reReadNextStep", detail));
      progress(command, "toggle handicap", (detail) => dispatch("Handicap", detail));

      // navigate to diff pages

      progress(command, "i want to go to a hospital", () => navigate("/"));
      progress(command, "i want to go two a hospital", () => navigate("/"));
      progress(command, "i want to go too a hospital", () => navigate("/"));
      progress(command, "i want to go 2 a hospital", () => navigate("/"));
      progress(command, "i want two go to a hospital", () => navigate("/"));
      progress(command, "i want two go two a hospital", () => navigate("/"));
      progress(command, "i want two go too a hospital", () => navigate("/"));
      progress(command, "i want two go 2 a hospital", () => navigate("/"));
      progress(command, "i want too go to a hospital", () => navigate("/"));
      progress(command, "i want too go two a hospital", () => navigate("/"));
      progress(command, "i want too go too a hospital", () => navigate("/"));
      progress(command, "i want too go 2 a hospital", () => navigate("/"));
      progress(command, "i want 2 go to a hospital", () => navigate("/"));
      progress(command, "i want 2 go two a hospital", () => navigate("/"));
      progress(command, "i want 2 go too a hospital", () => navigate("/"));
      progress(command, "i want 2 go 2 a hospital", () => navigate("/"));

      progress(command, "i want to go to the hospital", () => navigate("/"));
      progress(command, "i want to go two the hospital", () => navigate("/"));
      progress(command, "i want to go too the hospital", () => navigate("/"));
      progress(command, "i want to go 2 the hospital", () => navigate("/"));
      progress(command, "i want two go to the hospital", () => navigate("/"));
      progress(command, "i want two go two the hospital", () => navigate("/"));
      progress(command, "i want two go too the hospital", () => navigate("/"));
      progress(command, "i want two go 2 the hospital", () => navigate("/"));
      progress(command, "i want too go to the hospital", () => navigate("/"));
      progress(command, "i want too go two the hospital", () => navigate("/"));
      progress(command, "i want too go too the hospital", () => navigate("/"));
      progress(command, "i want too go 2 the hospital", () => navigate("/"));
      progress(command, "i want 2 go to the hospital", () => navigate("/"));
      progress(command, "i want 2 go two the hospital", () => navigate("/"));
      progress(command, "i want 2 go too the hospital", () => navigate("/"));
      progress(command, "i want 2 go 2 the hospital", () => navigate("/"));

      progress(command, "i need to go to a hospital", () => navigate("/"));
      progress(command, "i need to go two a hospital", () => navigate("/"));
      progress(command, "i need to go too a hospital", () => navigate("/"));
      progress(command, "i need to go 2 a hospital", () => navigate("/"));
      progress(command, "i need two go to a hospital", () => navigate("/"));
      progress(command, "i need two go two a hospital", () => navigate("/"));
      progress(command, "i need two go too a hospital", () => navigate("/"));
      progress(command, "i need two go 2 a hospital", () => navigate("/"));
      progress(command, "i need too go to a hospital", () => navigate("/"));
      progress(command, "i need too go two a hospital", () => navigate("/"));
      progress(command, "i need too go too a hospital", () => navigate("/"));
      progress(command, "i need too go 2 a hospital", () => navigate("/"));
      progress(command, "i need 2 go to a hospital", () => navigate("/"));
      progress(command, "i need 2 go two a hospital", () => navigate("/"));
      progress(command, "i need 2 go too a hospital", () => navigate("/"));
      progress(command, "i need 2 go 2 a hospital", () => navigate("/"));

      progress(command, "i need to go to the hospital", () => navigate("/"));
      progress(command, "i need to go two the hospital", () => navigate("/"));
      progress(command, "i need to go too the hospital", () => navigate("/"));
      progress(command, "i need to go 2 the hospital", () => navigate("/"));
      progress(command, "i need two go to the hospital", () => navigate("/"));
      progress(command, "i need two go two the hospital", () => navigate("/"));
      progress(command, "i need two go too the hospital", () => navigate("/"));
      progress(command, "i need two go 2 the hospital", () => navigate("/"));
      progress(command, "i need too go to the hospital", () => navigate("/"));
      progress(command, "i need too go two the hospital", () => navigate("/"));
      progress(command, "i need too go too the hospital", () => navigate("/"));
      progress(command, "i need too go 2 the hospital", () => navigate("/"));
      progress(command, "i need 2 go to the hospital", () => navigate("/"));
      progress(command, "i need 2 go two the hospital", () => navigate("/"));
      progress(command, "i need 2 go too the hospital", () => navigate("/"));
      progress(command, "i need 2 go 2 the hospital", () => navigate("/"));

      progress(command, "go to the about page", () => navigate("/about"));
      progress(command, "go two the about page", () => navigate("/about"));
      progress(command, "go too the about page", () => navigate("/about"));
      progress(command, "go 2 the about page", () => navigate("/about"));

      progress(command, "go to the employee directory", () => navigate("/employees"));
      progress(command, "go two the employee directory", () => navigate("/employees"));
      progress(command, "go too the employee directory", () => navigate("/employees"));
      progress(command, "go 2 the employee directory", () => navigate("/employees"));

      progress(command, "go to the employee forum", () => navigate("/forum"));
      progress(command, "go too the employee forum", () => navigate("/forum"));
      progress(command, "go two the employee forum", () => navigate("/forum"));
      progress(command, "go 2 the employee forum", () => navigate("/forum"));

      progress(command, "list all requests", () => navigate("/view/allservicereqs"));

      progress(command, "list requests i created", () => navigate("/view/createdservicereqs"));

      progress(command, "list requests assigned to me", () => navigate("/view/assignedservicereqs"));

      progress(command, "create a maintenance request", () => navigate("/request/maintenance"));

      progress(command, "create a language request", () => navigate("/request/interpreter"));

      progress(command, "create a patient meal request", () => navigate("/request/meal"));

      progress(command, "create a medical device request", () => navigate("/request/medicaldevice"));

      progress(command, "create a av request", () => navigate("/request/avdevice"));
      progress(command, "create a a slash v request", () => navigate("/request/avdevice"));
      progress(command, "create a a slash vee request", () => navigate("/request/avdevice"));
      progress(command, "create a a / v request", () => navigate("/request/avdevice"));
      progress(command, "create a a / vee request", () => navigate("/request/avdevice"));
      progress(command, "create a a/v request", () => navigate("/request/avdevice"));
      progress(command, "create a a/vee request", () => navigate("/request/avdevice"));
      progress(command, "create a audio visual request", () => navigate("/request/avdevice"));
      progress(command, "create a audio slash visual request", () => navigate("/request/avdevice"));
      progress(command, "create a audio / visual request", () => navigate("/request/avdevice"));
      progress(command, "create a audio/visual request", () => navigate("/request/avdevice"));

      progress(command, "create an av request", () => navigate("/request/avdevice"));
      progress(command, "create an a slash v request", () => navigate("/request/avdevice"));
      progress(command, "create an a slash vee request", () => navigate("/request/avdevice"));
      progress(command, "create an a / v request", () => navigate("/request/avdevice"));
      progress(command, "create an a / vee request", () => navigate("/request/avdevice"));
      progress(command, "create an a/v request", () => navigate("/request/avdevice"));
      progress(command, "create an a/vee request", () => navigate("/request/avdevice"));
      progress(command, "create an audio visual request", () => navigate("/request/avdevice"));
      progress(command, "create an audio slash visual request", () => navigate("/request/avdevice"));
      progress(command, "create an audio / visual request", () => navigate("/request/avdevice"));
      progress(command, "create an audio/visual request", () => navigate("/request/avdevice"));

      progress(command, "create a transportation request", () => navigate("/request/transportation"));

      progress(command, "play crossy wong", () => navigate("/games"));

      progress(command, "open the event calendar", () => navigate("/calendar"));

      progress(command, "list request statistics", () => navigate("/view/stats"));

      progress(command, "open the admin settings", () => navigate("/settings/admin"));

      progress(command, "open my profile settings", () => navigate("/settings/profile"));
      progress(command, "open the profile settings", () => navigate("/settings/profile"));

      // freak
      progress(command, "say some freaky shit", () => dispatch("play_audio_track", "/audio/freak.mp3"));
    });
  }, [speech.transcript]);

  return <SpeechContext.Provider value={speech}>{children}</SpeechContext.Provider>;
};

export const useSpeech = () => useContext(SpeechContext);
