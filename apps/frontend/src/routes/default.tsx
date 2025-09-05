import { FC, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ParticleBackground } from "@/routes/particle-background.tsx";
import { Link, redirect, useLoaderData } from "react-router";
import { MgbLogo } from "@/components/art/mgb-logo.tsx";
import { LogIn, LogOut, MicOff, Moon, UserCog, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { RouteLoader } from "@/lib/routing.ts";
import { API, EndpointScope, FrontendAPI } from "common/src/api/endpoints.ts";
import { addTokenHeader } from "@/lib/auth.ts";
import { sha256 } from "@/lib/crypto.ts";
import { PopoverClose } from "@radix-ui/react-popover";
import { useTheme } from "@/lib/theme-provider.tsx";
import { DisclaimerBanner } from "@/routes/disclaimer-banner.tsx";
import { useSpeech } from "@/lib/speech/use-speech.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FilledMic } from "@/components/art/FilledMic.tsx";

export const Route: FC = () => {
  const [date, setDate] = useState(new Date());
  const data = useLoaderData<{ avatar: string; name: string; position: EndpointScope } | undefined>();
  const { isListening, toggleListening } = useSpeech();
  const { theme, setTheme } = useTheme();
  const { loginWithRedirect, logout } = useAuth0();

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <DisclaimerBanner />
      <div className="flex flex-col h-dvh w-dvw bg-cover bg-center bg-[url('/images/art/background.svg')] relative overflow-hidden">
        {/*Particle Background */}
        <ParticleBackground />

        {/* Login Button */}
        <div className={"h-[2.75rem] flex justify-end mt-5 mr-5"}>
          <Popover>
            {data === undefined ? (
              <>
                <Button
                  onClick={() => toggleListening()}
                  className="panel-interactive !text-[unset] rounded-full mr-5 h-[2.75rem] z-500 !aspect-square"
                >
                  {isListening ? <FilledMic className={"text-red-500 animate-pulse"} /> : <MicOff />}
                </Button>
                <button
                  className={"h-full panel-interactive flex items-center pl-4 group text-lg z-500"}
                  onClick={() => loginWithRedirect()}
                >
                  <span>Hello, sign in</span>
                  <LogIn className={"ml-2 mr-4"} />
                </button>
              </>
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
                {/*<Link*/}
                {/*  to={"/settings/admin"}*/}
                {/*  className={"panel-interactive text-lg py-2 px-4 flex flex-row gap-2 mx-2 items-center"}*/}
                {/*>*/}
                {/*  <Settings className={"h-6 w-6"} />*/}
                {/*  <span className={"translate-y-[1px]"}>Admin settings</span>*/}
                {/*</Link>*/}
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

        {/* Spacer at Top */}
        <div className="flex-4" />

        <div>
          <div
            className="text-lg font-bold text-center text-hospital-darkblue
        dark:text-white -mt-32"
          >
            {date.toLocaleString()}
          </div>
        </div>

        {/* Logo */}
        <div className="flex-2 flex justify-center items-center z-10">
          <div className="w-[65%] flex justify-center">
            <MgbLogo className="block w-[90%] -mt-40" />
          </div>
        </div>

        {/* Header */}
        <div className="flex-2 flex justify-center items-center z-10">
          <h2 className="-mt-14 text-3xl font-bold text-hospital-darkblue dark:text-[unset]">
            Integrated Health Care System
          </h2>
        </div>

        {/* First Row of Buttons */}
        <div className="flex-2 flex justify-center items-center">
          <div className="flex gap-6 text-2xl">
            <Link
              to={"/navigation"}
              className="-mt-4 flex justify-center items-center w-64 h-24 panel-interactive-home border-2 font-semibold shadow-md"
            >
              Navigation
            </Link>
            <Link
              to={"/employees"}
              className="-mt-4 flex justify-center items-center w-64 h-24 panel-interactive-home border-2 font-semibold shadow-md"
            >
              Employees
            </Link>
          </div>
        </div>

        {/*/!* Spacer between button rows *!/*/}
        {/*<div className="" />*/}

        {/*/!* Second Row of Buttons *!/*/}
        {/*<div className="flex-2 flex justify-center items-center text-xl">*/}
        {/*  <div className="flex gap-6">*/}
        {/*    <Link*/}
        {/*      to={"/about"}*/}
        {/*      className="flex justify-center items-center w-54 h-20 panel-interactive-home border-2 font-semibold shadow-md"*/}
        {/*    >*/}
        {/*      About*/}
        {/*    </Link>*/}
        {/*    <Link*/}
        {/*      to={"/credits"}*/}
        {/*      className="flex justify-center items-center w-54 h-20 panel-interactive-home border-2 font-semibold shadow-md"*/}
        {/*    >*/}
        {/*      Credits*/}
        {/*    </Link>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="text-white absolute bottom-12 w-full flex justify-center">
          <h2 className="text-sm text-center">
            <br />
            <br />
            Copyright &copy; Worcester Polytechnic Institute, Mass General Brigham, and contributors. All Rights
            Reserved.
            <Link to="/legal" className="underline ml-2 mr-2">
              Legal
            </Link>
            <Link to="/about" className="underline mr-2">
              About Us
            </Link>
            <Link to="/credits" className="underline">
              Credits
            </Link>
          </h2>
        </div>

        {/* Spacer at Bottom */}
        <div className="flex-2" />
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
    if ((data?.position ?? "guest") === "employee" || (data?.position ?? "guest") === "admin") {
      return redirect("/navigation");
    }
    return {
      avatar,
      name: `${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim(),
      position: data?.position ?? "guest",
    };
  }
  return undefined;
};
