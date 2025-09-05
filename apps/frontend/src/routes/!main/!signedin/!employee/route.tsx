import { FC } from "react";
import { Outlet, useLoaderData } from "react-router";
import { RouteLoader } from "@/lib/routing.ts";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";

import { addTokenHeader } from "@/lib/auth.ts";

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["USERS"]["VERBOSE"]["RES"] | undefined>();
  if (data !== undefined && (data.position === "employee" || data.position === "admin")) {
    return (
      <>
        <Outlet />
      </>
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
    return await fetch(API.USERS.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
