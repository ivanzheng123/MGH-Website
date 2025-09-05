import React, { useEffect, useRef, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Node } from "common/src/node.ts";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import {
  allDepartments,
  hospitalDestinations,
  hospitalHandicapDestinations,
  patriot22_floor4,
} from "@/routes/!main/navigation/navinfo.tsx";
import { Link, useLoaderData } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { InfoHoverCard } from "@/components/InfoHoverCard.tsx";
import { CustomSwitch } from "@/components/CustomSwitch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

export function Directions({
  setMapCenter,
  setFloor,
  floor,
}: {
  setMapCenter: (center: google.maps.LatLngLiteral) => void;
  setFloor: (floor: number) => void;
  floor: number;
}) {
  const { isAuthenticated } = useAuth0();
  const loggedInUser = useLoaderData<FrontendAPI["USERS"]["RES"]>();

  // Get the current map instance and load the routes library.
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const zoom = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const SBS = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const clear = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const back = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const readExternal = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const reReadExternal = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const readInternal = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);
  const reReadInternal = useRef<HTMLButtonElement>(undefined as unknown as HTMLButtonElement);

  //for autofilling addresses
  const placeLibrary = useMapsLibrary("places");
  const frontPanelInputRef = useRef<HTMLInputElement>(null!);
  const sidePanelInputRef = useRef<HTMLInputElement>(null!);

  // State for DirectionsService and DirectionsRenderer.
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [originAddress, setOriginAddress] = useState("");

  // State for available routes and the selected route index.
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [hospitalRoutes, setHospitalRoutes] = useState(new Map<string, google.maps.DirectionsRoute>());

  // State for the user's start location (origin).
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [originSource, setOriginSource] = useState<"gps" | "address" | null>(null);

  const [hospitalFilter, setHospitalFilter] = useState<string | null>(null);

  const [frontPanelVisible, setFrontPanelVisible] = useState(true);
  const [sidePanelVisible, setSidePanelVisible] = useState(true);

  const [showStepByStep, setShowStepByStep] = useState(false);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>(google.maps.TravelMode.DRIVING);

  const [navigationStarted, setNavigationStarted] = useState(false);
  const [nameNodeDistances, setNameNodeDistances] = useState<number[]>([]);

  const [nameNodePositions, setNameNodePositions] = useState<google.maps.LatLngLiteral[]>([]);
  const [fullPathPositions, setFullPathPositions] = useState<google.maps.LatLngLiteral[]>([]);

  // state for whether handicap navigation is toggled
  const [handicap, setHandicap] = useState<boolean>(false);

  // Existing state variables
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<{
    label: string;
    location: string;
  } | null>(null);

  // references used to store the line and nodes for the current pathfinding
  const pathLineRef = useRef<google.maps.Polyline | null>(null);
  const nodesRef = useRef<google.maps.Circle[] | null>(null);

  const [centeredOnUser, setCenteredOnUser] = useState(false);

  //used to keep track for tts
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInternalStepIndex, setCurrentInternalStepIndex] = useState(0);

  const [internalSteps, setInternalSteps] = useState<string[]>([]);

  //metric imperial conversion
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");

  let nodesMap = new globalThis.Map<number, Node>();

  const destinationAddress = handicap
    ? hospitalHandicapDestinations[selectedDepartment?.location || hospitalFilter || selectedHospital || travelMode]
    : hospitalDestinations[selectedDepartment?.location || hospitalFilter || selectedHospital || travelMode];

  //------------------------------- All Functions ----------------------------------------------------
  function formatDistance(distanceInFeet: number, unit: "imperial" | "metric"): string {
    if (unit === "imperial") {
      const miles = distanceInFeet / 5280;
      if (miles >= 0.1) return `${miles.toFixed(2)} mi`;
      return `${Math.round(distanceInFeet)} ft`;
    } else {
      const meters = distanceInFeet * 0.3048;
      const kilometers = meters / 1000;
      if (kilometers >= 0.1) return `${kilometers.toFixed(2)} km`;
      return `${Math.round(meters)} m`;
    }
  }

  //complicated so im gonna comment alot to explain so I dont get lost myself
  /**
   * generates readable step-by step directions
   *  uses (x,y) cordinates
   *  each step is detemrined by comparing angles between three consecutive points
   *   -First directions is assumed to be straight as you are likely going to face the right direction (theres no other way to do this without this
   *   and I am sick of working on this)
   *   - Thne the calculations are done after that
   * @param path - array of LatLng piints representing all our nodes
   * @returns array of string instructions
   */
  function generateInternalSteps(path: google.maps.LatLngLiteral[], unit: "feet" | "meters"): string[] {
    const steps: string[] = [];

    if (path.length < 2) return steps; // Need at least 2 points

    // Handle first step separately
    const first = path[0];
    const second = path[1];
    const firstDistance = haversineDistance(first.lat, first.lng, second.lat, second.lng);
    steps.push(`Start walking and continue for ${formatDistance(firstDistance, unitSystem)}`);

    // Now handle turns
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      const turn = getTurnAngles(prev, current, next);
      const distance = haversineDistance(current.lat, current.lng, next.lat, next.lng);

      let instruction = "";

      if (turn === "left") instruction = `Turn left and continue for ${formatDistance(distance, unitSystem)}`;
      else if (turn === "slight left")
        instruction = `Slight left and continue for ${formatDistance(distance, unitSystem)}`;
      else if (turn === "straight") instruction = `Go straight for ${formatDistance(distance, unitSystem)}`;
      else if (turn === "slight right")
        instruction = `Slight right and continue for ${formatDistance(distance, unitSystem)}`;
      else if (turn === "right") instruction = `Turn right and continue for ${formatDistance(distance, unitSystem)}`;

      steps.push(instruction);
    }

    return steps;
  }

  const handleUseCurrentLocation = () => {
    setOrigin(null);
    setOriginAddress(""); // Clear the text representation as well
    setOriginSource(null); // Reset source until GPS confirms

    if (frontPanelInputRef.current) {
      frontPanelInputRef.current.value = "";
    }
    if (sidePanelInputRef.current) {
      sidePanelInputRef.current.value = "";
    }

    setIsUsingCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Success geolocation", currentLocation);

          setOrigin(currentLocation);
          setOriginSource("gps");
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsUsingCurrentLocation(false);
          setOriginSource(null);
          setOrigin(null);
          alert("Could not get current location. Please enter an address or try again.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0, // Force fresh location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Reset flags if geolocation isn't supported
      setIsUsingCurrentLocation(false);
      setOriginSource(null);
      setOrigin(null);
      alert("Geolocation is not supported by your browser.");
    }
  };

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const EarthRadius = 6371000;
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

    const b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInMeters = EarthRadius * b;
    const distanceInFeet = distanceInMeters * 3.28084;

    return distanceInFeet;
  }

  function getTurnAngles(
    prev: google.maps.LatLngLiteral,
    current: google.maps.LatLngLiteral,
    next: google.maps.LatLngLiteral
  ): "left" | "slight left" | "straight" | "slight right" | "right" {
    const v1 = { x: current.lng - prev.lng, y: current.lat - prev.lat };

    const v2 = { x: next.lng - current.lng, y: next.lat - current.lat };

    const crossProduct = v1.x * v2.y - v1.y * v2.x;

    const dotProduct = v1.x * v2.x + v1.y * v2.y;

    const angle = Math.atan2(crossProduct, dotProduct) * (180 / Math.PI);

    if (angle > 45) {
      return "left";
    } else if (angle > 20) {
      return "slight left";
    } else if (angle < -45) {
      return "right";
    } else if (angle < -20) {
      return "slight right";
    } else {
      return "straight";
    }
  }

  const speakInternalStep = () => {
    if (currentInternalStepIndex >= internalSteps.length) return;

    const utterance = new SpeechSynthesisUtterance(internalSteps[currentInternalStepIndex]);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);

    setCurrentInternalStepIndex((prev) => prev + 1);
  };

  // arrow symbol overlaid on top of pathfinding lines
  const lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
    scale: 1,
    strokeColor: "#ffffff",
    strokeOpacity: 1,
    strokeWeight: 2,
  };

  // animates symbols on top of the given polyline
  function animateLine(line: google.maps.Polyline) {
    const path = line.getPath();
    // gets the length of the given pass
    const totalDistance = google.maps.geometry.spherical.computeLength(path);
    // parameters used to calculate speed of arrow movement
    const speedMetersPerSecond = 10;
    const intervalMs = 20;
    // calculates the number of meters for the arrows to travel per time interval
    const distancePerInterval = (speedMetersPerSecond * intervalMs) / 1000;

    // meter spacing between arrows
    const arrowSpacing = 5;
    // calculates the number of arrows that should be on the path (min of 1)
    const numArrows = Math.max(Math.ceil(totalDistance / arrowSpacing), 1);

    // constructs the icons property for the line and sets it
    const icons = Array.from({ length: numArrows }, (_, i) => ({
      icon: lineSymbol,
      offset: `${(i / numArrows) * 100}%`,
    }));
    line.set("icons", icons);

    let traveledDistance = 0;
    window.setInterval(() => {
      traveledDistance = (traveledDistance + distancePerInterval) % totalDistance;
      const offsetPercent = (traveledDistance / totalDistance) * 100;

      // calculates the new offset to be used by the
      const updatedIcons = icons.map((icon, i) => {
        const newOffset = (offsetPercent + (i / numArrows) * 100) % 100;
        return {
          ...icon,
          offset: `${newOffset}%`,
        };
      });

      line.set("icons", updatedIcons);
    }, intervalMs);
  }

  // updates the pathfinding display
  async function updatePath(hospital: string, dept: string, floor: number) {
    const ELEVATOR: number = 23;
    let start: number;
    let end: number;
    // sets start and end nodes for Chestnut Hill
    if (hospital === "Chestnut Hill") {
      start = handicap ? 83 : 12;
      end = 17;
    } else if (hospital.includes("Patriot Place")) {
      if (hospital.includes("22")) {
        // handles depts in 22 Patriot Place
        // checks if target dept is on 4th floor
        if (patriot22_floor4.has(dept)) {
          end = floor === 4 ? 26 : ELEVATOR; // sets target to check in desk if on 4th floor, otherwise sets target to elevator
        } else {
          // if target on 3rd floor
          end = floor === 3 ? 25 : ELEVATOR; // sets target to 3rd floor check in, otherwise elevator
        }

        // sets start node to elevator if not on 1st floor
        if (floor !== 1) {
          start = ELEVATOR;
        } else {
          start = handicap ? 82 : 1;
        }
      } else {
        // sets start and end nodes for 20 Patriot Place
        if (floor !== 1) {
          return;
        }
        start = handicap ? 82 : 1;
        end = 11;
      }
    } else if (hospital === "Main") {
      // main campus
      start = 45;
      end = 48;
    } else {
      // Faulkner
      start = handicap ? 64 : 74;
      if (dept === "Dialysis Clinic") {
        end = 32;
      } else {
        end = 38;
      }
    }

    // fetches the path from the backend
    const response = await fetch(API.PATHFIND.ROUTE, {
      method: "Post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start,
        end,
      }),
    });
    const data = await response.json();
    const path = data.path;
    data.graph.values().forEach(console.log);

    // reconstructs node map from the passed array and uses it to make array of coordinates
    nodesMap = new globalThis.Map<number, Node>(data.graph);
    const newSteps: string[] = [];
    const newPositions: google.maps.LatLngLiteral[] = [];
    const allPositions: google.maps.LatLngLiteral[] = [];

    //for internal tts
    for (const i of path) {
      const node = nodesMap.get(i);

      if (node) {
        // Always add the node to full path positions
        allPositions.push({ lat: node.lat, lng: node.lng });

        // Only add to nameNodeMap and nameNodePositions if the node has a name
        if (node.name) {
          newSteps.push(node.name);
          newPositions.push({ lat: node.lat, lng: node.lng });
        }
      }
    }

    setNameNodePositions(newPositions);
    setFullPathPositions(allPositions);

    const unit: "feet" | "meters" = unitSystem === "imperial" ? "feet" : "meters";
    setInternalSteps(generateInternalSteps(allPositions, unit));

    setCurrentInternalStepIndex(0);

    const polyLineCoords = path
      .map((id: number) => {
        const node = nodesMap.get(id);
        if (node) {
          return { lat: node.lat, lng: node.lng };
        }
      })
      .filter(Boolean) as google.maps.LatLngLiteral[];

    // creates a polyline between all the nodes
    pathLineRef.current = new google.maps.Polyline({
      path: polyLineCoords,
      strokeColor: "#d10e0e",
      strokeOpacity: 0.7,
      strokeWeight: 6,
      geodesic: true,
    });

    pathLineRef.current.setMap(map);
    animateLine(pathLineRef.current);

    // shows the nodes as a circle at the beginning and end of the path
    const newNodeMarkers: google.maps.Circle[] = [];
    newNodeMarkers.push(
      new google.maps.Circle({
        center: polyLineCoords[0],
        strokeColor: "#d10e0e",
        fillColor: "#d10e0e",
        fillOpacity: 1,
        radius: 0.75,
      })
    );
    newNodeMarkers.push(
      new google.maps.Circle({
        center: polyLineCoords[polyLineCoords.length - 1],
        strokeColor: "#d10e0e",
        fillColor: "#d10e0e",
        fillOpacity: 1,
        radius: 0.75,
      })
    );

    nodesRef.current = newNodeMarkers;
    nodesRef.current.forEach((circle) => circle.setMap(map));
  }

  const headingRef = useRef<number>(0);

  const userMarker = useRef(
    new google.maps.Marker({
      map,
      icon: getUserIcon(headingRef.current),
      optimized: false,
      clickable: false,
    })
  );

  function getUserIcon(heading: number): google.maps.Icon {
    const svg = `
    <svg width="70" height="70" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#4285F4" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#4285F4" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g transform="rotate(${heading}, 24, 24)">
        <path d="M24 24 L16 4 L32 4 Z" fill="url(#beam)" />
        <circle cx="24" cy="24" r="6" fill="#4285F4" stroke="white" stroke-width="2" />
      </g>
    </svg>
  `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(70, 70),
      anchor: new google.maps.Point(24, 24),
    };
  }

  // handles toggling of current position being shown on map
  useEffect(() => {
    directionsRenderer?.setOptions({ preserveViewport: centeredOnUser });

    // looks for changes in position and moves the usermarker based on that
    const watchID = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      userMarker.current.setPosition({ lat: latitude, lng: longitude });
      if (centeredOnUser) {
        console.log("should be centering on user here");
        map?.setCenter({ lat: latitude, lng: longitude });
      }
    });

    let dragListener: google.maps.MapsEventListener | null = null;

    if (centeredOnUser && map) {
      userMarker.current.setIcon(getUserIcon(0));
      dragListener = google.maps.event.addListener(map, "dragstart", () => {
        map.setOptions({ gestureHandling: "none" });
        setTimeout(() => map.setOptions({ gestureHandling: "greedy" }), 0);
      });
      console.log("should be setting zoom here");
      map?.setZoom(20);
      console.log("after zoom: ", map?.getZoom());
    } else {
      map?.setHeading(0);
    }

    // cleans up the location listener
    return () => {
      if (dragListener) google.maps.event.removeListener(dragListener);
      navigator.geolocation.clearWatch(watchID);
    };
  }, [centeredOnUser]);

  // gets heading data from websocket where it's being streamed from because laptops are stupid and kernel programming is hard
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => ws.send("browser");

    ws.onmessage = (event) => {
      try {
        const { heading } = JSON.parse(event.data);
        if (typeof heading === "number") {
          headingRef.current = heading;
          if (!centeredOnUser) userMarker.current.setIcon(getUserIcon(heading));
          // If your map is ready, update its heading
          if (map && centeredOnUser) {
            map.setHeading(heading);
          }
        }
      } catch (err) {
        console.error("Invalid data from IMU:", err);
        // map.setHeading(0);
      }
    };

    return () => ws.close();
  }, [centeredOnUser]);

  const filteredDepartments = allDepartments.filter((dept) => {
    const matchesSearch = dept.label.toLowerCase().includes(deptSearchTerm.toLowerCase());
    const matchesHospital =
      hospitalFilter === null ||
      (hospitalFilter === "Patriot Place" &&
        (dept.location === "20 Patriot Place" || dept.location === "22 Patriot Place")) ||
      dept.location === hospitalFilter;

    return matchesSearch && matchesHospital;
  });

  const onChangeDepartment = (value: string) => {
    setDeptSearchTerm(value);

    if (value == "") {
      setSelectedDepartment(null);
    }
  };

  const htmlToText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // tts fucntion
  const steps = routes[routeIndex]?.legs[0]?.steps;

  const speakCurrentStep = () => {
    if (!steps || currentStepIndex >= steps.length) return;

    const instructionText = htmlToText(steps[currentStepIndex].instructions);

    const utterwords = new SpeechSynthesisUtterance(instructionText);
    utterwords.rate = 1; // can be (0.1 - 10)
    utterwords.pitch = 1; //standard
    utterwords.lang = "en-US"; //english but can be changed

    speechSynthesis.cancel();
    speechSynthesis.speak(utterwords);

    setCurrentStepIndex((prev) => prev + 1);
  };

  const reReadCurrentStep = () => {
    const previous = Math.max(currentStepIndex - 1, 0);
    const instructionText = htmlToText(steps[previous].instructions);
    const utter = new SpeechSynthesisUtterance(instructionText);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  //---------------------------- USE EFFECTS------------------------------------------------------------
  const rawDistanceMeters = routes[routeIndex]?.legs[0]?.distance?.value ?? 0;
  const rawDistanceFeet = rawDistanceMeters * 3.28084;

  const routeSummaryDistance = formatDistance(rawDistanceFeet, unitSystem);

  useEffect(() => {
    if (fullPathPositions.length > 1) {
      const unit: "feet" | "meters" = unitSystem === "imperial" ? "feet" : "meters";
      const updatedSteps = generateInternalSteps(fullPathPositions, unit);
      setInternalSteps(updatedSteps);
      setCurrentStepIndex(0);
    }
  }, [unitSystem, fullPathPositions]);

  //ensures when you clear navigation front panel appears
  useEffect(() => {
    if (!navigationStarted) {
      setFrontPanelVisible(true);
      setShowStepByStep(false);
      setSidePanelVisible(true);
    }
  }, [navigationStarted]);

  // calculates + saves distance/time for each hospital from given origin
  useEffect(() => {
    if (!origin || !directionsService) {
      setHospitalRoutes(new Map());
      return;
    }

    const resultRoutes = new Map<string, google.maps.DirectionsRoute>();

    const promises = [];

    for (const [key, value] of Object.entries(hospitalDestinations)) {
      const promise = directionsService
        .route({
          origin,
          destination: value,
          travelMode: travelMode,
          provideRouteAlternatives: false,
        })
        .then((response) => {
          resultRoutes.set(key, response.routes[0]);
        })
        .catch((error) => console.error("Error fetching directions:", error));
      promises.push(promise);
    }

    Promise.allSettled(promises).then(() => {
      setHospitalRoutes(resultRoutes);
    });

    // setHospitalRoutes(new Map(resultRoutes));
  }, [origin, travelMode, directionsService]);

  // updates path whenever selected dept, current floor, or handicap toggle changes
  useEffect(() => {
    // clears all pathfinding
    if (pathLineRef.current) {
      pathLineRef.current.setMap(null);
      pathLineRef.current = null;
    }
    if (nodesRef.current) {
      nodesRef.current.forEach((circle) => circle.setMap(null));
      nodesRef.current = null;
    }

    // creates new path if there's a selected dept
    if (selectedDepartment) {
      updatePath(selectedDepartment.location, selectedDepartment.label, floor);
    }
  }, [selectedDepartment, floor, handicap]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map, draggable: false }));
    directionsRenderer?.setMap(map);
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!navigationStarted || !origin || !directionsService || !directionsRenderer) return;
    directionsService
      .route({
        origin,
        destination: destinationAddress,
        travelMode: travelMode,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
        directionsRenderer.setRouteIndex(routeIndex);
      })
      .catch((error) => console.error("Error fetching directions:", error));

    directionsRenderer.setMap(map);
  }, [origin, directionsService, directionsRenderer, destinationAddress, routeIndex, travelMode, navigationStarted]);

  useEffect(() => {
    if (directionsRenderer) {
      directionsRenderer.setRouteIndex(routeIndex);
    }
  }, [routeIndex, directionsRenderer]);

  useEffect(() => {
    if (origin && map && !centeredOnUser) {
      map.setCenter(origin);
      setMapCenter(origin);
    }
  }, [origin, map, setMapCenter, centeredOnUser]);

  // functionality for autofilling addresses
  // Setup for front panel input
  useEffect(() => {
    if (!placeLibrary || !frontPanelInputRef.current) return;

    const autocomplete = new placeLibrary.Autocomplete(frontPanelInputRef.current, {
      fields: ["geometry", "formatted_address"],
      types: ["address"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const location = place.geometry.location;
      setOrigin({ lat: location.lat(), lng: location.lng() });
      setOriginSource("address");
      setOriginAddress(place.formatted_address || "");
      setIsUsingCurrentLocation(false);
    });
  }, [placeLibrary, frontPanelVisible]);

  // Setup for sidebar input
  useEffect(() => {
    if (!placeLibrary || !sidePanelVisible || !sidePanelInputRef.current) return;

    const autocomplete = new placeLibrary.Autocomplete(sidePanelInputRef.current, {
      fields: ["geometry", "formatted_address"],
      types: ["address"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const location = place.geometry.location;
      setOrigin({ lat: location.lat(), lng: location.lng() });
      setOriginSource("address");
      setOriginAddress(place.formatted_address || "");
    });
  }, [placeLibrary, sidePanelVisible]);

  useEffect(() => {
    const setCurrentLocVoice = (e: Event) => {
      handleUseCurrentLocation();
    };

    const setHospitalVoice = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const spoken = custom.detail?.toLowerCase();

      let normalized: string | null = null;
      if (spoken.includes("faulkner")) normalized = "Faulkner";
      else if (spoken.includes("main")) normalized = "Main";
      else if (spoken.includes("chestnut hill")) normalized = "Chestnut Hill";
      else if (spoken.includes("patriot place")) normalized = "Patriot Place";

      if (normalized) {
        setHospitalFilter(normalized);
        setSelectedDepartment(null);
      } else {
        console.warn("Unrecognized hospital from voice input:", spoken);
      }
    };

    const setDepartmentVoice = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const spoken = custom.detail?.toLowerCase();
      console.log("Voice department command received:", spoken);

      const match = allDepartments.find((dept) => dept.label.toLowerCase().includes(spoken));

      if (match) {
        setSelectedDepartment(match);
        setSelectedHospital(match.location.includes("Patriot Place") ? "Patriot Place" : match.location);
        setDeptSearchTerm(match.label);

        // If hospital filter isn't already set, default to the one from the department
        if (!hospitalFilter) setHospitalFilter(match.location);
      } else {
        console.warn("No matching department found for:", spoken);
      }
    };

    const setTravelModeVoice = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const spoken = custom.detail?.toLowerCase();

      console.log("Travel mode command received:", spoken);

      if (spoken.includes("drive")) {
        setTravelMode(google.maps.TravelMode.DRIVING);
      } else if (spoken.includes("walk")) {
        setTravelMode(google.maps.TravelMode.WALKING);
      } else if (spoken.includes("bike")) {
        setTravelMode(google.maps.TravelMode.BICYCLING);
      } else if (spoken.includes("transit") || spoken.includes("bus")) {
        setTravelMode(google.maps.TravelMode.TRANSIT);
      } else {
        console.warn("Unknown travel mode:", spoken);
      }
    };

    const navigateVoice = (e: Event) => {
      setFrontPanelVisible(false);
      setNavigationStarted(true);
    };

    const zoomVoice = () => {
      zoom.current.click();
    };

    const stepByStepVoice = () => {
      SBS.current.click();
    };

    const clearVoice = () => {
      clear.current.click();
    };

    const backVoice = () => {
      back.current.click();
    };

    const ReadEx = () => {
      readExternal.current.click();
    };

    const ReReadEx = () => {
      reReadExternal.current.click();
    };
    const ReadIn = () => {
      readInternal.current.click();
    };
    const ReReadIn = () => {
      reReadInternal.current.click();
    };

    const handicapVoice = () => {
      setHandicap((prev) => !prev);
    };

    window.addEventListener("use_current_location", setCurrentLocVoice);
    window.addEventListener("set_hospital", setHospitalVoice);
    window.addEventListener("set_department", setDepartmentVoice);
    window.addEventListener("set_travelMode", setTravelModeVoice);
    window.addEventListener("navigate", navigateVoice);
    window.addEventListener("zoomToHospital", zoomVoice);
    window.addEventListener("showStepByStep", stepByStepVoice);
    window.addEventListener("clearNavigation", clearVoice);
    window.addEventListener("back", backVoice);
    window.addEventListener("readNextStep", ReadEx);
    window.addEventListener("reReadNextStep", ReReadEx);
    window.addEventListener("readHospitalStep", ReadIn);
    window.addEventListener("reReadNextStep", ReReadIn);
    window.addEventListener("Handicap", handicapVoice);

    return () => {
      window.removeEventListener("use_current_location", setCurrentLocVoice);
      window.removeEventListener("set_hospital", setHospitalVoice);
      window.removeEventListener("set_department", setDepartmentVoice);
      window.removeEventListener("navigate", navigateVoice);
      window.removeEventListener("zoomToHospital", zoomVoice);
      window.removeEventListener("showStepByStep", stepByStepVoice);
      window.removeEventListener("clearNavigation", clearVoice);
      window.removeEventListener("back", backVoice);
      window.removeEventListener("readNextStep", ReadEx);
      window.removeEventListener("reReadNextStep", ReReadEx);
      window.removeEventListener("readHospitalStep", ReadIn);
      window.removeEventListener("reReadNextStep", ReReadIn);
      window.removeEventListener("Handicap", handicapVoice);
    };
  }, []);

  // Get the specific route data *once*
  const patriotDistance = hospitalRoutes.get("Patriot Place");
  const chestnutDistance = hospitalRoutes.get("Chestnut Hill");
  const faulknerDistance = hospitalRoutes.get("Faulkner");
  const mainDistance = hospitalRoutes.get("Main");
  // Safely access duration using optional chaining

  return (
    <>
      {!frontPanelVisible && (
        <div className="absolute bottom-3 left-3">
          <button
            className={`px-4 py-4 ${centeredOnUser ? "bg-hospital-gray" : "bg-hospital-lightgray dark:bg-gray-700"} text-hospital-darkblue font-medium w-12 h-12 rounded-full shadow-sm flex items-center justify-center hover:cursor-pointer`}
            onClick={() => {
              setCenteredOnUser((prev) => !prev);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M12 2 L22 22 L12 18 L2 22 Z" fill="#4285F4" fill-rule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      {frontPanelVisible ? (
        <>
          {/* Overlay backdrop */}
          <div className="fixed inset-0 z-40 backdrop-blur-md bg-opacity-10"></div>

          {/* Main selection panel */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[93%]
          overflow-auto mb-20"
          >
            <div className="shadow-lg rounded-lg border border-hospital-skyblue overflow-hidden panel-2">
              {/* Header */}
              <div className="bg-hospital-darkblue text-white p-3 text-center flex justify-center">
                <h2 className="text-2xl font-semibold justify-center ">Hospital Navigation</h2>
                <InfoHoverCard
                  title={"Navigation Instructions"}
                  description={[
                    "• Select a starting location manually, or use your current location.",
                    <br />,
                    "• Select your desired hospital and department destination.",
                    <br />,
                    "• If you require handicapped parking, toggle the handicap switch.",
                    <br />,
                    "• Not travelling by car? Choose a different mode of transportation.",
                    <br />,
                    "• Enter navigation. You can always change your input later.",
                  ]}
                  className={"scale-125 hover:scale-150 text-white h-9 px-4 has-[>svg]:px-3 z-500"}
                />
              </div>

              <div className="px-6 pb-4 pt-4 space-y-3">
                {/* Origin */}
                <div className="bg-hospital-lightgray/75 dark:bg-gray-700/75 rounded-lg p-2 px-4">
                  <h3 className="text-hospital-darkblue dark:text-hospital-skyblue text-foreground font-bold">
                    Starting Point
                  </h3>
                  <div className={"flex flex-row gap-4"}>
                    {/* Address Entry */}
                    <div className="mt-2">
                      <div className="flex space-x-2">
                        <input
                          ref={frontPanelInputRef}
                          type="text"
                          placeholder="123 Main St, Boston, MA"
                          className="flex-1 border border-hospital-gray rounded-md p-3 focus:ring-2 focus:ring-hospital-blue
                          focus:border-hospital-blue outline-none bg-background/50 text-foreground"
                          value={originAddress}
                          onChange={(e) => {
                            const newAddress = e.target.value;
                            setOriginAddress(newAddress);

                            // If the user starts typing, explicitly turn off "Use Current Location" mode
                            if (isUsingCurrentLocation) {
                              setIsUsingCurrentLocation(false);
                              setOriginSource(null); // Clear the source if they override GPS
                              // You might want to keep the origin set by autocomplete until
                              // a new place is selected, or clear it here if typing invalidates it.
                              // setOrigin(null); // Optional: clear origin immediately on typing
                            }

                            // Let the autocomplete handle setting the origin when a place is selected.
                            // If the input is cleared, you might want to setOrigin(null) too.
                            if (newAddress === "") {
                              setOrigin(null);
                              setOriginSource(null);
                            } else {
                              // Set source to address only if typing, autocomplete will refine
                              setOriginSource("address");
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className={"mt-0.25"}>
                      {!isUsingCurrentLocation ? (
                        <button
                          className="bg-hospital-blue text-white rounded-md font-semibold
      hover:bg-hospital-darkerblue transition shadow-sm hover:cursor-pointer items-center p-1"
                          onClick={handleUseCurrentLocation}
                        >
                          <span className="flex items-center justify-center text-md">
                            <span>Use Current Location</span>
                          </span>
                        </button>
                      ) : (
                        <div className="flex text-green-600">
                          <div className={"flex items-center mx-2 gap-2"}>
                            <span>✓</span>
                            <span className="font-medium">Using current location</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Destination Section */}
                <div className="bg-hospital-lightgray/75 dark:bg-gray-700/75 rounded-lg p-2 px-4 ">
                  <div className={"flex flex-row justify-between"}>
                    <h3 className="text-hospital-darkblue font-bold mb-1 dark:text-hospital-skyblue">Destination</h3>

                    <div className="flex items-center space-x-2">
                      <CustomSwitch
                        checked={handicap}
                        onChange={() => setHandicap((prev) => !prev)}
                        thumbImage={"/images/handicap_icon.png"}
                        uncheckedColor={"bg-hospital-skyblue"}
                        checkedColor={"bg-hospital-lightblue"}
                        id={"handicap"}
                      />
                    </div>
                  </div>

                  {/* Hospital Filter */}
                  <div className="mb-2">
                    <label className="block text-hospital-darkblue font-medium mb-1.5 dark:text-hospital-skyblue">
                      Select Hospital
                    </label>
                    <Select
                      value={hospitalFilter?.includes("Patriot Place") ? "Patriot Place" : (hospitalFilter ?? null)}
                      onValueChange={(newValue) => {
                        setHospitalFilter(newValue);
                        setSelectedDepartment(null);
                      }}
                    >
                      <SelectTrigger
                        className={`w-full border border-hospital-gray rounded focus:ring-2
                  focus:ring-hospital-blue focus:ring-offset-0
                  py-5.5`}
                      >
                        <SelectValue placeholder={null} />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-200">
                        {" "}
                        <SelectItem value={null}>
                          <div className="flex flex-col leading-tight">
                            {" "}
                            <span className="font-medium text-sm text-left">All Hospitals</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Patriot Place">
                          <div className="flex flex-col leading-tight">
                            {" "}
                            <span className="font-medium text-sm text-left">Patriot Place</span>
                            {patriotDistance && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {`${patriotDistance.legs[0]?.distance?.text} | ${patriotDistance.legs[0]?.duration?.text}`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                        <SelectItem value="Chestnut Hill">
                          <div className="flex flex-col leading-tight">
                            {" "}
                            <span className="font-medium text-sm text-left">Chestnut Hill</span>
                            {chestnutDistance && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {`${chestnutDistance.legs[0]?.distance?.text} | ${chestnutDistance.legs[0]?.duration?.text}`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                        <SelectItem value="Faulkner">
                          <div className="flex flex-col leading-tight">
                            {" "}
                            <span className="font-medium text-sm text-left">Faulkner</span>
                            {faulknerDistance && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {`${faulknerDistance.legs[0]?.distance?.text} | ${faulknerDistance.legs[0]?.duration?.text}`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                        <SelectItem value="Main">
                          <div className="flex flex-col leading-tight">
                            {" "}
                            <span className="font-medium text-sm text-left">Main Campus</span>
                            {mainDistance && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {`${mainDistance.legs[0]?.distance?.text} | ${mainDistance.legs[0]?.duration?.text}`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Search */}
                  <div className="relative mb-1">
                    <label className="block text-hospital-darkblue font-medium mb-1.5 dark:text-hospital-skyblue">
                      Department
                    </label>
                    <input
                      type="text"
                      // placeholder={hospitalFilter ? "Start typing…" : "Select a hospital first"}
                      placeholder="Start typing..."
                      className="w-full border border-hospital-gray rounded-md p-2 focus:ring-2 focus:ring-hospital-blue
                      focus:border-hospital-blue outline-none disabled:bg-hospital-lightgray disabled:cursor-not-allowed
                      bg-background/60 text-sm text-foreground"
                      value={deptSearchTerm}
                      onChange={(e) => onChangeDepartment(e.target.value)}
                    />
                    {filteredDepartments.length > 0 && (
                      <ul
                        className="max-h-30 mt-1 border border-hospital-gray rounded-md bg-background/50 shadow-md
                      overflow-auto"
                      >
                        {filteredDepartments.map((d, i) => (
                          <li
                            key={i}
                            className="px-3 py-1 hover:bg-hospital-skyblue cursor-pointer border-b border-hospital-lightgray
                            last:border-b-0 hover:dark:bg-hospital-blue"
                            onClick={() => {
                              setSelectedDepartment(d);
                              setSelectedHospital(d.location.includes("Patriot Place") ? "Patriot Place" : d.location);
                              if (!hospitalFilter) setHospitalFilter(d.location);
                              setDeptSearchTerm(d.label);
                            }}
                          >
                            <div className="font-medium text-sm">{d.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-200">
                              {d.location}, {d.floor}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Travel Mode Controls */}
                <div className="bg-hospital-lightgray/75 dark:bg-gray-700/75 rounded-lg p-2 px-4">
                  <h3 className="text-hospital-darkblue font-bold mb-2 dark:text-hospital-skyblue">Travel Mode</h3>
                  <div className="grid grid-cols-4 gap-6">
                    <button
                      className={`p-2 rounded-md font-semibold shadow-sm flex flex-col items-center justify-center hover:cursor-pointer ${
                        travelMode === google.maps.TravelMode.DRIVING
                          ? "bg-hospital-darkblue text-white"
                          : "bg-background/50 text-hospital-darkblue hover:bg-hospital-skyblue hover:dark:bg-hospital-blue"
                      } transition`}
                      onClick={() => setTravelMode(google.maps.TravelMode.DRIVING)}
                    >
                      <span className="text-md">🚗</span>
                      <span className="text-xs mt-1 dark:text-hospital-skyblue">Drive</span>
                    </button>
                    <button
                      className={`rounded-md font-semibold shadow-sm flex flex-col items-center justify-center hover:cursor-pointer ${
                        travelMode === google.maps.TravelMode.WALKING
                          ? "bg-hospital-darkblue text-white"
                          : "bg-background/50 text-hospital-darkblue hover:bg-hospital-skyblue hover:dark:bg-hospital-blue"
                      } transition`}
                      onClick={() => setTravelMode(google.maps.TravelMode.WALKING)}
                    >
                      <span className="text-md">🚶</span>
                      <span className="text-xs mt-1 dark:text-hospital-skyblue">Walk</span>
                    </button>
                    <button
                      className={`rounded-md font-semibold shadow-sm flex flex-col items-center justify-center hover:cursor-pointer ${
                        travelMode === google.maps.TravelMode.BICYCLING
                          ? "bg-hospital-darkblue text-white"
                          : "bg-background/50 text-hospital-darkblue hover:bg-hospital-skyblue hover:dark:bg-hospital-blue"
                      } transition`}
                      onClick={() => setTravelMode(google.maps.TravelMode.BICYCLING)}
                    >
                      <span className="text-md">🚲</span>
                      <span className="text-xs mt-1 dark:text-hospital-skyblue">Bike</span>
                    </button>
                    <button
                      className={`p-1 rounded-md font-semibold shadow-sm flex flex-col items-center justify-center hover:cursor-pointer ${
                        travelMode === google.maps.TravelMode.TRANSIT
                          ? "bg-hospital-darkblue text-white"
                          : "bg-background/50 text-hospital-darkblue hover:bg-hospital-skyblue hover:dark:bg-hospital-blue"
                      } transition`}
                      onClick={() => setTravelMode(google.maps.TravelMode.TRANSIT)}
                    >
                      <span className="text-lg">🚌</span>
                      <span className="text-xs mt-1 dark:text-hospital-skyblue">Transit</span>
                    </button>
                  </div>
                </div>

                {/* Navigate Button */}
                <button
                  className="w-full px-6 py-1.5 bg-hospital-blue text-white rounded-md font-semibold hover:bg-hospital-yellow
                   hover:text-hospital-darkblue transition shadow-md hover:cursor-pointer disabled:opacity-50 disabled:bg-gray-600
                   disabled:pointer-events-none"
                  onClick={() => {
                    setFrontPanelVisible(false);
                    setNavigationStarted(true);
                  }}
                  disabled={!origin || !selectedDepartment}
                >
                  <span className="flex items-center justify-center">
                    <span>Start Navigation</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : !showStepByStep ? (
        sidePanelVisible ? (
          <div
            className="absolute top-4 right-4 panel-2 shadow-lg rounded-lg border border-hospital-skyblue w-70 max-h-[95%]
          overflow-auto"
          >
            {/* Panel Header */}
            <div className="bg-hospital-darkblue text-white p-1 px-3 flex justify-between items-center">
              <div className="bg-hospital-darkblue text-white text-center flex justify-center">
                <h2 className="flex font-bold justify-center items-center p-2">Navigation Panel</h2>
                <InfoHoverCard
                  title={"Navigation Instructions"}
                  description={
                    isAuthenticated
                      ? [
                          "• Select your desired hospital and department destination.",
                          <br />,
                          "• If you require handicapped parking, toggle the handicap switch.",
                          <br />,
                          "• Not travelling by car? Choose a different mode of transportation.",
                          <br />,
                          "• Switch the current floor to follow the internal pathfinding on other levels.",
                          <br />,
                          "• Use the Zoom to Hospital feature once you arrive at your destination to view the route inside.",
                          <br />,
                          "• As an admin, you have access to edit mode, which has its own tutorial.",
                          <br />,
                          "• If desired, show the step-by-step route.",
                          <br />,
                          "• Click the button in the bottom left to zoom and center on your location",
                          <br />,
                          "• Made a mistake? Cancel the navigation.",
                        ]
                      : [
                          "• Select your desired hospital and department destination.",
                          <br />,
                          "• Not travelling by car? Choose a different mode of transportation.",
                          <br />,
                          "• Switch the current floor to follow the internal pathfinding on other levels.",
                          <br />,
                          "• Use the Zoom to Hospital feature once you arrive at your destination to view the route inside.",
                          <br />,
                          "• If desired, show the step-by-step route.",
                          <br />,
                          "• Made a mistake? Cancel the navigation.",
                        ]
                  }
                  className={
                    "bg-transparent hover:bg-transparent scale-100 hover:scale-125 text-white h-9 px-4 py-2 has-[>svg]:px-3"
                  }
                />
              </div>
              <button
                className="text-white hover:text-hospital-lightyellow hover:cursor-pointer"
                onClick={() => setSidePanelVisible(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[85%] overflow-y-auto">
              {/* Hospital & Department Selection */}
              <div className="dark:bg-gray-700/75 bg-hospital-lightgray rounded-lg p-3 space-y-3">
                <div className={"flex justify-between mb-0"}>
                  <h3 className="text-hospital-darkblue font-bold dark:text-hospital-skyblue">Destination</h3>
                  <div className="flex items-center space-x-2">
                    <CustomSwitch
                      checked={handicap}
                      onChange={() => setHandicap((prev) => !prev)}
                      thumbImage={"/images/handicap_icon.png"}
                      uncheckedColor={"bg-hospital-skyblue"}
                      checkedColor={"bg-hospital-lightblue"}
                      id={"handicap"}
                    />
                  </div>
                </div>
                {/* Hospital Filter */}
                <div className="space-y-2">
                  <label className="block font-medium text-hospital-darkblue dark:text-hospital-skyblue text-sm">
                    Filter by Hospital
                  </label>
                  <Select
                    value={hospitalFilter?.includes("Patriot Place") ? "Patriot Place" : (hospitalFilter ?? null)}
                    onValueChange={(newValue) => {
                      setHospitalFilter(newValue);
                      setSelectedDepartment(null);
                    }}
                  >
                    <SelectTrigger
                      className={`w-full border border-hospital-gray rounded focus:ring-2
                  focus:ring-hospital-blue focus:ring-offset-0
                  py-5.5`}
                    >
                      <SelectValue placeholder={null} />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-200">
                      {" "}
                      <SelectItem value={null}>
                        <div className="flex flex-col leading-tight">
                          {" "}
                          <span className="font-medium text-sm text-left">All Hospitals</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Patriot Place">
                        <div className="flex flex-col leading-tight">
                          {" "}
                          <span className="font-medium text-sm text-left">Patriot Place</span>
                          {patriotDistance && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {`${patriotDistance.legs[0]?.distance?.text} | ${patriotDistance.legs[0]?.duration?.text}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="Chestnut Hill">
                        <div className="flex flex-col leading-tight">
                          {" "}
                          <span className="font-medium text-sm text-left">Chestnut Hill</span>
                          {chestnutDistance && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {`${chestnutDistance.legs[0]?.distance?.text} | ${chestnutDistance.legs[0]?.duration?.text}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="Faulkner">
                        <div className="flex flex-col leading-tight">
                          {" "}
                          <span className="font-medium text-sm text-left">Faulkner</span>
                          {faulknerDistance && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {`${faulknerDistance.legs[0]?.distance?.text} | ${faulknerDistance.legs[0]?.duration?.text}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="Main">
                        <div className="flex flex-col leading-tight">
                          {" "}
                          <span className="font-medium text-sm text-left">Main Campus</span>
                          {mainDistance && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {`${mainDistance.legs[0]?.distance?.text} | ${mainDistance.legs[0]?.duration?.text}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Search */}
                <div className="space-y-2">
                  <label className="block font-medium text-hospital-darkblue dark:text-hospital-skyblue text-sm">
                    Search Department
                  </label>
                  <input
                    type="text"
                    // placeholder={hospitalFilter ? "Start typing..." : "Select a hospital first"}
                    placeholder="Start typing..."
                    className="w-full border border-hospital-gray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hospital-blue disabled:bg-hospital-lightgray disabled:cursor-not-allowed bg-background/50"
                    value={deptSearchTerm}
                    onChange={(e) => onChangeDepartment(e.target.value)}
                    // disabled={!hospitalFilter}
                  />
                  {filteredDepartments.length > 0 && (
                    <ul className="max-h-40 overflow-y-auto border border-hospital-gray rounded mt-1 bg-background/50 shadow-sm">
                      {filteredDepartments.map((dept, idx) => (
                        <li
                          key={idx}
                          className="cursor-pointer hover:bg-hospital-skyblue hover:dark:bg-hospital-blue px-3 py-2 border-b border-hospital-lightgray last:border-b-0"
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setSelectedHospital(
                              dept.location.includes("Patriot Place") ? "Patriot Place" : dept.location
                            );
                            setDeptSearchTerm(dept.label);
                            if (!hospitalFilter) setHospitalFilter(dept.location);
                          }}
                        >
                          <div className="font-medium">{dept.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-200">
                            {dept.location}, {dept.floor}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {selectedDepartment && (
                    <div className="text-sm bg-background/50 border border-hospital-turquoise text-hospital-turquoise font-medium p-2 rounded flex items-center">
                      <span className="mr-1">✓</span>
                      {selectedDepartment.label} ({selectedDepartment.location})
                    </div>
                  )}
                </div>
              </div>

              {/* Travel Mode */}
              <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3 space-y-3">
                <h3 className="text-hospital-darkblue dark:text-hospital-skyblue font-bold">Travel Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`px-3 py-2 rounded font-medium shadow-sm hover:cursor-pointer ${
                      travelMode === google.maps.TravelMode.DRIVING
                        ? "bg-hospital-darkblue text-white"
                        : "bg-background/50 hover:bg-hospital-skyblue hover:dark:bg-hospital-blue text-hospital-darkblue dark:text-hospital-skyblue"
                    }`}
                    onClick={() => setTravelMode(google.maps.TravelMode.DRIVING)}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1">🚗</span>
                      <span>Drive</span>
                    </span>
                  </button>
                  <button
                    className={`px-3 py-2 rounded font-medium shadow-sm hover:cursor-pointer ${
                      travelMode === google.maps.TravelMode.WALKING
                        ? "bg-hospital-darkblue text-white"
                        : "bg-background/50 hover:bg-hospital-skyblue hover:dark:bg-hospital-blue text-hospital-darkblue dark:text-hospital-skyblue"
                    }`}
                    onClick={() => setTravelMode(google.maps.TravelMode.WALKING)}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1">🚶</span>
                      <span>Walk</span>
                    </span>
                  </button>
                  <button
                    className={`px-3 py-2 rounded font-medium shadow-sm hover:cursor-pointer ${
                      travelMode === google.maps.TravelMode.BICYCLING
                        ? "bg-hospital-darkblue text-white"
                        : "bg-background/50 hover:bg-hospital-skyblue hover:dark:bg-hospital-blue text-hospital-darkblue dark:text-hospital-skyblue"
                    }`}
                    onClick={() => setTravelMode(google.maps.TravelMode.BICYCLING)}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1">🚲</span>
                      <span>Bike</span>
                    </span>
                  </button>
                  <button
                    className={`px-3 py-2 rounded font-medium shadow-sm hover:cursor-pointer ${
                      travelMode === google.maps.TravelMode.TRANSIT
                        ? "bg-hospital-darkblue text-white"
                        : "bg-background/50 hover:bg-hospital-skyblue hover:dark:bg-hospital-blue text-hospital-darkblue dark:text-hospital-skyblue"
                    }`}
                    onClick={() => setTravelMode(google.maps.TravelMode.TRANSIT)}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1">🚌</span>
                      <span>Transit</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Floor Selection */}
              <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3 space-y-3">
                <h3 className="text-hospital-darkblue font-bold dark:text-hospital-skyblue">Current Floor</h3>
                <select
                  value={floor}
                  onChange={(e) => {
                    const newFloor = e.target.value;
                    setFloor(Number(newFloor));
                  }}
                  className="w-full border border-hospital-gray rounded px-3 py-2 bg-background/50 focus:outline-none focus:ring-2 focus:ring-hospital-blue hover:cursor-pointer"
                >
                  <option value={1}>1st Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Zoom to hospital */}
                <button
                  className="w-full px-4 py-2 bg-hospital-yellow hover:bg-hospital-darkyellow text-hospital-darkblue font-medium rounded shadow-sm flex items-center justify-center hover:cursor-pointer"
                  ref={zoom}
                  onClick={() => {
                    const key = hospitalFilter || selectedHospital;
                    const destination = hospitalDestinations[key];
                    if (!destination) return;
                    const [lat, lng] = destination.split(",").map((coord) => parseFloat(coord.trim()));
                    if (!isNaN(lat) && !isNaN(lng) && !centeredOnUser) {
                      map?.setCenter({ lat, lng });
                      map?.setZoom(17.75);
                    }
                  }}
                >
                  {selectedHospital ? (
                    <>Zoom to {selectedHospital.includes("Patriot Place") ? "Patriot Place" : selectedHospital}</>
                  ) : (
                    <>Pick a Hospital</>
                  )}
                </button>

                {/* Edit Graph (Admin Only) */}
                {isAuthenticated && loggedInUser.position === "admin" && (
                  <>
                    <button className="w-full px-4 py-2 bg-hospital-turquoise hover:bg-hospital-darkturquoise text-white font-medium rounded shadow-sm hover:cursor-pointer">
                      <Link to={"/mapedit"}>
                        <span>Edit Mode</span>
                      </Link>
                    </button>
                  </>
                )}

                {/* Show Step-by-Step Toggle */}
                {routes[routeIndex]?.legs[0] && (
                  <button
                    className="w-full px-4 py-2 bg-hospital-blue hover:bg-hospital-darkerblue text-white font-medium rounded shadow-sm flex items-center justify-center hover:cursor-pointer"
                    ref={SBS}
                    onClick={() => setShowStepByStep(true)}
                  >
                    Show Step-by-Step Route
                  </button>
                )}

                {/* Clear Navigation */}
                <button
                  className="w-full px-4 py-2 bg-red-700 hover:bg-red-900 text-white font-medium rounded shadow-sm flex items-center justify-center hover:cursor-pointer"
                  ref={clear}
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Clear Navigation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="absolute top-4 right-4 bg-hospital-darkblue hover:bg-hospital-darkerblue text-white px-4 py-2 rounded-lg shadow-md font-medium flex items-center hover:cursor-pointer"
            onClick={() => setSidePanelVisible(true)}
          >
            Navigation Options
          </button>
        )
      ) : (
        // Step-by-Step Directions Panel
        <div
          className="absolute top-4 right-4 panel-2 shadow-lg rounded-lg border border-hospital-skyblue w-72
        max-h-[95%] overflow-auto"
        >
          <div className="bg-hospital-darkblue text-white p-3 flex justify-between items-center">
            <h2 className="font-bold">Step-by-Step Directions</h2>
            <button
              className="text-white hover:text-hospital-lightyellow px-2 font-medium"
              ref={back}
              onClick={() => setShowStepByStep(false)}
            >
              ← Back
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Route Summary */}
            <div className="bg-hospital-lightgray rounded-lg p-3">
              <div className={"flex justify-between items-start"}>
                <h3 className="font-medium text-hospital-darkblue mb-1">Route Summary</h3>
                <button
                  onClick={() => setUnitSystem((prev) => (prev === "imperial" ? "metric" : "imperial"))}
                  className="panel-interactive dark:!bg-hospital-darkblue/60 px-2 py-1 text-xs"
                >
                  {unitSystem === "imperial" ? "m/km" : "ft/mi"}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm dark:text-hospital-darkblue text-hospital-darkblue">
                  <div>
                    <div>{routeSummaryDistance}</div>
                  </div>
                  <div>{routes[routeIndex]?.legs[0]?.duration?.text}</div>
                </div>
              </div>
            </div>
            <button
              className="w-full px-4 py-2 bg-hospital-yellow hover:bg-hospital-darkyellow text-hospital-darkblue font-medium rounded shadow-sm flex items-center justify-center hover:cursor-pointer"
              ref={zoom}
              onClick={() => {
                const key = hospitalFilter || selectedHospital;
                const destination = hospitalDestinations[key];
                if (!destination) return;
                const [lat, lng] = destination.split(",").map((coord) => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng) && !centeredOnUser) {
                  map?.setCenter({ lat, lng });
                  map?.setZoom(17.75);
                }
              }}
            >
              {selectedHospital ? (
                <>Zoom to {selectedHospital.includes("Patriot Place") ? "Patriot Place" : selectedHospital}</>
              ) : (
                <>Pick a Hospital</>
              )}
            </button>

            {/* Steps List */}
            <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3">
              <h3 className="text-hospital-darkblue dark:text-hospital-lightgray font-bold">External Directions</h3>
              <ol className="list-decimal list-inside space-y-3 max-h-64 overflow-y-auto ml-1">
                {routes[routeIndex]?.legs[0]?.steps.map((step, i) => (
                  <li
                    key={i}
                    className={`text-sm leading-snug p-2 rounded ${currentStepIndex === i + 1 ? "bg-hospital-skyblue text-hospital-darkblue" : ""}`}
                  >
                    {htmlToText(step.instructions)}
                    {step.distance?.value && (
                      <div className="text-xs dark:!text-hospital-lightgray text-gray-600 mt-1">
                        {formatDistance(step.distance.value * 3.28084, unitSystem)}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Navigation Controls */}
            <div className="space-y-2">
              {/* Read Next Step */}
              <button
                className="text-sm hover:cursor-pointer transition-all w-full px-4 py-2 bg-hospital-turquoise hover:bg-hospital-lightturquoise text-white font-medium rounded shadow-sm flex items-center justify-center"
                ref={readExternal}
                onClick={speakCurrentStep}
                disabled={currentStepIndex >= (routes[routeIndex]?.legs[0]?.steps.length || 0)}
              >
                Read Next Step
              </button>

              {/* Re-read Step */}
              {steps && currentStepIndex >= 1 && (
                <button
                  className="text-sm hover:cursor-pointer transition-all w-full px-4 py-2 bg-hospital-blue hover:bg-hospital-darkerblue text-white font-medium rounded shadow-sm flex items-center justify-center"
                  ref={reReadExternal}
                  onClick={() => {
                    reReadCurrentStep();
                  }}
                >
                  Repeat Current Step
                </button>
              )}

              {currentStepIndex >= (routes[routeIndex]?.legs[0]?.steps.length || 0) && (
                <div className="bg-green-100 border border-green-300 text-green-700 text-center p-2 rounded-lg mt-2 font-medium">
                  All steps have been read.
                </div>
              )}
              {internalSteps.length > 0 && (
                <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3">
                  <h3 className="text-hospital-darkblue dark:text-hospital-lightgray font-bold">Hospital Directions</h3>
                  <ol className="list-decimal list-inside space-y-3 max-h-64 overflow-y-auto ml-1">
                    {internalSteps.map((step, i) => {
                      let icon = "⬆️"; // Default: straight

                      if (step.startsWith("Start")) {
                        icon = "🚶";
                      } else if (step.startsWith("Turn left")) {
                        icon = "⬅️";
                      } else if (step.startsWith("Slight left")) {
                        icon = "↖️";
                      } else if (step.startsWith("Turn right")) {
                        icon = "➡️";
                      } else if (step.startsWith("Slight right")) {
                        icon = "↗️";
                      } else if (step.startsWith("Go straight")) {
                        icon = "⬆️";
                      }

                      return (
                        <li
                          key={i}
                          className={`text-sm leading-snug p-2 rounded flex items-center space-x-2 ${
                            currentInternalStepIndex > 0 && currentInternalStepIndex - 1 === i
                              ? "bg-hospital-skyblue text-hospital-darkblue"
                              : ""
                          }`}
                        >
                          <span>{icon}</span>
                          <span>{step}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {internalSteps.length > 0 && (
                <button
                  className="w-full px-4 py-2 bg-hospital-blue hover:bg-hospital-darkerblue text-white text-sm font-medium rounded shadow-sm flex items-center justify-center"
                  ref={readInternal}
                  onClick={speakInternalStep}
                  disabled={currentInternalStepIndex >= internalSteps.length}
                >
                  Read Next Hospital Direction
                </button>
              )}

              {internalSteps.length > 0 && currentInternalStepIndex >= 1 && (
                <button
                  className="hover:cursor-pointer transition-all text-sm w-full px-4 py-2 bg-hospital-turquoise hover:bg-hospital-lightturquoise text-white font-medium rounded shadow-sm flex items-center justify-center"
                  ref={reReadInternal}
                  onClick={() => {
                    const previous = Math.max(currentInternalStepIndex - 1, 0);
                    const utter = new SpeechSynthesisUtterance(internalSteps[previous]);
                    utter.rate = 1;
                    utter.pitch = 1;
                    utter.lang = "en-US";
                    speechSynthesis.cancel();
                    speechSynthesis.speak(utter);
                  }}
                >
                  Repeat Hospital Direction
                </button>
              )}

              {/* Floor Selection */}
              <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3 space-y-3">
                <h3 className="text-hospital-darkblue dark:text-hospital-lightgray font-bold">Current Floor</h3>
                <select
                  value={floor}
                  onChange={(e) => {
                    const newFloor = e.target.value;
                    setFloor(Number(newFloor));
                  }}
                  className="w-full border border-hospital-gray rounded px-3 py-2 bg-background/50 focus:outline-none focus:ring-2 focus:ring-hospital-blue hover:cursor-pointer"
                >
                  <option value={1}>1st Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                </select>
              </div>
            </div>

            {/* Alternate Routes */}
            {routes.length > 1 && (
              <div className="bg-hospital-lightgray dark:bg-gray-700/75 rounded-lg p-3 space-y-2">
                <h3 className="font-medium text-hospital-darkblue dark:text-hospital-lightgray">Alternative Routes</h3>
                <ul className="space-y-1">
                  {routes.map((route, index) => (
                    <li key={index}>
                      <button
                        className={`hover:cursor-pointer w-full text-left px-3 py-2 rounded-md ${
                          index === routeIndex
                            ? "bg-hospital-darkblue text-white font-medium"
                            : "bg-background/50 text-hospital-darkblue hover:bg-hospital-skyblue dark:hover:text-hospital-darkblue dark:text-hospital-lightgray"
                        }`}
                        onClick={() => {
                          setCurrentStepIndex(0);
                          setRouteIndex(index);
                        }}
                      >
                        <div className="font-medium">{route.summary || `Route ${index + 1}`}</div>
                        {route.legs[0]?.duration && <div className="text-xs">{route.legs[0].duration.text}</div>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
