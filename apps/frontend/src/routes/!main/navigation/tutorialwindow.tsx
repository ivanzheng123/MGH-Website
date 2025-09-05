type TutorialStep = {
  title: string;
  description: string;
  videoUrl?: string;
};

type TutorialProps = {
  step: number;
  onNext: () => void;
  onSkip: () => void;
};

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to the Map Editor",
    description: "This is step 1. Follow the instructions to get started using the map editor.",
  },
  {
    title: "Selecting a Hospital",
    description:
      "Choose the hospital you would like to work with from the dropdown. You can change this after initial selection." +
      " To get familiar with the node editor, we suggest choosing Patriot Place.",
  },
  {
    title: "Setting the Floor",
    description: "Now select which floor of the hospital you are editing, for now let's just go with Floor 1.",
  },
  {
    title: "Selecting a Pathfinding Algorithm",
    description:
      "The editor offers 3 types of pathfinding algorithms, " +
      "if you would not like to change the algorithm, click next.",
  },
  {
    title: "Zooming to Hospital",
    description: "After selecting a hospital, you can zoom it. Try it out!",
  },
  {
    title: "Utilizing Add Mode | Part 1",
    description: "Nice work, now enter Add Mode by selecting the green button on the right.",
  },
  {
    title: "Utilizing Add Mode | Part 2",
    description: "Try to add a node by left clicking anywhere on the map.",
  },
  {
    title: "Utilizing Add Mode | Part 3",
    description: "Let's add another one too so that you can create an edge.",
  },
  {
    title: "Utilizing Add Mode | Part 4",
    description:
      "Perfect, now right click on one of your newly created nodes and then right click the other to form an edge. " +
      "If you want to cancel an edge creation after clicking the first node, press escape.",
  },
  {
    title: "Utilizing Delete Mode | Part 1",
    description: "Now let's clean up our work by entering Delete Mode with the red button on the right.",
  },
  {
    title: "Utilizing Delete Mode | Part 2",
    description: "First, delete the edge you just made by left clicking it.",
  },
  {
    title: "Utilizing Delete Mode | Part 3 | 1/2",
    description: "Now delete the two nodes you created so that our map is the same as when we entered the editor.",
  },
  {
    title: "Utilizing Delete Mode | Part 3 | 2/2",
    description: "Now delete the two nodes you created so that our map is the same as when we entered the editor.",
  },
  {
    title: "Exiting Modes",
    description:
      "To exit either Add or Delete Mode, just click the button for the mode you are currently in, so for us, that's the Delete Mode button.",
  },
  {
    title: "Editing Nodes | Part 1",
    description:
      "If you want to change the name of a node, click on it and input a name, this becomes important for textual directions!" +
      " Try it out by naming an existing node what the user should do once they reach it. " +
      "Once finished, click the marker again to hide it.",
  },
  {
    title: "Editing Nodes | Part 2",
    description: "Not happy with where a node is? Simply click and drag it to change its location.",
  },
  {
    title: "What if I Forget These Instructions?",
    description: "Don't worry, click the info button in the top right to toggle the instructions.",
  },
  {
    title: "Exiting Edit Mode",
    description: "Once you are done working, you can either save & exit edit mode or just exit edit mode.",
  },
];

export function TutorialWindow({ step, onNext, onSkip }: TutorialProps) {
  const content = tutorialSteps[step - 1];

  if (!content) return null;

  return (
    <div className="fixed top-2 left-27/64 transform -translate-x-1/2 z-[100]">
      <div className="panel-3 rounded-xl shadow-lg pt-2 pb-3 px-2 w-165 text-center flex flex-col">
        <h2 className="text-2xl font-bold mb-1">{content.title}</h2>
        <p className={`text-foreground ${step === 1 || 18 ? "mb-2" : ""}`}>{content.description}</p>
        {(step == 1 || step == 4) && (
          <button
            className="bg-hospital-blue text-white rounded hover:bg-hospital-darkerblue text-base self-center px-8 py-1 text-lg
             cursor-pointer"
            onClick={onNext}
          >
            Next
          </button>
        )}
        {step === 18 && (
          <button
            className="bg-hospital-blue text-white rounded hover:bg-hospital-darkerblue text-base self-center px-8 py-1 text-lg
            hover:cursor-pointer"
            onClick={onSkip}
          >
            Finish
          </button>
        )}
        <button
          className={`hover:cursor-pointer bg-hospital-blue text-white rounded hover:bg-hospital-darkerblue text-base self-center px-4 py-1
          text-sm ${step === 1 || 4 ? "mt-2" : "mt-0"} cursor-pointer`}
          onClick={onSkip}
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
}
