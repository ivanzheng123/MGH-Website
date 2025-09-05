import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth0 } from "@auth0/auth0-react";
import { API } from "common/src/api/endpoints.ts";
import { useTheme } from "@/lib/theme-provider.tsx";

type CompletionStat = {
  date: string;
  count: number;
};

export default function RequestCompletedLineChart() {
  const { theme } = useTheme();
  const [data, setData] = useState<CompletionStat[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(API.STATS.COMPLETED_PER_DAY.ROUTE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json: CompletionStat[] = await res.json();
        const sorted = json.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sorted.length > 0) {
          const firstDate = new Date(sorted[0].date);
          firstDate.setDate(firstDate.getDate() - 1);

          const paddedStart: CompletionStat = {
            date: firstDate.toISOString().split("T")[0],
            count: 0,
          };

          setData([paddedStart, ...sorted]);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Error fetching completion stats:", err);
      }
    }

    fetchData();
  }, [getAccessTokenSilently]);

  return (
    <div className={"panel shadow-md p-6 w-full h-[350px] flex flex-col"}>
      <h2 className={"text-lg font-semibold mb-4"}>Completed Requests Per Day</h2>
      <div className="flex-grow">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              tick={{ fill: theme === "dark" ? "#e5e7eb" : "#374151" }}
              dataKey="date"
              type="category"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis tick={{ fill: theme === "dark" ? "#e5e7eb" : "#374151" }} domain={[0, "auto"]} />
            <Tooltip />
            <Area type="linear" dataKey="count" stroke="#f6bd38" strokeWidth={2} fill="#f6bd38" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
