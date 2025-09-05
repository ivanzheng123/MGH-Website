import { FC } from "react";
import ForumPage from "@/routes/!main/!signedin/!employee/forum/ForumHomePage.tsx";
import { RouteLoader } from "@/lib/routing.ts";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { addTokenHeader } from "@/lib/auth.ts";
import { useLoaderData } from "react-router";

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["USERS"]["VERBOSE"]["RES"] | undefined>();
  if (data !== undefined && data.position !== "guest") {
    return <ForumPage />;
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
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
