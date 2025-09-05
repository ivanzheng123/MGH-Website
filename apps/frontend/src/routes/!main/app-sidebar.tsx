import { FC, Fragment, ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Ambulance,
  AudioWaveform,
  BookUser,
  BrushCleaning,
  CalendarDaysIcon,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardPaste,
  ClipboardPenLine,
  GamepadIcon,
  Globe,
  MapPinPlus,
  MessagesSquare,
  Microscope,
  Soup,
  TrendingUp,
} from "lucide-react";
import { isAuthorized } from "@/lib/auth.ts";
import { EndpointScope } from "common/src/api/endpoints.ts";
import { clsx } from "clsx";
import { InfoHoverCard } from "@/components/InfoHoverCard.tsx";

type SidebarEntry = {
  title: string;
  path: string;
  auth: EndpointScope;
  icon: ReactNode;
  sub?: Omit<SidebarEntry, "sub">[];
  info?: ReactNode;
};

const items: SidebarEntry[] = [
  {
    title: "Navigation",
    path: "/navigation",
    auth: "guest",
    icon: <MapPinPlus className="h-6 w-6" />,
  },
  {
    title: "Employees",
    path: "/employees",
    auth: "guest",
    icon: <BookUser className="h-6 w-6" />,
  },
  {
    title: "Employee Forum",
    path: "/forum",
    auth: "employee",
    icon: <MessagesSquare className="h-6 w-6" />,
  },
  {
    title: "Calendar",
    path: "/calendar",
    auth: "employee",
    icon: <CalendarDaysIcon className="h-6 w-6" />,
  },
  {
    title: "Crossywong",
    path: "/games",
    auth: "guest",
    icon: <GamepadIcon className="h-6 w-6" />,
  },
  {
    title: "Requests",
    path: "/view",
    auth: "employee",
    icon: <ClipboardList className="h-6 w-6" />,
    sub: [
      {
        title: "All Requests",
        path: "/view/allservicereqs",
        auth: "admin",
        icon: <ClipboardCheck className="h-6 w-6" />,
      },
      {
        title: "Assigned Requests",
        path: "/view/assignedservicereqs",
        auth: "employee",
        icon: <ClipboardCopy className="h-6 w-6" />,
      },
      {
        title: "My Requests",
        path: "/view/createdservicereqs",
        auth: "employee",
        icon: <ClipboardPaste className="h-6 w-6" />,
      },
      {
        title: "Statistics",
        path: "/view/stats",
        auth: "admin",
        icon: <TrendingUp className="h-6 w-6" />,
      },
    ],
  },
  {
    title: "Request Services",
    path: "/request",
    auth: "employee",
    icon: <ClipboardPenLine className="h-6 w-6" />,
    info: (
      <InfoHoverCard
        title={"Using Service Requests"}
        description={[
          "• This application offers many service requests for employees to use.",
          <br />,
          "• To begin, select the desired service request from the options below.",
          <br />,
          "• Each form will ask for your name, the hospital and department for the request, the assigned employee (if applicable), and an urgency level.",
          <br />,
          "• Complete the request-specific fields.",
          <br />,
          "• Add any additional notes and then submit.",
        ]}
        className={
          "bg-transparent hover:bg-transparent scale-125 dark:text-white relative top-1.75 py-0 scale-10 ml-2 text-foreground cursor-pointer"
        }
      />
    ),
    sub: [
      {
        title: "Maintenance",
        path: "/request/maintenance",
        auth: "employee",
        icon: <BrushCleaning className="h-6 w-6" />,
      },
      {
        title: "Language Interpreter",
        path: "/request/interpreter",
        auth: "employee",
        icon: <Globe className="h-6 w-6" />,
      },
      {
        title: "Meal for Patient",
        path: "/request/meal",
        auth: "employee",
        icon: <Soup className="h-6 w-6" />,
      },
      {
        title: "Medical Device",
        path: "/request/medicaldevice",
        auth: "employee",
        icon: <Microscope className="h-6 w-6" />,
      },
      {
        title: "A/V Device",
        path: "/request/avdevice",
        auth: "employee",
        icon: <AudioWaveform className="h-6 w-6 opacity-100" />,
      },
      {
        title: "Transportation",
        path: "/request/transportation",
        auth: "employee",
        icon: <Ambulance className="h-6 w-6 opacity-100" />,
      },
    ],
  },
];

