import { FC, useState } from "react";
import { APIProvider, ColorScheme, Map } from "@vis.gl/react-google-maps";
import { Link } from "react-router";
import { HospitalOverlay } from "@/components/HospitalOverlay.tsx";
import { Directions } from "@/routes/!main/navigation/directions.tsx";
import { NavigationProvider } from "./navigation-context.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "@/lib/theme-provider.tsx";
import { RouteLoader } from "@/lib/routing.ts";
import { API } from "common/src/api/endpoints.ts";
import { addTokenHeader } from "@/lib/auth.ts";

export const Route: FC = () => {
  // Set default center to Boston, MA.
  const defaultCenter = { lat: 42.3601, lng: -71.0589 };
  const [center, setCenter] = useState(defaultCenter);
  const [floor, setFloor] = useState(1);
  const [panelVisable, setPanelVisable] = useState(false);
  const { isAuthenticated } = useAuth0();
  const [editMode, setEditMode] = useState(false);
  const { theme } = useTheme();

  // used to set all the styling and options for the map embed
  const mapOptions: Partial<google.maps.MapOptions> = {
    fullscreenControl: false,
    gestureHandling: "greedy", // disables the ctrl+zoom requirement when trying to change zoom of map
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,

    // disables the point of interest markers that are on the map by default
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  return (
    <NavigationProvider>
      <div style={{ height: "100%", width: "100%" }} className="relative">
        {!isAuthenticated && <></>}

        {/* TODO: make sure this doesn't ship the api key on deployment */}
        <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={15}
            mapId="4fe02edc1eec90da"
            colorScheme={theme === "dark" ? ColorScheme.DARK : ColorScheme.LIGHT}
            // @ts-ignore
            options={mapOptions} // has some sort of error that doesn't seem to affect running?
            onClick={(event) => {
              if (event && event.detail && event.detail.latLng) {
                const lat = event.detail.latLng.lat;
                const lng = event.detail.latLng.lng;
                console.log(lat, lng);
              }
            }}
          >
            <HospitalOverlay floor={floor} />
            {/*<NavEdit setMapCenter={setCenter} setFloor={setFloor} floor={floor} />*/}
            <Directions setMapCenter={setCenter} setFloor={setFloor} floor={floor} />
          </Map>
        </APIProvider>
      </div>
    </NavigationProvider>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.ROUTE, await addTokenHeader(await getAccessTokenSilently()));
  }
  return undefined;
};
