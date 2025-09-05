import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import App from "@/App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { ThemeProvider } from "@/lib/theme-provider.tsx";

// Entry point where root component is rendered into the DOM
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* i wish i could put this in App, but react router needs access to the auth0 object so the provider needs to be here */}
    <Auth0Provider
      // this domain is where auth0 is hosted, and the clientId is how we identify our app. don't worry, its not a secret
      domain={"auth.massgeneralbrigham.co"}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      // to talk to the backend, we're generating a jwt for the api on every request, but sometimes we might need to request the user for consent to generate a token for the api. we do this here. also, we can define our audiance here, and then we never need to specify it when we make tokens.
      authorizationParams={{
        scope: "admin",
        redirect_uri: window.location.origin,
        audience: "https://massgeneralbrigham.co/api",
      }}
      // sometimes, we need to refresh the token, so we allow that
      useRefreshTokens={true}
      // we use localstorage to store tokens so they persist between refresh and tabs.
      cacheLocation={"localstorage"}
    >
      {/*I also wish i could put this in App, but App needs to access the theme to set .dark :(*/}
      <ThemeProvider defaultTheme={"light"}>
        <App />
      </ThemeProvider>
    </Auth0Provider>
  </React.StrictMode>
);
