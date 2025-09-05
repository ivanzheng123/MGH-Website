import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { RouteLoader } from "@/lib/routing.ts";
import { useLoaderData } from "react-router";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";
import { FC, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { Download, FileUp, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useAuth0 } from "@auth0/auth0-react";

/*
   HOSPITAL  TYPES  &  CSV  HELPERS
   */

type Department = {
  name: string;
  floor: number;
};

type FloorPlan = {
  floor: number;
  imageUrl: string;
};

type Building = {
  name: string;
  departments: Department[];
  floorPlans: FloorPlan[];
};

type HospitalFlat = {
  id?: number;
  name: string;
  identifier: string;
  address: string;
  buildings: Building[];
};

function parseHospitalCSV(csvText: string): any[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return headers.reduce<Record<string, string>>((obj, key, idx) => {
      obj[key] = (values[idx] || "").replace(/^"|"$/g, "");
      return obj;
    }, {});
  });

  // Using counters to generate IDs
  let hospitalIdCounter = 1;
  let buildingIdCounter = 1;

  // We'll temporarily store the hospital id as _hospitalId
  const hospitalMap = new Map<string, any>();

  for (const row of rows) {
    const hKey = row.hospitalIdentifier;
    if (!hospitalMap.has(hKey)) {
      hospitalMap.set(hKey, {
        name: row.hospitalName,
        identifier: hKey,
        address: row.hospitalAddress,
        // Temporary internal id so we can associate buildings with a hospital
        _hospitalId: hospitalIdCounter++,
        buildings: [],
      });
    }
    const hospital = hospitalMap.get(hKey);

    // Look for an existing building with the same name
    let building = hospital.buildings.find((b: any) => b.name === row.buildingName);
    if (!building) {
      building = {
        name: row.buildingName,
        hospitalId: hospital._hospitalId,
        buildingId: buildingIdCounter++, // unique id for the building
        departments: [],
        floorPlans: [],
      };
      hospital.buildings.push(building);
    }

    // If there's department data, add it to the building
    if (row.departmentName) {
      building.departments.push({
        name: row.departmentName,
        floor: parseInt(row.departmentFloor) || 0,
        buildingId: building.buildingId,
      });
    }

    // If there's floor plan data, add it to the building
    if (row.floorPlanImageUrl) {
      building.floorPlans.push({
        floor: parseInt(row.floorPlanFloor) || 0,
        imageUrl: row.floorPlanImageUrl,
        buildingId: building.buildingId,
      });
    }
  }

  // Remove our temporary _hospitalId from hospitals before returning, as it's not in the schema.
  const hospitals = Array.from(hospitalMap.values()).map((hospital) => {
    delete hospital._hospitalId;
    return hospital;
  });

  return hospitals;
}

function hospitalsToCsv(hospitals: HospitalFlat[]): string {
  const rows: string[] = [
    "hospitalName,hospitalIdentifier,hospitalAddress,buildingName,departmentName,departmentFloor,floorPlanFloor,floorPlanImageUrl",
  ];

  for (const h of hospitals) {
    for (const b of h.buildings) {
      const maxLen = Math.max(b.departments.length, b.floorPlans.length, 1);
      for (let i = 0; i < maxLen; i++) {
        const d = b.departments[i] || {};
        const f = b.floorPlans[i] || {};
        rows.push(
          [
            `"${h.name}"`,
            `"${h.identifier}"`,
            `"${h.address}"`,
            `"${b.name}"`,
            `"${d.name || ""}"`,
            d.floor != null ? d.floor : "",
            f.floor != null ? f.floor : "",
            `"${f.imageUrl || ""}"`,
          ].join(",")
        );
      }
    }
  }
  return rows.join("\n");
}

/*
   NODE  TYPES  &  CSV  HELPERS
    */

type Node = {
  id: number;
  latitude: number;
  longitude: number;
  neighbors: number[];
};