export const AppSidebar: FC<{ desktop?: boolean; scope: EndpointScope }> = ({ desktop, scope }) => {
  // Store state for open submenus keyed by the index of the item within the items array.
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: number]: boolean }>({});

  const toggleSubMenu = (index: number) => {
    setOpenSubMenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const location = useLocation();

  return desktop ? (
    <nav className="flex flex-col gap-2 mb-10 w-full">
      {items.map((item, index) =>
        isAuthorized(item.auth, scope) ? (
          <Fragment key={index}>
            <div className="flex flex-col">
              {item.sub ? (
                <>
                  <div
                    className={
                      openSubMenus[index] || location.pathname.startsWith(item.path)
                        ? "panel"
                        : "panel-clear-interactive"
                    }
                  >
                    <button
                      onClick={() => {
                        if (!location.pathname.startsWith(item.path)) {
                          toggleSubMenu(index);
                        }
                      }}
                      className={clsx(
                        "cursor-pointer w-full flex justify-start items-center px-4 py-2 text-lg outline-none transition-all",
                        (openSubMenus[index] || location.pathname.startsWith(item.path)) &&
                          "panel-inline rounded-3xl rounded-b-none"
                      )}
                    >
                      {item.icon}
                      <span className="ml-2 translate-y-[1.5px]">{item.title}</span>
                      {openSubMenus[index] && <span className={"ml-2 scale-80"}>{item.info}</span>}
                    </button>
                    <div
                      className={clsx(
                        "starting:h-0 starting:opacity-0 transition-all transition-discrete block ease-out",
                        !(openSubMenus[index] || location.pathname.startsWith(item.path)) && "hidden h-0 opacity-0",
                        (openSubMenus[index] || location.pathname.startsWith(item.path)) && "h-auto opacity-100"
                      )}
                    >
                      <div>
                        <hr
                          className={clsx(
                            "border-hospital-blue",
                            (openSubMenus[index] || location.pathname.startsWith(item.path)) && ""
                          )}
                        />
                        <div className="flex flex-col mx-1 gap-1 mb-1 mt-1">
                          {item.sub.map((subItem, subIndex) =>
                            isAuthorized(subItem.auth, scope) ? (
                              <Fragment key={`${subItem.path}${subIndex}`}>
                                <div
                                  className={clsx(
                                    "starting:opacity-0 transition starting:translate-y-[3px] duration-200",
                                    (openSubMenus[index] || location.pathname.startsWith(item.path)) &&
                                      "opacity-100 translate-0"
                                  )}
                                  // need to set the delay as an inline style because tw tree shaking doesnt do dynamic analysis :(
                                  style={{
                                    transitionDelay: `${0.07 * subIndex}s`,
                                  }}
                                >
                                  <NavLink
                                    key={subIndex}
                                    to={subItem.path}
                                    className={({ isActive }) =>
                                      isActive
                                        ? "panel cursor-pointer w-full flex justify-start items-center px-3 py-2 text-lg"
                                        : "panel-clear-interactive w-full flex justify-start items-center px-3 py-2 text-lg"
                                    }
                                  >
                                    {subItem.icon}
                                    <div className={"flex items-center"}>
                                      <span className="ml-2 translate-y-[1.5px] text-sm">{subItem.title}</span>
                                    </div>
                                  </NavLink>
                                </div>
                              </Fragment>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "panel cursor-pointer w-full flex justify-start items-center px-4 py-2 text-lg"
                      : "panel-clear-interactive w-full flex justify-start items-center px-4 py-2 text-lg"
                  }
                  onClick={() => {
                    setOpenSubMenus({});
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </NavLink>
              )}
            </div>
          </Fragment>
        ) : null
      )}
    </nav>
  ) : (
    <div></div>
  );
};
