import React, { useState } from "react";
import { generateRenderer, generateRoutes } from "@/lib/routing.ts";
import { createBrowserRouter, RouterProvider } from "react-router";
import { createStatefulContext } from "@/lib/create-stateful-context.ts";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "@/lib/theme-provider.tsx";
import { clsx } from "clsx";

export const AuthContext = createStatefulContext({
  id: "",
  position: "",
});

function App() {
  const auth = useAuth0();
  const user = useState({ id: "", position: "" });
  const router = createBrowserRouter([generateRoutes()], {
    dataStrategy: generateRenderer({ auth }),
  });
  const { theme } = useTheme();

  return (
    <>
      <AuthContext value={user}>
        <div className={clsx("w-screen h-screen !overflow-hidden", theme === "dark" && "dark")}>
          <RouterProvider router={router} />
        </div>
      </AuthContext>
    </>
  );
}

export default App;
