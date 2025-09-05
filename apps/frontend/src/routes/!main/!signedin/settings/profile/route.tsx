import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { RouteAction, RouteLoader } from "@/lib/routing.ts";
import { FC, useEffect } from "react";
import { Link, useLoaderData } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useSubmitter } from "@/hooks/use-submitter.ts";
import { Button } from "@/components/ui/button.tsx";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";

const userInfoFormSchema = z.object({
  firstName: z.string().min(1, "Missing first name"),
  lastName: z.string().min(1, "Missing last name"),
  phoneNumber: z.string().min(4, "Missing phone number"), // 4 digits is the shortest phone number that exists :)
});

export const Route: FC = () => {
  const data = useLoaderData<FrontendAPI["USERS"]["VERBOSE"]["RES"] | undefined>();

  const form = useForm<z.infer<typeof userInfoFormSchema>>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: {
      firstName: "data.firstName",
      lastName: "",
      phoneNumber: "",
    },
  });

  if (data !== undefined) {
    useEffect(() => {
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
    }, [data]);

    const formSubmitter = useSubmitter<z.infer<typeof userInfoFormSchema>>();
    return (
      <>
        <div className={"p-4"}>
          <div className={"flex flex-col"}>
            <h1 className={"panel-title !pb-2"}>Profile Settings</h1>
            <hr className={"bg-hospital-blue/25 border-xl border-hospital-blue/25 mb-4"} />
            <div className={"flex flex-col gap-4 px-4"}>
              <div className={"panel w-104 p-2 pt-0 pb-4"}>
                <h2 className={"panel-title !text-xl"}>Profile information</h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(formSubmitter)}
                    className={
                      "px-4 form-label:cursor-pointer form-item:cursor-pointer form-label:gap-0 form-item:gap-0 flex flex-col gap-2"
                    }
                  >
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <>
                          <FormItem className={"flex flex-row gap-0"}>
                            <FormLabel className="w-24.5 mr-2 text-md">
                              <div className={"mr-2 text-red-500"}>*</div>
                              <span>First name</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of employee..."
                                {...field}
                                className={"panel-input !cursor-text w-60"}
                              />
                            </FormControl>
                            <div className={"h-9 flex items-center ml-4"}>
                              <FormMessage />
                            </div>
                          </FormItem>
                        </>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <>
                          <FormItem className={"flex flex-row gap-0"}>
                            <FormLabel className="w-24.5 mr-2 text-md">
                              <div className={"mr-2 text-red-500"}>*</div>
                              <span>Last name</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of employee..."
                                {...field}
                                className={"panel-input !cursor-text w-60"}
                              />
                            </FormControl>
                            <div className={"h-9 flex items-center ml-4"}>
                              <FormMessage />
                            </div>
                          </FormItem>
                        </>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <>
                          <FormItem className={"flex flex-row gap-0"}>
                            <FormLabel className="w-24.5 mr-2 text-md">
                              <div className={"mr-2 text-red-500"}>*</div>
                              <span>Phone #</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of employee..."
                                {...field}
                                className={"panel-input !cursor-text w-60"}
                              />
                            </FormControl>
                            <div className={"h-9 flex items-center ml-4"}>
                              <FormMessage />
                            </div>
                          </FormItem>
                        </>
                      )}
                    />
                    <div className={"w-[21.5rem] flex justify-end"}>
                      <Button type="submit" className="panel-interactive-submit text-[unset] px-4">
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              <div className={"panel w-104 p-2 pt-0 pb-4"}>
                <h2 className={"panel-title !text-xl"}>Login information</h2>
                <div className={"flex flex-row items-center ml-4 mb-2"}>
                  <div className={"w-24 flex flex-row font-medium"}>
                    <span>Email address</span>
                  </div>
                  <div className={"panel text-md w-60 !rounded-md ml-2 px-4 py-2 cursor-not-allowed text-md truncate"}>
                    {data.email}
                  </div>
                </div>
                <div className={"flex flex-row items-center ml-4"}>
                  <div className={"w-24 flex flex-row text-md font-medium"}>
                    <span>Password</span>
                  </div>
                  <button
                    className={
                      "panel w-60 !rounded-md ml-2 px-4 py-2 !border-red-800 !bg-red-500/20 interaction:!bg-red-600/20 text-left flex flex-row cursor-pointer"
                    }
                    onClick={() => {
                      fetch("https://auth.massgeneralbrigham.co/dbconnections/change_password", {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                        },
                        body: JSON.stringify({
                          client_id: `${import.meta.env.VITE_AUTH0_CLIENT_ID ?? ""}`,
                          email: data.email,
                          connection: "Username-Password-Authentication",
                        }),
                      }).then((res) => {
                        if (res.ok) {
                          toast.success("Password reset requested", {
                            description: "Check your email inbox to continue",
                          });
                        } else if (res.status === 429) {
                          toast.error("Slow down!", {
                            description: "You're being ratelimited. Please wait before trying again.",
                          });
                        } else {
                          toast.error("An error occured :(", {
                            description: "Please try again later.",
                          });
                        }
                      });
                    }}
                  >
                    <span className={"mr-auto"}>Change password</span>
                    <Lock />
                  </button>
                </div>
              </div>
              <div className={"panel w-104 p-2 pt-0 pb-4"}>
                <h2 className={"panel-title !text-xl"}>Profile picture</h2>
                <div className={"pl-4"}>
                  <Link
                    to={"https://gravatar.com/profile"}
                    className={"panel-interactive w-60 !rounded-md px-4 py-2 text-left flex flex-row cursor-pointer"}
                  >
                    Change your Gravatar
                  </Link>
                  <p className={"text-md mt-4"}>
                    Gravatar allows you to use the same profile picture across the web.{" "}
                    <Link to={"https://gravatar.com"} className={"text-hospital-darkerblue underline"}>
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className={"p-4"}>
        <h1 className={"panel-title"}>Profile Settings</h1>
        <hr className={"bg-hospital-blue"} />
        <h2 className={"panel-title !text-xl"}>User Information</h2>
      </div>
    </>
  );
};

export const action: RouteAction<z.infer<typeof userInfoFormSchema>> = async (data, args, context) => {
  console.log(data);
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    const req: FrontendAPI["USERS"]["UPDATE"]["ME"]["REQ"] = data;
    console.log(JSON.stringify(req));
    await fetch(API.USERS.UPDATE.ME.ROUTE, await addTokenHeaderWithBody(await getAccessTokenSilently(), req))
      .then(() => {
        toast.success("Information updated");
      })
      .catch((reason) => {
        console.error(reason);
        toast.error("An error occured :(", {
          description: "Please try again later.",
        });
      });
  } else {
    toast.error("403 Unauthorized", {
      description: "Please log out and log back in, then try again.",
    });
  }
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.VERBOSE.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
