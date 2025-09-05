import { FC } from "react";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { RouteLoader } from "@/lib/routing.ts";
import { Outlet, useLoaderData } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { addTokenHeader } from "@/lib/auth.ts";

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["USERS"]["VERBOSE"]["RES"] | null | undefined>();
  const { loginWithRedirect } = useAuth0();
  if (data !== undefined && data !== null && data.position === "admin") {
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
        <span>Please </span>
        <button onClick={() => loginWithRedirect()} className={"text-hospital-darkerblue cursor-pointer"}>
          login
        </button>
        <span> to view this page.</span>
      </p>
    </>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.VERBOSE.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => null); // hack to allow viewing these pages without an employee linked to your account
  }
  return undefined;
};
