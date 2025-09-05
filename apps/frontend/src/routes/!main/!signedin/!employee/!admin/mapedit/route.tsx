import { FC, useState } from "react";
import { APIProvider, ColorScheme, Map } from "@vis.gl/react-google-maps";
import { HospitalOverlay } from "@/components/HospitalOverlay.tsx";
import { Link } from "react-router";
import { useTheme } from "@/lib/theme-provider.tsx";
import { NavEdit } from "@/routes/!main/!signedin/!employee/!admin/mapedit/navedit.tsx";
import { useAuth0 } from "@auth0/auth0-react";

export const Route: FC = () => {
  // Set default center to Boston, MA.
  const defaultCenter = { lat: 42.3601, lng: -71.0589 };
  const [center, setCenter] = useState(defaultCenter);
  const [floor, setFloor] = useState(1);
  const { isAuthenticated } = useAuth0();
  const { theme } = useTheme();

  // used to set all the styling and options for the map embed
  const mapOptions: google.maps.MapOptions = {
    fullscreenControl: false,
    gestureHandling: "greedy", // disables the ctrl+zoom requirement when trying to change zoom of map
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,
  };

  return (
    <div className={"w-full h-full"}>
      <>
        {/*<Link*/}
        {/*  to={"/navigation"}*/}
        {/*  className="absolute top-4 left-4 z-10 bg-hospital-blue hover:bg-hospital-yellow bg-opacity-90 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-opacity-100"*/}
        {/*>*/}
        {/*  ← Back*/}
        {/*</Link>*/}
      </>

      {/* TODO: make sure this doesn't ship the api key on deployment */}
      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY} libraries={["marker"]}>
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
          <NavEdit setMapCenter={setCenter} setFloor={setFloor} floor={floor} />
        </Map>
      </APIProvider>
    </div>
  );
};
