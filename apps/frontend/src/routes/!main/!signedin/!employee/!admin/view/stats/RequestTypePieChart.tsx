import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth0 } from "@auth0/auth0-react";
import { API } from "common/src/api/endpoints.ts";

export default function RequestTypePieChart() {
  const [data, setData] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(API.STATS.REQUESTS_BY_TYPE.ROUTE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        const labelMap: Record<string, string> = {
          MaintenanceRequest: "Maintenance",
          FoodServiceRequest: "Food",
          DeviceRequest: "Device",
          LanguageRequest: "Language",
          AudioVisualRequest: "Audio/Visual",
        };

        const formatted = json.map((entry: { type: string; _count: number }) => ({
          name: labelMap[entry.type] || entry.type,
          value: entry._count,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching type pie chart data:", err);
      }
    }

    fetchData();
  }, [getAccessTokenSilently]);

  const COLORS = [
    "#bd9ce1", // muted violet
    "#7e79e3", // aqua-light blue
    "#f29e4c", // orange-amber
    "#f48078", // coral red
    "#ec76f3", // mint-teal
    "#247ba0", // rich blue (balanced)
  ];

  return (
    <div className={"panel shadow-md p-6 w-full h-[350px] flex flex-col"}>
      <h2 className="text-lg font-semibold mb-4">Service Request Type Distribution</h2>
      <div className="flex-grow">
        <ResponsiveContainer className="font-semibold">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              labelLine
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
              formatter={(value: number, name: string) => [`${value} requests`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
