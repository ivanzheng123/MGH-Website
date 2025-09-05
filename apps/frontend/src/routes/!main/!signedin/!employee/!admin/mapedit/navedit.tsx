import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { Node } from "common/src/node.ts";
import { hospitalDestinations } from "@/routes/!main/navigation/navinfo.tsx";
import { API } from "common/src/api/endpoints.ts";
import { Link } from "react-router";
import Editorinstructions from "@/routes/!main/navigation/editorinstructions.tsx";
import { TutorialWindow } from "@/routes/!main/navigation/tutorialwindow.tsx";
import { InfoPopover } from "@/components/InfoPopover.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

export function NavEdit({
  setMapCenter,
  setFloor,
  floor,
}: {
  setMapCenter: (center: google.maps.LatLngLiteral) => void;
  setFloor: (floor: number) => void;
  floor: number;
}) {
  const { getAccessTokenSilently } = useAuth0();

  // Get the current map instance and load the routes library.
  const map = useMap();

  const [aStarTime, setAStarTime] = useState(0);
  const [bfsTime, setBfsTime] = useState(0);
  const [dfsTime, setDfsTime] = useState(0);
  const [djikstraTime, setDjikstraTime] = useState(0);

  const algorithms = [
    { value: "A*", name: "A*", avgTime: aStarTime },
    { value: "DFS", name: "Depth-First Search", avgTime: dfsTime },
    { value: "BFS", name: "Breadth-First Search", avgTime: bfsTime },
    { value: "Djikstra", name: "Djikstra's Algorithm", avgTime: djikstraTime },
  ];

  useEffect(() => {
    async function getTimes() {
      const algoTimes = await fetch(API.PATHFIND.GETALGOTIMES.ROUTE).then((res) => res.json());
      setAStarTime(algoTimes.aStar);
      setDfsTime(algoTimes.dfs);
      setBfsTime(algoTimes.bfs);
      setDjikstraTime(algoTimes.djikstra);
    }

    getTimes();
    console.log("Times updated: ", aStarTime, dfsTime, bfsTime);
  }, []);

  function createInputField(id: number, name: string): HTMLElement {
    // Create a container div
    const container = document.createElement("div");

    // Add optional marker styles (e.g., a background or border)
    container.style.position = "relative";
    container.style.bottom = "20px";
    container.style.padding = "8px";
    container.style.backgroundColor = "white";
    container.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    container.style.borderRadius = "10px";
    container.style.borderColor = "rgba(209, 14, 14, 1)";
    container.style.borderWidth = "4px";

    const info = document.createElement("p");
    info.innerText = `Node: ${id}`;
    info.style.color = "black";

    const label = document.createElement("label");
    label.innerText = "Name: ";
    label.style.color = "black";

    // Create the input field
    const input = document.createElement("input");
    input.type = "text";
    input.defaultValue = name;
    input.style.width = "100px"; // Optional styling for the input
    input.style.padding = "4px";
    input.style.border = "1px solid #d10e0e";
    input.style.borderRadius = "4px";
    input.style.color = "black";

    // stops clicking the input box from closing the marker that contains it
    input.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("keyup", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("input", (event) => {
      console.log("input of marker changed");
      const node = nodesMap.current.get(id);
      if (node) {
        node.name = input.value;
        nodesMap.current.set(id, node);
        console.log(nodesMap.current);
      }
    });

    const tail = document.createElement("div");
    tail.style.position = "absolute";
    tail.style.bottom = "-25px";
    tail.style.left = "50%";
    tail.style.transform = "translateX(-50%)";
    tail.style.width = "0";
    tail.style.height = "0";
    tail.style.borderLeft = "20px solid transparent";
    tail.style.borderRight = "20px solid transparent";
    tail.style.borderTop = "25px solid #d10e0e";

    // Append the input field to the container
    container.appendChild(info);
    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(tail);

    return container;
  }

  const [selectedHospital, setSelectedHospital] = useState("Patriot Place");
  const [infoHidden, setInfoHidden] = useState(true);

  // State for the user's start location (origin).
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);

  const [hospitalFilter, setHospitalFilter] = useState<string | null>(null);

  // Existing state variables

  const [selectedDepartment, setSelectedDepartment] = useState<{
    label: string;
    location: string;
  } | null>(null);

  const nodesRef = useRef<google.maps.Circle[] | null>(null);
  const graphLines = useRef<google.maps.Polyline[] | null>(null);

  // tracking current version of graph
  const [circleVersion, setCircleVersion] = useState(0);

  // track tutorial step
  const [tutorialStep, setTutorialStep] = useState(1);

  // track mode
  const [currMode, setCurrMode] = useState(0);

  // will maybe be used for drawing line from starting node ot cursor
  const tempLine = useRef<google.maps.Polyline>(
    new google.maps.Polyline({
      strokeColor: "#d10e0e",
      strokeOpacity: 0.5,
      strokeWeight: 6,
      geodesic: true,
      clickable: false,
    })
  );
  tempLine.current.setMap(map);

  // used to keep track of the current set of nodes
  const nodesMap = useRef(new Map<number, Node>());

  // I will maybe use this to undo and redo edits
  // const [versionControl, setVersionControl] = useState(new Map<number, Map<number, Node>>());
  // const versionControl = new Map<number, Map<number, Node>>();
  const versionControl = useRef(new Map<number, Map<number, Node>>());
  const redo = useRef(false);
  const undo = useRef(false);

  const [maxID, setMaxID] = useState(0);

  const [algo, setAlgo] = useState<string | null>(null);

  useEffect(() => {
    const getAlgorithm = async () => {
      const res = await fetch(API.PATHFIND.GETALGO.ROUTE);
      const data = await res.json();
      setAlgo(data.algorithm);
    };
    getAlgorithm();
  }, []);

  // updates if map or addMode changes - used for adding nodes
  useEffect(() => {
    if (!map) return;

    const addNodeListener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
      // exits out if unable to get latlng or addMode is false
      if (!event.latLng) return;
      if (!addMode.current) return;

      // updates max id, uses it to add node entry to map, and updates the graph display
      setMaxID((prev) => {
        nodesMap.current.set(prev + 1, new Node(prev + 1, event.latLng!.lat(), event.latLng!.lng(), floor));
        return prev + 1;
      });

      setTutorialStep((prev) => (prev === 7 ? prev + 1 : prev === 8 ? prev + 1 : prev));

      setCircleVersion((prev) => prev + 1);
    });

    // listens for escape key press to cancel edge drawing
    google.maps.event.addDomListener(document, "keyup", (event: KeyboardEvent) => {
      // cancels the drawing of the edge between two nodes
      if (event.key === "Escape" && isDrawing.current) {
        tempLine.current.getPath().clear();
        isDrawing.current = false;
        clickedNodes = [];
        setNodePreviewMode(true);
      }
    });

    const versionControlListener = google.maps.event.addDomListener(document, "keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z" && circleVersion > 0) {
        console.log("Undoing");
        setCircleVersion((prev) => prev - 1);
        undo.current = true;
      } else if (event.ctrlKey && event.key === "y" && circleVersion < versionControl.current.size - 1) {
        console.log("Redoing");
        setCircleVersion((prev) => prev + 1);
        redo.current = true;
      }
    });

    // removes listener on cleanup to ensure addMode is up to date
    return () => {
      google.maps.event.removeListener(addNodeListener);
      google.maps.event.removeListener(versionControlListener);
    };
  }, [map, floor, circleVersion]);

  function deepCloneMap(map: Map<number, Node>): Map<number, Node> {
    const cloned = new Map<number, Node>();
    for (const [key, node] of map.entries()) {
      cloned.set(key, node.clone());
    }
    return cloned;
  }

  // updates whenever circle version changed
  useEffect(() => {
    const isUndoOrRedo = redo.current || undo.current;
    console.log("Version change happened: ", circleVersion);
    console.log("Nodes before passing ", nodesMap.current);
    // if this version has existed previously, it sets the map to that
    if (versionControl.current.has(circleVersion) && isUndoOrRedo) {
      console.log("Hit if statement");
      nodesMap.current = deepCloneMap(versionControl.current.get(circleVersion)!);
      redo.current = false;
      undo.current = false;
    } else {
      console.log("Hit else statement");
      // Math.max(...Array.from(newNodesMap.keys()));
      Array.from(versionControl.current.keys()).forEach((ver) => {
        if (ver > circleVersion) versionControl.current.delete(ver);
      });
    }
    // if (versionControl.current.has(circleVersion))
    //   nodesMap.current = new Map(versionControl.current.get(circleVersion));
    console.log("Current Map: ", nodesMap.current);
    versionControl.current.set(circleVersion, deepCloneMap(nodesMap.current));
    console.log("Version control: ", versionControl.current);
    nodesMap.current = deepCloneMap(versionControl.current.get(circleVersion)!);
    console.log("Nodes after passing ", nodesMap.current);
    drawGraph(floor);
  }, [circleVersion]);

  // used to get the initial graph that the editor will work with -- contains all nodes
  async function getStartingGraph() {
    const response = await fetch(`/api/pathfind/getgraph`).then((res) => res.json());
    const newNodesMap = new Map<number, Node>(
      response.graph.map(([key, value]: [number, Node]) => {
        const newNode = new Node(
          value.id,
          value.lat,
          value.lng,
          value.floor,
          new Set<number>(value.neighbors),
          value.name
        );
        return [key, newNode];
      })
    );
    console.log("Starting graph: ", newNodesMap);
    nodesMap.current = deepCloneMap(newNodesMap);
    setMaxID(Math.max(...Array.from(newNodesMap.keys())));
    versionControl.current.set(0, deepCloneMap(newNodesMap));
    console.log("Version control after getting starting graph: ", versionControl.current);
  }

  // Track if we're currently drawing a path
  const isDrawing = useRef(false);
  let clickedNodes: number[] = [];

  const deleteMode = useRef(false);
  const addMode = useRef(false);

  const nodePreview = useRef<google.maps.Circle>(
    new google.maps.Circle({
      strokeColor: "#d10e0e",
      fillColor: "#ffffff",
      fillOpacity: 0.5,
      radius: 0.75,
      zIndex: 10,
      clickable: false,
      draggable: false,
    })
  );

  const [nodePreviewMode, setNodePreviewMode] = useState(true);

  useEffect(() => {
    console.log("Node preview mode: ", nodePreviewMode);
    if (nodePreviewMode) nodePreview.current.setMap(map!);
    else nodePreview.current.setMap(null);
  }, [nodePreviewMode]);

  // moves center of temporary node when you move mouse
  map!.addListener("mousemove", (event: google.maps.MapMouseEvent) => {
    if (!addMode.current || !nodePreviewMode) {
      return;
    }

    nodePreview.current.setCenter(event.latLng);
  });

  // stops rendering temporary node when you stop hovering over the map and resumes when you hover again
  map!.addListener("mouseout", () => {
    setNodePreviewMode(false);
  });
  map!.addListener("mouseover", () => {
    if (!addMode.current) return;
    setNodePreviewMode(true);
  });

  // Store the mousemove listener so we can remove it later
  const mouseMoveListener = useRef<google.maps.MapsEventListener | null>(null);

  function drawEdges(renderedNodes: Map<number, Node>) {
    if (graphLines.current) {
      graphLines.current.forEach((line) => line.setMap(null));
      graphLines.current = null;
    }

    const edges: google.maps.Polyline[] = [];

    for (const value of renderedNodes.values()) {
      for (const i of value.neighbors) {
        if (renderedNodes.has(i) && value.id < i) {
          const line = new google.maps.Polyline({
            path: [
              { lat: value.lat, lng: value.lng },
              { lat: nodesMap.current.get(i)!.lat, lng: nodesMap.current.get(i)!.lng },
            ],
            strokeColor: "#d10e0e",
            strokeOpacity: 1,
            strokeWeight: 6,
            geodesic: true,
          });

          line.addListener("click", () => {
            if (!deleteMode.current) return;

            nodesMap.current.get(value.id)!.neighbors.delete(i);
            nodesMap.current.get(i)!.neighbors.delete(value.id);

            console.log(`Deleted edge between ${value.id} and ${i}`);

            setCircleVersion((prev) => prev + 1);

            setTutorialStep((prev) => (prev === 11 ? prev + 1 : prev));
          });

          line.addListener("mouseover", (event: google.maps.MapMouseEvent) => {
            setNodePreviewMode(false);
            if (!deleteMode.current) return;

            line.setOptions({
              strokeOpacity: 0.5,
            });
          });
          line.addListener("mouseout", () => {
            if (addMode.current && !isDrawing.current) setNodePreviewMode(true);

            line.setOptions({
              strokeOpacity: 1,
            });
          });

          edges.push(line);
        }
      }
    }

    graphLines.current = edges;
    graphLines.current.forEach((line) => line.setMap(map));
  }

  async function drawGraph(floor: number) {
    // populates node map if it hasn't already been
    if (nodesMap.current.size === 0) {
      await getStartingGraph();
    }

    // clears all current graph drawings
    if (graphLines.current) {
      graphLines.current.forEach((line) => line.setMap(null));
      graphLines.current = null;
    }
    if (nodesRef.current) {
      nodesRef.current.forEach((circle) => circle.setMap(null));
      nodesRef.current = null;
    }

    // gets map of just the nodes that are on the current floor
    const renderedNodes: Map<number, Node> = new Map<number, Node>();
    for (const [id, node] of nodesMap.current.entries()) {
      if (node.floor === floor) {
        renderedNodes.set(id, node);
      }
    }

    drawEdges(renderedNodes);

    // creates an array of circles where each one is at one of the path coordinates
    const newNodeMarkers: google.maps.Circle[] = [];
    for (const node of renderedNodes.values()) {
      const circle = new google.maps.Circle({
        center: { lat: node.lat, lng: node.lng },
        strokeColor: "#d10e0e",
        fillColor: "#ffffff",
        fillOpacity: 1,
        radius: 0.75,
        zIndex: 10,
        draggable: true,
      });

      // makes circle transparent when hovering in delete mode (also used for preview of edges)
      circle.addListener("mouseover", (event: google.maps.MapMouseEvent) => {
        setNodePreviewMode(false);

        // sets end of edge preview to center of hovered circle
        if (addMode.current && isDrawing.current) {
          tempLine.current.getPath().setAt(1, circle.getCenter()!);
        }

        if (!deleteMode.current) return;

        circle.setOptions({
          fillOpacity: 0.5,
          strokeOpacity: 0.5,
        });
      });
      circle.addListener("mouseout", () => {
        if (!isDrawing.current && addMode.current) setNodePreviewMode(true);

        circle.setOptions({
          fillOpacity: 1,
          strokeOpacity: 1,
        });
      });

      circle.addListener("rightclick", () => {
        // edges can only be created in addMode
        if (!addMode.current) return;
        setNodePreviewMode(false);

        const latLng = new google.maps.LatLng(node.lat, node.lng);
        console.log(`${node.id} has been right clicked`);

        if (!tempLine.current) {
          console.error("tempLine.current is not initialized");
          return;
        }

        if (!map) {
          console.error("Map is not initialized");
          return;
        }

        // starts a line drawing if one hasn't been started already
        if (!isDrawing.current) {
          clickedNodes.push(node.id);
          const path = tempLine.current.getPath();
          path.clear();
          path.push(latLng);
          path.push(latLng);
          isDrawing.current = true;

          if (mouseMoveListener.current) {
            google.maps.event.removeListener(mouseMoveListener.current);
          }

          // moves the last point in the line on mousemove
          mouseMoveListener.current = map!.addListener("mousemove", (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            const path = tempLine.current.getPath();
            path.setAt(path.getLength() - 1, event.latLng!);
          });
        } else if (clickedNodes[0] !== node.id) {
          clickedNodes.push(node.id);
          // sets second point to the circle that was clicked, clears the path, and sets drawing state to false
          const path = tempLine.current.getPath();
          path.setAt(path.getLength() - 1, latLng);
          path.push(latLng);
          path.clear();
          isDrawing.current = false;

          // adds nodes to each other's neighbors
          console.log("Clicked nodes: ", clickedNodes);
          console.log("Node 1: ", nodesMap.current.get(clickedNodes[0]));
          const node1: Node = nodesMap.current.get(clickedNodes[0])!;
          console.log(node1);
          node1.addNeighbor(clickedNodes[1]);

          console.log("Node 2: ", nodesMap.current.get(clickedNodes[1]));
          nodesMap.current.get(clickedNodes[0])!.addNeighbor(clickedNodes[1]);
          nodesMap.current.get(clickedNodes[1])!.addNeighbor(clickedNodes[0]);
          clickedNodes = [];

          setCircleVersion((prev) => prev + 1);

          setTutorialStep((prev) => (prev === 9 ? prev + 1 : prev));
        }
      });

      circle.addListener("dragstart", () => {
        console.log("Circle drag started");

        circle.addListener("drag", () => {
          console.log("Circle dragged");
          // sets the new center for the associated node
          const newCenter = circle.getCenter()!;
          nodesMap.current.get(node.id)!.lat = newCenter.lat();
          nodesMap.current.get(node.id)!.lng = newCenter.lng();
          drawEdges(renderedNodes);
          // showGraph(floor);
        });

        // admin can drag node to new position
        circle.addListener("dragend", () => {
          console.log("Circle drag ended");

          // increments version by 1
          setCircleVersion((prev) => prev + 1);

          setTutorialStep((prev) => (prev === 16 ? prev + 1 : prev));
        });
      });

      circle.addListener("click", () => {
        console.log("Circle clicked");

        // handles click if delete mode is enabled
        if (deleteMode.current) {
          console.log("Delete mode is false");

          // deletes this node from list of neighbors
          for (const neighbor of node.neighbors) {
            nodesMap.current.get(neighbor)!.neighbors.delete(node.id);
          }

          // deletes this node from the map
          nodesMap.current.delete(node.id);
          setCircleVersion((prev) => prev + 1);
          setTutorialStep((prev) => (prev === 12 ? prev + 1 : prev === 13 ? prev + 1 : prev));
          return;
        } else {
          console.log("Should create a new marker");
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: circle.getCenter(),
            title: "Editor",
            content: createInputField(node.id, node.name ?? ""),
          });

          marker.addListener("click", () => {
            console.log("Marker clicked");
            marker.remove();
            setTutorialStep((prev) => (prev === 15 ? prev + 1 : prev));
          });
        }
      });

      newNodeMarkers.push(circle);
    }

    nodesRef.current = newNodeMarkers;
    nodesRef.current.forEach((circle) => circle.setMap(map));
  }

  async function handleSubmit() {
    const graph = new Map<
      number,
      { id: number; lat: number; lng: number; neighbors: number[]; floor: number; name: string | null }
    >();

    for (const [key, value] of nodesMap.current.entries()) {
      graph.set(key, {
        id: value.id,
        lat: value.lat,
        lng: value.lng,
        neighbors: Array.from(value.neighbors),
        floor: value.floor,
        name: value.name,
      });
    }

    console.log("Returning graph: ", Array.from(graph));

    const response = await fetch(API.PATHFIND.UPDATEGRAPH.ROUTE, {
      method: "Post",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessTokenSilently()}` },
      body: JSON.stringify({
        graph: Array.from(graph),
      }),
    });

    const response2 = await fetch(API.PATHFIND.SETALGO.ROUTE, {
      method: "Post",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessTokenSilently()}` },
      body: JSON.stringify({
        algo: algo,
      }),
    });

    console.log(response.json());
    console.log(response2.json());
  }

  //USE EFFECTS
  // updates center of map
  useEffect(() => {
    if (origin && map) {
      map.setCenter(origin);
      setMapCenter(origin);
    }
  }, [origin, map, setMapCenter]);

  // changes the showing of the graph whenever the graph display is toggled or floor is changed
  useEffect(() => {
    // clears all current graph drawings
    if (graphLines.current) {
      graphLines.current.forEach((line) => line.setMap(null));
      graphLines.current = null;
    }
    if (nodesRef.current) {
      nodesRef.current.forEach((circle) => circle.setMap(null));
      nodesRef.current = null;
    }

    // redraws graph
    drawGraph(floor);
  }, [floor]);

  return (
    <div className={"flex"}>
      {tutorialStep === 1 && (
        <div
          className="bg-background/50 opacity-65 absolute inset-0 z-100 flex justify-center items-center w-screen h-screen
        pointer-events-none"
        />
      )}
      {tutorialStep <= 4 && tutorialStep !== 1 && (
        <div
          className="bg-background/50 opacity-65 absolute inset-0 z-5 flex justify-center items-center w-screen h-screen
        pointer-events-none"
        />
      )}
      {tutorialStep >= 1 && (
        <TutorialWindow
          step={tutorialStep}
          onNext={() => setTutorialStep((prev) => prev + 1)}
          onSkip={() => setTutorialStep(30)}
        />
      )}

      <div
        className={`absolute top-4 right-4 panel-3 shadow-lg rounded-lg w-64 overflow-hidden
      space-y-2 text-md ${tutorialStep !== 1 ? "z-101" : "z-10"}`}
      >
        {/* Panel Header */}
        <div className="bg-hospital-darkblue text-white p-3 flex">
          <h2 className="font-bold">Editing Panel</h2>
          <div
            className={`absolute right-4 top-1.5 hover:text-slate-500 ${tutorialStep === 17 ? "animate-pulse-scale-xl text-hospital-lightyellow z-200" : "z-0"}`}
          >
            <InfoPopover
              title={"Map Editor Instructions"}
              description={[
                "• While in Add Mode, click to create nodes.",
                <br />,
                "• While in Add Mode, Right click a node to start creating an edge, right click another to complete it. Press esc to cancel\n" +
                  " creation.\n",
                <br />,
                "• Enter Delete Mode and click on edges or nodes to delete them.\n",
                <br />,
                "• Click and drag on a node to move it.",
                <br />,
                "• Click on existing nodes without being in Add or Delete Mode to show and edit node information, " +
                  "click on the edit panel to hide it again.",
              ]}
              onClick={() => setTutorialStep((prev) => (prev === 17 ? prev + 1 : prev))}
            />
          </div>
        </div>

        <div className={"m-2 space-y-2 my-4 overflow-auto"}>
          {/* Hospital & Department Selection */}
          <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3 space-y-1">
            {/* Hospital Filter */}
            <h3 className="text-hospital-darkblue dark:text-hospital-skyblue font-bold">Select Hospital</h3>
            <select
              value={hospitalFilter ?? ""}
              onChange={(e) => {
                const newHospital = e.target.value;
                setHospitalFilter(newHospital);
                setSelectedHospital(newHospital);

                if (selectedDepartment && selectedDepartment.location !== newHospital) {
                  setSelectedDepartment(null);
                }

                if (tutorialStep === 2) {
                  setTutorialStep(tutorialStep + 1);
                }
              }}
              className={`w-full border border-hospital-gray rounded px-3 py-2 bg-background/50 focus:outline-none focus:ring-2
              cursor-pointer focus:ring-hospital-blue disabled:cursor-not-allowed
              ${tutorialStep === 2 ? "animate-pulse-yellow shadow-lg shadow-gray-400 " + "dark:text-black" : "z-101"}`}
              disabled={tutorialStep === 1}
            >
              <option value="">All Hospitals</option>
              <option value="Patriot Place">Patriot Place</option>
              <option value="Chestnut Hill">Chestnut Hill</option>
              <option value="Faulkner">Faulkner</option>
              <option value="Main">Main</option>
            </select>
            <h3 className="text-hospital-darkblue dark:text-hospital-skyblue font-bold">Current Floor</h3>
            <select
              onChange={(e) => {
                const newFloor = e.target.value;
                setFloor(Number(newFloor));

                if (tutorialStep === 3) {
                  setTutorialStep(tutorialStep + 1);
                }
              }}
              className={`w-full border border-hospital-gray rounded px-3 py-2 bg-background/50 focus:outline-none
              focus:ring-2 focus:ring-hospital-blue cursor-pointer disabled:cursor-not-allowed
              ${tutorialStep === 3 ? "animate-pulse-yellow shadow-lg shadow-gray-400 dark:text-black" : "z-101"}`}
              disabled={tutorialStep < 3}
            >
              <option value={0}>Select a Floor</option>
              <option value={1}>1st Floor</option>
              <option value={3}>3rd Floor</option>
              <option value={4}>4th Floor</option>
            </select>
          </div>
        </div>

        {/*Algorithm Setter */}
        <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg py-2 space-y-1 m-2 mb-4">
          <div className={`space-y-2 mx-2.5`}>
            <label className="block font-medium text-hospital-darkblue dark:text-hospital-skyblue text-sm">
              Select Pathfinding Algorithm
            </label>
            <div
              className={`${tutorialStep === 4 ? "animate-pulse-yellow shadow-lg shadow-gray-400 rounded-md" : "disabled:cursor-not-allowed"}`}
            >
              <Select
                value={algo ?? ""}
                onValueChange={(newValue) => {
                  setAlgo(newValue);
                  if (tutorialStep === 4) {
                    setTutorialStep(tutorialStep + 1);
                  }
                }}
                disabled={tutorialStep < 4}
              >
                <SelectTrigger
                  className={`w-full border border-hospital-gray rounded focus:ring-2
                  focus:ring-hospital-blue focus:ring-offset-0 ${tutorialStep === 4 ? "dark:text-black" : "z-101"}
                  py-5.5`}
                >
                  <SelectValue placeholder="Select Algorithm" />
                </SelectTrigger>
                <SelectContent className="bg-background z-200">
                  {" "}
                  {algorithms.map((alg) => (
                    <SelectItem key={alg.value} value={alg.value}>
                      <div className="flex flex-col leading-tight">
                        {" "}
                        <span className="font-medium text-sm text-left">{alg.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {" "}
                          Average Time: {Math.trunc(alg.avgTime)} μs
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mx-2">
          {/* Zoom to hospital */}
          <button
            className={`hover:cursor-pointer w-full px-4 py-2 bg-hospital-yellow hover:bg-hospital-darkyellow text-hospital-darkblue font-medium
              rounded-md shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:bg-hospital-yellow cursor-pointer
              ${tutorialStep === 5 ? "animate-pulse-yellow-gradient z-101 shadow-lg shadow-gray-400" : "z-0"}`}
            onClick={() => {
              const key = hospitalFilter || selectedHospital;
              const destination = hospitalDestinations[key];
              if (!destination) return;
              const [lat, lng] = destination.split(",").map((coord) => parseFloat(coord.trim()));
              if (!isNaN(lat) && !isNaN(lng)) {
                map?.setCenter({ lat, lng });
                map?.setZoom(17.75);
              }
              if (tutorialStep === 5) {
                setTutorialStep(tutorialStep + 1);
              }
            }}
            disabled={tutorialStep < 5}
          >
            Zoom to {selectedHospital}
          </button>

          {/* Enables adding nodes */}
          <button
            className={`px-4 py-2 hover:bg-lime-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-700
              rounded-md shadow-sm text-hospital-lightgray cursor-pointer
               ${tutorialStep === 6 ? "animate-pulse-green-gradient z-101 shadow-lg shadow-gray-400" : "z-0"}
              ${currMode === 1 ? "bg-lime-700/50 w-[90%] ml-2.5" : " w-full bg-lime-700 text-hospital-lightgray"}`}
            onClick={() => {
              addMode.current = !addMode.current;
              console.log("addMode is now:", addMode.current);
              if (addMode.current) {
                // setNodePreviewMode(true);
                deleteMode.current = false;
              } else {
                setNodePreviewMode(false);
                tempLine.current.getPath().clear();
                isDrawing.current = false;
                clickedNodes = [];
              }
              if (currMode == 1) {
                setCurrMode(0);
                addMode.current = false;
              } else {
                setCurrMode(1);
              }
              if (tutorialStep === 6) {
                setTutorialStep(tutorialStep + 1);
              }
            }}
            disabled={tutorialStep !== 6 && tutorialStep <= 18}
          >
            Add Mode
          </button>
          {/* Enables removing nodes */}
          <button
            className={`px-4 py-2 hover:bg-red-900 text-hospital-lightgray font-medium rounded-md shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-700 cursor-pointer
              ${
                tutorialStep === 10
                  ? "animate-pulse-red-gradient z-101 shadow-lg shadow-gray-400"
                  : tutorialStep === 14
                    ? "animate-pulse-red-gradient z-101 shadow-lg shadow-gray-400"
                    : "z-0"
              }
              ${currMode === 2 ? "bg-red-700/50 w-[90%] ml-2.5" : "w-full bg-red-700"}`}
            onClick={() => {
              deleteMode.current = !deleteMode.current;
              console.log("deleteMode is now:", deleteMode.current);
              if (deleteMode.current) {
                addMode.current = false;
              }
              setNodePreviewMode(false);
              if (currMode == 2) {
                setCurrMode(0);
                deleteMode.current = false;
                setTutorialStep((prev) => (prev === 14 ? prev + 1 : prev));
              } else {
                setCurrMode(2);
              }
              setTutorialStep((prev) => (prev === 10 ? 11 : prev));
            }}
            disabled={tutorialStep !== 10 && tutorialStep != 14 && tutorialStep <= 18}
          >
            Delete Mode
          </button>

          {/* Submit Changes */}
          {tutorialStep < 18 ? (
            <div className={"flex justify-between gap-2"}>
              <button
                className={`w-full px-2 py-2 bg-hospital-blue hover:bg-hospital-darkblue/90 text-hospital-lightgray font-medium
             rounded-md shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-hospital-blue
             cursor-pointer`}
                disabled
              >
                Save & Exit
              </button>
              <button
                className={`w-full px-2 py-2 bg-hospital-blue hover:bg-hospital-darkblue/90 text-hospital-lightgray font-medium
             rounded-md shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-hospital-blue
             cursor-pointer`}
                disabled
              >
                Exit
              </button>
            </div>
          ) : (
            <div className={"flex justify-between gap-2"}>
              <Link to="/navigation" className={"w-full"}>
                <button
                  className={`w-full px-2 py-2 bg-hospital-blue hover:bg-hospital-darkblue/90 text-hospital-lightgray font-medium
             rounded-md shadow-sm mb-6 cursor-pointer
              ${tutorialStep === 18 ? "animate-pulse-blue-gradient z-101 shadow-lg shadow-gray-400" : "z-0"}`}
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Save & Exit
                </button>
              </Link>
              <Link to="/navigation" className={"w-full"}>
                <button
                  className={`w-full px-2 py-2 bg-hospital-blue hover:bg-hospital-darkblue/90 text-hospital-lightgray font-medium
             rounded-md shadow-sm mb-6 cursor-pointer
              ${tutorialStep === 18 ? "animate-pulse-blue-gradient z-101 shadow-lg shadow-gray-400" : "z-0"}`}
                >
                  Exit
                </button>
              </Link>
            </div>
          )}
          {!infoHidden ? <Editorinstructions /> : null}
        </div>
      </div>
    </div>
  );
}
