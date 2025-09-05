import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth0 } from "@auth0/auth0-react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import { API } from "common/src/api/endpoints.ts";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useTheme } from "@/lib/theme-provider.tsx";

type CreationStat = { date: string; count: number };

export default function RequestCreatedLineChart() {
  const { theme } = useTheme();

  const [rawData, setRawData] = useState<CreationStat[]>([]);
  const [filteredData, setFilteredData] = useState<CreationStat[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  const [range, setRange] = useState([
    {
      startDate: addDays(new Date(), -30),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Fetch raw data
  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(API.STATS.CREATED_PER_DAY.ROUTE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json: CreationStat[] = await res.json();
        const sorted = json.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRawData(sorted);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, [getAccessTokenSilently]);

  // Filter based on selected date range
  useEffect(() => {
    const start = range[0].startDate;
    const end = range[0].endDate;
    const filtered = rawData.filter((d) => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });
    setFilteredData(filtered);
  }, [range, rawData]);

  return (
    <div className="panel shadow-md p-6 w-full flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Created Requests Over Time</h2>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div
          className="custom-date-range-container p-6 shadow-md"
          style={{
            background: "oklch(1 0 0 / 0.4)",
            backdropFilter: "blur(12px)",
            borderRadius: "1.5rem",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-inter)",
            width: "fit-content",
          }}
        >
          <DateRange
            editableDateInputs
            onChange={(item: any) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
            rangeColors={["oklch(0.682 0.16 274.265)"]}
          />

          <style>{`
        .custom-date-range-container .rdrCalendarWrapper {
          background: transparent;
        }
        .rdrDateDisplayWrapper {
          background: transparent;
        }


      `}</style>
        </div>
        <div className="flex-grow h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis tick={{ fill: theme === "dark" ? "#e5e7eb" : "#374151" }} dataKey="date" textAnchor="middle" />
              <YAxis tick={{ fill: theme === "dark" ? "#e5e7eb" : "#374151" }} domain={[0, "auto"]} />
              <Tooltip
                formatter={(value: number) => [`${value} requests`]}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="count" stroke="#f6bd38" strokeWidth={2} fill="#f6bd38" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
