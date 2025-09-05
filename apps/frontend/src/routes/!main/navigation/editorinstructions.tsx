function EditorInstructions() {
  return (
    <div className={"text-xs rounded-lg text-hospital-darkblue"}>
      • Enter add mode and click to create nodes. <br />
      • Enter delete mode and click on edges or nodes to delete them.
      <br />• Right click a node to start creating an edge, right click another to complete it. Press esc to cancel
      creation.
      <br />• Click and drag on a node to move it.
    </div>
  );
}

export default EditorInstructions;
