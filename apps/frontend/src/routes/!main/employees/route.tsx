import { FC } from "react";
import { RouteLoader } from "@/lib/routing.ts";
import { Link, useLoaderData } from "react-router";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { Mail, Phone } from "lucide-react";

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["EMPLOYEES"]["RES"]>();
  const dataToIterateOver: FrontendAPI["EMPLOYEES"]["RES"] = data.filter((value) => {
    return value.position === "admin";
  });
  dataToIterateOver.push(
    ...data.filter((value) => {
      return value.position !== "admin";
    })
  );
  return (
    <>
      <div className="m-4 max-w-5xl">
        <div className="grid grid-cols-3 gap-6">
          {dataToIterateOver.map((value, index) => (
            <div key={index} className="panel aspect-square flex flex-col">
              <h2 className={"text-xl font-semibold p-4 pb-3 panel-inline rounded-t-3xl"}>
                {value.firstName} {value.lastName}
              </h2>
              <hr className={"border-hospital-blue"} />
              <ul className={"mx-4 my-2 text-lg"}>
                <li>
                  <strong>Department:</strong> {value.department ?? "General staff"}
                </li>
                <li>
                  <strong>Position:</strong> {value.position.trim()[0].toUpperCase()}
                  {value.position.trim().substring(1).toLowerCase()}
                </li>
              </ul>
              <div className={"grow"} />
              <div className={"border-2 border-hospital-blue border-dashed rounded-3xl px-4 py-2 m-2"}>
                <h3 className={"text-xl font-semibold ml-4 mb-2"}>Contact Information</h3>
                <div className={"text-lg flex flex-col gap-2"}>
                  <Link
                    // @ts-expect-error i have no idea why typescript doesn't like me using replaceAll its been in the standard for 5 years
                    to={`tel:${value.phoneNumber.replaceAll("(", "").replaceAll(")", "").replaceAll("-", "").replaceAll(" ", "")}`}
                    className={"panel-interactive px-4 py-2 w-full flex flex-row items-center gap-2"}
                  >
                    <Phone className={"h-6 w-6"} />
                    <div className={"grow"} />
                    <span className={"truncate"}>{value.phoneNumber}</span>
                  </Link>
                  <Link
                    to={`mailto:${value.email}`}
                    className={"panel-interactive px-4 py-2 w-full flex flex-row items-center gap-2"}
                  >
                    <Mail className={"h-6 w-6"} />
                    <div className={"grow"} />
                    <span className={"truncate"}>{value.email}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/*<h2><strong>Employees Table</strong></h2>
      <JsonTable
        jsonList={employees as JsonFormat[]}
        custom={{
          id: {
            title: "ID",
            include: false,
          },
          firstName: {
            title: "First Name",
            include: true,
          },
          lastName: {
            title: "Last Name",
            include: true,
          },
          email: {
            title: "Email",
            include: true,
          },
          phoneNumber: {
            title: "Phone Number",
            include: true,
          },
          position: {
            title: "Position",
            include: true,
          },
          department: {
            title: "Department",
            include: false,
          },
        }}
        dateFixColumns={[]}
      />*/}
    </>
  );
};

export const loader: RouteLoader = async ({ request, params }) => {
  return await fetch(API.EMPLOYEES.ROUTE).then((res) => res.json());
};
