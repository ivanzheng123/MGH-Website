import { FC, useEffect } from "react";
import { Link, Outlet, useLoaderData } from "react-router";
import { RouteLoader } from "@/lib/routing.ts";
import { MgbLogo } from "@/components/art/mgb-logo.tsx";
import { API, EndpointScope, FrontendAPI } from "common/src/api/endpoints.ts";
import { sha256 } from "@/lib/crypto.ts";
import { LogIn, LogOut, Mic, MicOff, Moon, Settings, UserCog, X } from "lucide-react";
import { AppSidebar } from "@/routes/!main/app-sidebar.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { PopoverClose } from "@radix-ui/react-popover";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "@/lib/theme-provider.tsx";
import { clsx } from "clsx";
import { addTokenHeader } from "@/lib/auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { useSpeech } from "@/lib/speech/use-speech.tsx";

export const Route: FC = () => {
  const data = useLoaderData<{ avatar: string; name: string; position: EndpointScope } | undefined>();
  const { theme, setTheme } = useTheme();
  const { isListening, toggleListening } = useSpeech();
  const { loginWithRedirect, logout } = useAuth0();

  useEffect(() => {}, []);

  return (
    <>
      <div className={"flex flex-row w-full h-full p-5 gap-5"}>
        {/* Quadrants 2 & 3: Width */}
        <div className={"w-[16rem] flex flex-col gap-5"}>
          {/* Quadrant 2: Height */}
          <div className="h-[2.75rem] flex items-center justify-start">
            <Link to="/">
              <MgbLogo
                className={clsx(
                  "absolute -mt-4 cursor-pointer max-h-[45px] max-w-[100%]",
                  theme === "dark" ? "text-foreground" : "text-hospital-logo"
                )}
              />
            </Link>
          </div>
          {/* Quadrant 3: Height*/}
          <div className={"flex grow max-h-full !flex-shrink-0 !w-full overflow-y-auto"}>
            <AppSidebar desktop scope={data?.position ?? "guest"} />
          </div>
        </div>
        {/* Quadrants 1 & 4: Width*/}
        <div className={"grow flex flex-col gap-5"}>
          {/* Quadrant 1: Height */}
          <div className={"h-[2.75rem] flex justify-end"}>
            <Button
              onClick={() => toggleListening()}
              className="panel-interactive !text-[unset] rounded-full mr-5 h-[2.75rem] !aspect-square"
            >
              {isListening ? <Mic className={"text-red-500 animate-pulse"} /> : <MicOff />}
            </Button>
            <Popover>
              {data === undefined ? (
                <button
                  className={"h-full panel-interactive flex items-center pl-4 group text-lg"}
                  onClick={() => loginWithRedirect()}
                >
                  <span>Hello, sign in</span>
                  <LogIn className={"ml-2 mr-4"} />
                </button>
              ) : (
                <PopoverTrigger className={"h-full panel-interactive flex items-center pl-4 group text-lg"}>
                  <span>
                    Hello, <strong>{data.name}</strong>
                  </span>
                  <img
                    src={data.name === "Wilson Wong" ? "/images/wwong2.png" : data.avatar}
                    alt={"Your avatar"}
                    className={
                      "h-[2.75rem] aspect-square rounded-full group-interaction:brightness-[80%] transition ml-3"
                    }
                  />
                </PopoverTrigger>
              )}
              <PopoverContent side={"bottom"} align={"end"} sideOffset={-50} className={"panel flex flex-col p-0"}>
                <div className={"flex flex-row"}>
                  <button
                    onClick={() => {
                      logout({
                        logoutParams: {
                          returnTo: window.location.origin,
                        },
                      });
                    }}
                    className={"panel-interactive w-full flex flex-row gap-2 px-4 py-2 text-lg m-2 items-center"}
                  >
                    <span className={"translate-[1px]"}>Sign out</span>
                    <LogOut />
                  </button>
                  <div className={"flex justify-center items-center"}>
                    <PopoverClose className={"aspect-square text-lg mr-2 p-2 panel-interactive rounded-full"}>
                      <X className={"h-[31.5px] w-[31.5px]"} />
                    </PopoverClose>
                  </div>
                </div>
                <div className={"flex flex-col gap-2 mb-2"}>
                  <Link
                    to={"/settings/profile"}
                    className={"panel-interactive text-lg py-2 px-4 flex flex-row gap-2 mx-2 items-center"}
                  >
                    <UserCog className={"h-6 w-6"} />
                    <span className={"translate-y-[1px]"}>Profile settings</span>
                  </Link>
                  <Link
                    to={"/settings/admin"}
                    className={"panel-interactive text-lg py-2 px-4 flex flex-row gap-2 mx-2 items-center"}
                  >
                    <Settings className={"h-6 w-6"} />
                    <span className={"translate-y-[1px]"}>Admin settings</span>
                  </Link>
                </div>
                <hr className={"border-hospital-blue m-0"} />
                <div
                  className={
                    "flex flex-row py-2 px-2 panel-clear-interactive interaction:!bg-hospital-blue/20 !rounded-t-none"
                  }
                >
                  <Label
                    htmlFor={"dark-mode-switch"}
                    className={"text-lg grow font-normal flex flex-row items-center pl-4 cursor-pointer"}
                  >
                    <Moon className={"h-6 w-6"} />
                    <span className={"translate-y-[1px]"}>Dark mode</span>
                  </Label>
                  <Switch
                    id={"dark-mode-switch"}
                    className={
                      "border  data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-hospital-blue/30 backdrop-blur-[10px] h-[1.65rem] w-12 cursor-pointer"
                    }
                    defaultChecked={theme === "dark"}
                    thumbClassName={"size-6 !bg-white"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light");
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* Quadrant 4: Height */}
          <div className={"grow panel overflow-auto overflow-x-hidden"}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    const data: FrontendAPI["USERS"]["VERBOSE"]["RES"] | undefined = await fetch(
      API.USERS.VERBOSE.ROUTE,
      await addTokenHeader(await getAccessTokenSilently())
    )
      .then((res) => res.json())
      .catch(() => undefined);
    const avatar = `https://gravatar.com/avatar/${await sha256(data?.email ?? "0")}?s=200`;
    return {
      avatar,
      name: `${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim(),
      position: data?.position ?? "guest",
    };
  }
  return undefined;
};
