import { FC } from "react";
import RequestSummaryPanel from "./RequestSummaryPanel";
import RequestTypePieChart from "@/routes/!main/!signedin/!employee/!admin/view/stats/RequestTypePieChart.tsx";
import RequestCompletedLineChart from "@/routes/!main/!signedin/!employee/!admin/view/stats/RequestCompletedLineChart.tsx";
import RequestCreatedLineChart from "@/routes/!main/!signedin/!employee/!admin/view/stats/RequestCreatedLineChart.tsx";

export const Route: FC = () => {
  return (
    <div className="px-4">
      <h1 className="panel-title">Service Request Statistics</h1>
      <RequestSummaryPanel />
      <div className="flex flex-row gap-4 w-full">
        <div className="flex-1">
          <RequestTypePieChart />
        </div>
        <div className="flex-1">
          <RequestCompletedLineChart />
        </div>
      </div>
      <div className="mt-6 mb-4">
        <RequestCreatedLineChart />
      </div>
    </div>
  );
};