function parseNodeCSV(csvText: string): Node[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // 1. normalise header keys → lowercase & trimmed
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    // 2. split the row, respecting quotes
    const cells = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];

    // 3. build <key,value> map for the row
    const raw: Record<string, string> = {};
    headers.forEach((key, i) => {
      raw[key] = (cells[i] || "").replace(/^"|"$/g, "").trim();
    });

    /* neighbours parsing  */
    // Accept: "", "1", "2,3", "4, 5 ,6 "
    const neighborArr =
      raw.neighbors === ""
        ? []
        : raw.neighbors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) // remove empty strings
            .map((n) => Number(n)) // convert to numbers
            .filter((n) => !Number.isNaN(n));

    return {
      id: Number(raw.id),
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      neighbors: neighborArr,
    } as Node;
  });
}

function nodesToCsv(nodes: Node[]): string {
  const rows = ["id,latitude,longitude,neighbors"];
  for (const n of nodes) {
    rows.push([n.id, n.latitude, n.longitude, `"${n.neighbors.join(",")}"`].join(","));
  }
  return rows.join("\n");
}

/*
   MAIN  COMPONENT
   */

export const Route: FC = () => {
  /* ---------- hospital upload / fetch ---------- */
  const hospitalFileRef = useRef<HTMLInputElement | null>(null);
  const [hospitalFile, setHospitalFile] = useState<File | null>(null);
  const [hospitalUploadMsg, setHospitalUploadMsg] = useState<string | null>(null);

  const [hospitals, setHospitals] = useState<HospitalFlat[]>([]);
  const [hospitalStatusMsg, setHospitalStatusMsg] = useState<string | null>(null);

  // this is a hack, but, if this page is being displayed we should always be admin so we don't care about checking for anything
  // i dont want to refactor this page right now.
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    fetchHospitals();
    fetchNodes();
  }, []);

  const chooseHospitalFile = () => hospitalFileRef.current?.click();
  const hospitalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setHospitalFile(e.target.files[0]);
      setHospitalUploadMsg(null);
      toast.success("File Successfully chosen!");
    }
  };

  const uploadHospitalCsv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hospitalFile) return toast.error("Select a CSV file first!");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const data = parseHospitalCSV(reader.result as string);

        console.log("Hospital payload:", data);

        const res = await fetch(
          API.SETTINGS.HOSPITALDATA.IMPORT.DIRECTORY.ROUTE,
          await addTokenHeaderWithBody(await getAccessTokenSilently(), data)
        );
        if (!res.ok) throw new Error();
        const message = "File uploaded successfully!";
        setHospitalUploadMsg(message);
        toasting(message);
      } catch {
        setHospitalUploadMsg("Upload failed.");
      } finally {
        // resetting the file picker
        setHospitalFile(null);
        if (hospitalFileRef.current) hospitalFileRef.current.value = "";
      }
      await fetchHospitals();
    };
    reader.readAsText(hospitalFile);
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(
        API.SETTINGS.HOSPITALDATA.EXPORT.DIRECTORY.ROUTE,
        await addTokenHeader(await getAccessTokenSilently())
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHospitals(data);
    } catch {
      const message = "Error fetching data.";
      setHospitalStatusMsg(message);
      toasting(message);
    }
  };

  const downloadHospitalCsv = () => {
    if (!hospitals.length) {
      const message = "No data to download. Fetch first!";
      setHospitalStatusMsg(message);
      toasting(message);
      return;
    }
    const blob = new Blob([hospitalsToCsv(hospitals)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hospitals.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const message = "CSV downloaded successfully!";
    setHospitalStatusMsg(message);
    toasting(message);
  };

  /* ---------- node upload / fetch ---------- */
  const nodeFileRef = useRef<HTMLInputElement | null>(null);
  const [nodeFile, setNodeFile] = useState<File | null>(null);
  const [nodeUploadMsg, setNodeUploadMsg] = useState<string | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeStatusMsg, setNodeStatusMsg] = useState<string | null>(null);

  const chooseNodeFile = () => nodeFileRef.current?.click();
  const nodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setNodeFile(e.target.files[0]);
      setNodeUploadMsg(null);
    }
  };

  const uploadNodeCsv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nodeFile) return toast.error("Select a CSV file first!");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const data = parseNodeCSV(reader.result as string);

        console.log(" Node payload:", data);

        const res = await fetch(
          API.SETTINGS.HOSPITALDATA.IMPORT.PATHFINDING.ROUTE,
          await addTokenHeaderWithBody(await getAccessTokenSilently(), data)
        );
        if (!res.ok) throw new Error();

        const msg = "Node CSV uploaded!";
        setNodeUploadMsg("Node CSV uploaded!");
        toast.success(msg);
      } catch {
        setNodeUploadMsg("Upload failed.");
      } finally {
        // resetting the file picker
        setNodeFile(null);
        if (nodeFileRef.current) nodeFileRef.current.value = "";
      }
    };
    reader.readAsText(nodeFile);
  };

  const fetchNodes = async () => {
    try {
      setNodeStatusMsg(null);
      const res = await fetch(
        API.SETTINGS.HOSPITALDATA.EXPORT.PATHFINDING.ROUTE,
        await addTokenHeader(await getAccessTokenSilently())
      );
      if (!res.ok) {
        console.log(await res.json());
        throw new Error();
      }
      const data = await res.json();
      setNodes(data);
      setNodeStatusMsg("Nodes fetched!");
    } catch {
      setNodeStatusMsg("Fetch error.");
    }
  };

  const downloadNodeCsv = () => {
    if (!nodes.length) {
      setNodeStatusMsg("Nothing to download – fetch first!");
      return;
    }
    const blob = new Blob([nodesToCsv(nodes)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nodes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNodeStatusMsg("Node CSV downloaded!");
    toast.success("CSV downloaded successfully!");
  };

  const toasting = (status: unknown) => {
    try {
      const statusmsg = String(status);
      if (statusmsg) {
        if (
          statusmsg == "CSV downloaded successfully!" ||
          statusmsg == "Hospitals data fetched successfully!" ||
          statusmsg == "File uploaded successfully!"
        ) {
          toast.success(statusmsg);
        } else {
          toast.error(statusmsg);
        }
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  const data = useLoaderData<FrontendAPI["USERS"]["VERBOSE"]["RES"] | undefined>();
  if (data !== undefined && data.position === "admin") {
    return (
      <div className={"p-4 h-full"}>
        <h1 className={"panel-title !pb-2"}>Admin Settings</h1>
        <hr className={"bg-hospital-blue/25 border-xl border-hospital-blue/25 mb-4"} />
        <div className="flex flex-row h-[85%]">
          {/* ==========  Hospital panel  ========== */}
          <div className="ml-4 w-[30%] mr-4 flex flex-col gap-4">
            <div className=" p-2 panel">
              <h2 className="text-xl font-bold text-center mb-4">Upload Directory</h2>

              {/* Upload */}
              <form onSubmit={uploadHospitalCsv} className="space-y-6">
                <input
                  type="file"
                  ref={hospitalFileRef}
                  onChange={hospitalFileChange}
                  className="hidden"
                  accept=".csv"
                />
                <div className="flex justify-center gap-4 mb-2">
                  <Button
                    onClick={chooseHospitalFile}
                    type="button"
                    className="panel-interactive text-foreground !rounded-lg"
                  >
                    Choose CSV
                    <FileUp />
                  </Button>
                  <Button type="submit" className="panel-interactive text-foreground !rounded-lg">
                    Upload
                    <Upload />
                  </Button>
                </div>
                <div className=" text-center mt-0">
                  {hospitalFile && <span className="self-center text-lg">{hospitalFile.name}</span>}
                </div>
              </form>
            </div>

            {/* Fetch / Download */}
            <div className=" p-2 panel">
              <h2 className="text-xl font-bold text-center mb-4">Download Directory</h2>
              <div className="flex justify-center gap-4 mb-1">
                <Button onClick={downloadHospitalCsv} className="panel-interactive text-foreground !rounded-lg">
                  Download CSV
                  <Download />
                </Button>
              </div>
            </div>

            <div className=" p-2 panel">
              <h2 className="text-xl font-bold text-center mb-4">Pathfinding Nodes</h2>
              <div className="flex justify-center">
                <form onSubmit={uploadNodeCsv} className="space-y-6">
                  <input type="file" ref={nodeFileRef} onChange={nodeFileChange} className="hidden" accept=".csv" />
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-2">
                    <Button
                      onClick={downloadNodeCsv}
                      type="button"
                      className="panel-interactive text-foreground !rounded-lg col-span-2"
                    >
                      Download CSV
                      <Download />
                    </Button>
                  </div>
                </form>
              </div>
              <div className={"text-center mt-0"}>
                {nodeFile && <span className="self-center text-lg">{nodeFile.name}</span>}
              </div>
            </div>
          </div>

          {/* Render hospitals */}
          <div className="pb-2 pt-0 w-[70%] overflow-y-auto">
            <div className="p-2 mr-4 pt-0 pb-2">
              {hospitals.length > 0 && (
                <div className="grid grid-cols-1 gap-4 ">
                  {hospitals.map((h, i) => (
                    <div key={i} className={`panel p-4`}>
                      <h3 className="text-xl font-bold mb-1">
                        {h.name} ({h.identifier}) — {h.address}
                      </h3>
                      <hr className={"bg-hospital-blue/25 border-xl border-hospital-blue/25 mb-2"} />
                      {h.buildings.map((b, j) => (
                        <div key={j} className="mt-2">
                          <p className="text-lg font-semibold mb-1">
                            Building: <span className="font-normal">{b.name}</span>
                          </p>
                          {b.departments.length > 0 && (
                            <div className="mb-3">
                              <p className="font-semibold">Departments:</p>
                              <ul className="list-disc list-inside ml-2">
                                {b.departments.map((d, k) => (
                                  <li key={k}>
                                    {d.name} — Floor {d.floor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {b.floorPlans.length > 0 && (
                            <div>
                              <p className="font-semibold">Floor Plans:</p>
                              <ul className="list-disc list-inside ml-2">
                                {b.floorPlans.map((f, k) => (
                                  <li key={k}>
                                    Floor {f.floor}:{" "}
                                    <a
                                      href={f.imageUrl}
                                      className="text-blue-600 underline"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {f.imageUrl}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 mr-4  pt-0 pb-2 mt-4">
              {hospitals.length > 0 && (
                <div className="grid grid-cols-1 gap-0 ">
                  {hospitals.map((h, i) => (
                    <div key={i} className={`panel p-4 mb-4 last:mb-0`}>
                      <h3 className="text-xl font-bold  mb-2">Pathfinding Node Information ({h.identifier})</h3>
                      <div className={"overflow-x-auto rounded-lg pb-4 border border-hospital-darkblue shadow-lg"}>
                        <Table>
                          <TableHeader className="bg-hospital-darkerblue/35 dark:bg-hospital-darkerblue/55 backdrop-blur-[10px] rounded-t-2xl">
                            <TableRow className="px-4 text-left text-sm font-semibold">
                              <TableHead>Node #</TableHead>
                              <TableHead>Latitude</TableHead>
                              <TableHead>Longitude</TableHead>
                              <TableHead># Neighbors</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nodes.map((n, i) => (
                              <TableRow
                                className={`!border-none ${i % 2 == 0 ? "bg-hospital-blue/20 dark:bg-hospital-blue/25" : "bg-hospital-blue/10 dark:bg-hospital-blue/15"} `}
                              >
                                <TableCell> &nbsp;{n.id}</TableCell>
                                <TableCell> &nbsp;{n.latitude}</TableCell>
                                <TableCell> &nbsp;{n.longitude}</TableCell>
                                <TableCell>
                                  {" "}
                                  &nbsp;
                                  {n.neighbors.length ? n.neighbors.join(", ") : "None"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <h1>403 Forbidden</h1>
      <p className={"text-center text-xl"}>
        <span>You are not permitted to view this page.</span>
      </p>
    </>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.VERBOSE.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
