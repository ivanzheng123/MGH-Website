import { FC } from "react";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { RouteLoader } from "@/lib/routing.ts";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";
import { DataTable, DataTableColumnDef } from "@/components/DataTable.tsx";
import { ArrayElementOf } from "@/lib/array-element-of.ts";
import { Button } from "@/components/ui/button.tsx";
import { ArrowUpDown, CircleCheckBig, PencilRuler } from "lucide-react";
import { unrestrictedobject } from "common/src/unrestrictedobject.ts";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const CompleteButton: FC<{ serviceRequestId: number }> = ({ serviceRequestId }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const revalidator = useRevalidator();
  const handleClick = async () => {
    if (isAuthenticated) {
      await fetch(
        API.REQUESTS.VIEW.ASSIGNED.COMPLETE.ROUTE,
        await addTokenHeaderWithBody(await getAccessTokenSilently(), {
          serviceRequestId,
        } satisfies FrontendAPI["REQUESTS"]["VIEW"]["ASSIGNED"]["COMPLETE"]["REQ"])
      )
        .then((res) => {
          if (!res.ok) {
            toast.error("Failed to resolve request");
          } else {
            toast.success("Resolved request successfully!");
          }
        })
        .then(revalidator.revalidate);
    } else {
      toast.error("401 Unauthenticated", {
        description: "Please log out and log back in, then try again.",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={"cursor-pointer ml-auto text-xs flex flex-row items-center panel-interactive"}
    >
      <span className={"pr-1 pl-1.5 py-0.5 translate-y-[0.25px]"}>Resolve</span>
      <CircleCheckBig className={"w-4 h-4 pr-0.5"} />
    </button>
  );
};

const columns: DataTableColumnDef<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]> = [
  {
    id: "id",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={"!bg-transparent text-[unset] !shadow-none !rounded-none"}
        >
          ID
          <div className={"ml-2 panel-interactive p-1"}>
            <ArrowUpDown className="h-4 w-4" />
          </div>
        </Button>
      );
    },
    accessorKey: "id",
  },
  {
    id: "requester",
    header: "Requester",
    accessorKey: "requester_name",
  },
  {
    id: "assignee",
    header: "Assignee",
    accessorKey: "assignedTo",
    cell: ({ getValue, table }) => {
      const value = getValue() as ArrayElementOf<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]>["assignedTo"];
      if (value !== null) {
        return `${value.firstName} ${value.lastName}`;
      }
      return "Unassigned";
    },
  },
  {
    id: "hospitalName",
    header: "Hospital",
    accessorKey: "hospital",
  },
  {
    id: "department",
    header: "Location",
    accessorKey: "location",
  },
  {
    id: "requested_at",
    header: "Requested on",
    accessorKey: "request_time",
    cell: ({ getValue }) => {
      const value = getValue() as ArrayElementOf<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]>["request_time"];
      return <div>{dateFormat.format(new Date(value))}</div>;
    },
  },
  {
    id: "resolved_and_time",
    header: "Resolved on",
    accessorKey: "completed_time",
    cell: ({ getValue, row }) => {
      const value = getValue() as ArrayElementOf<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]>["completed_time"];
      if (value === null || value === undefined) {
        return (
          <>
            <div className={"flex flex-row items-center"}>
              <span>Unresolved</span>
              {row.original !== undefined && row.original.id !== undefined ? (
                <CompleteButton serviceRequestId={row.original.id} />
              ) : (
                <></>
              )}
            </div>
          </>
        );
      } else {
        return <div>{dateFormat.format(new Date(value))}</div>;
      }
    },
  },
  {
    id: "urgency_level",
    header: "Urgency level",
    accessorKey: "urgency_level",
  },
  {
    id: "type_of_request",
    header: "Request detail",
    accessorKey: "type",
    cell: ({ getValue }) => {
      const value = getValue() as ArrayElementOf<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]>["type"];
      if (value === undefined) {
        return "General";
      }
      return value.replace(/[A-Z]/g, (substring) => ` ${substring}`).trim();
    },
  },
  {
    id: "notes",
    header: "Note",
    accessorKey: "note",
  },
  {
    id: "edit",
    cell: ({ row, table }) => {
      const cannotEdit = <div>Editing unavailable</div>;
      if (row.original === undefined) {
        return cannotEdit;
      }
      const paths: Record<string, string> = {
        LanguageRequest: "/request/interpreter",
        AudioVisualRequest: "/request/avdevice",
        FoodServiceRequest: "/request/meal",
        DeviceRequest: "/request/medicaldevice",
        MaintenanceRequest: "/request/maintenance",
        TransportationRequest: "/request/transportation",
      };
      const typeOfRequest = paths[row.original["type"]];

      const a = table.options.meta as FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"];
      const item = a.find((value) => {
        return (value?.id ?? -1) === (row.original?.["id"] ?? -2);
      });
      if (item === undefined) {
        return cannotEdit;
      }
      const itemAsParams: unrestrictedobject = { ...item };
      delete itemAsParams.note;
      return (
        <Link
          to={{
            pathname: typeOfRequest,
            search: JSON.stringify(itemAsParams),
          }}
          className={"cursor-pointer ml-auto text-xs flex flex-row items-center panel-interactive p-1"}
        >
          <span className={"px-1 translate-y-[1px]"}>Edit</span>
          <PencilRuler className={"w-4 h-4"} />
        </Link>
      );
    },
  },
];

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]>();
  if (data === undefined) {
    return (
      <>
        <h1>403 Forbidden</h1>
        <p className={"text-center text-xl"}>
          <span>You are not permitted to view this page.</span>
        </p>
      </>
    );
  }
  return (
    <>
      <div className={"max-w-5xl"}>
        <DataTable columns={columns} data={data} meta={data} />
      </div>
    </>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    const user: FrontendAPI["USERS"]["RES"] = await fetch(
      API.USERS.ROUTE,
      await addTokenHeader(await getAccessTokenSilently())
    )
      .then((res) => res.json())
      .catch(() => undefined);
    if (user === undefined) {
      return undefined;
    }
    return await fetch(
      API.REQUESTS.VIEW.ASSIGNED.ROUTE,
      await addTokenHeaderWithBody(await getAccessTokenSilently(), {
        id: user.id,
      })
    )
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
