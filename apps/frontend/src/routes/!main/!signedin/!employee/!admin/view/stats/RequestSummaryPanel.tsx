import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { API } from "common/src/api/endpoints.ts";

export default function RequestSummaryPanel() {
  const [summary, setSummary] = useState({ total: 0, completed: 0 });
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchData() {
      const token = await getAccessTokenSilently();
      const res = await fetch(API.STATS.SUMMARY.ROUTE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setSummary(json);
    }

    fetchData();
  }, [getAccessTokenSilently]);

  return (
    <div className={"mb-5 panel shadow-md p-6 w-full h-[100x] flex flex-col"}>
      <h2 className={"text-lg font-bold mb-4"}>Summary</h2>
      <div className="flex-grow">
        <div>
          <div className={"font-semibold"}>Total Requests: {summary.total}</div>
        </div>
        <div>
          <div className={"font-semibold"}>Completed: {summary.completed}</div>
        </div>
      </div>
    </div>
  );
}
