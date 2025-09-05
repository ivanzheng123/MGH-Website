import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const boundsMap = new Map<string, Bounds>();
boundsMap.set("Patriot Place", {
  north: 42.09351857171132,
  south: 42.0912370777435,
  east: -71.26528993667836,
  west: -71.26759196432891,
});
boundsMap.set("Chestnut Hill", {
  north: 42.32633981311485,
  south: 42.32554958657896,
  east: -71.149142614536,
  west: -71.15020878920201,
});
boundsMap.set("Faulkner", {
  north: 42.302947718815375,
  south: 42.300183288619,
  east: -71.12568601356635,
  west: -71.13107652616893,
});
boundsMap.set("Main", {
  north: 42.33797979319526,
  south: 42.332842682458946,
  east: -71.10342833303453,
  west: -71.11052579195504,
});

const patriotImageUrls = ["/images/patriot_base.png", "/images/patriot_f3.png", "/images/patriot_f4.png"];

export function HospitalOverlay({ floor }: { floor: number }) {
  const map = useMap();

  const patriotOverlay = useRef<google.maps.GroundOverlay | null>(null);
  const chestnutOverlay = useRef<google.maps.GroundOverlay | null>(null);
  const faulknerOverlay = useRef<google.maps.GroundOverlay | null>(null);
  const mainOverlay = useRef<google.maps.GroundOverlay | null>(null);

  // loads all the patriot floors so browser caches them and switching is instantaneous
  useEffect(() => {
    patriotImageUrls.forEach((url) => {
      const image = new Image();
      image.src = url;
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    if (!chestnutOverlay.current) {
      chestnutOverlay.current = new google.maps.GroundOverlay(
        "/images/chestnut_hill.png",
        boundsMap.get("Chestnut Hill")!,
        { clickable: false }
      );
    }
    if (!faulknerOverlay.current) {
      faulknerOverlay.current = new google.maps.GroundOverlay("/images/faulkner.png", boundsMap.get("Faulkner")!, {
        clickable: false,
      });
    }
    if (!mainOverlay.current) {
      mainOverlay.current = new google.maps.GroundOverlay("/images/main_campus.png", boundsMap.get("Main")!, {
        clickable: false,
      });
    }

    chestnutOverlay.current.setMap(map);
    faulknerOverlay.current.setMap(map);
    mainOverlay.current.setMap(map);

    return () => {
      chestnutOverlay.current?.setMap(null);
      faulknerOverlay.current?.setMap(null);
      mainOverlay.current?.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    patriotOverlay.current?.setMap(null);

    let patriotOverlayImg;
    switch (floor) {
      case 1:
        patriotOverlayImg = "/images/patriot_base.png";
        break;
      case 3:
        patriotOverlayImg = "/images/patriot_f3.png";
        break;
      case 4:
        patriotOverlayImg = "/images/patriot_f4.png";
        break;
      default:
        patriotOverlayImg = "/images/patriot_base.png";
        break;
    }

    patriotOverlay.current = new google.maps.GroundOverlay(patriotOverlayImg, boundsMap.get("Patriot Place")!, {
      clickable: false,
    });
    patriotOverlay.current.setMap(map);

    return () => {
      patriotOverlay.current?.setMap(null);
    };
  }, [map, floor]);

  return null;
}
