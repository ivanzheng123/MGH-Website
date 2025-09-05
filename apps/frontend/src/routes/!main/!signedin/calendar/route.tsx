import { FC, useState } from "react";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { useAuth0 } from "@auth0/auth0-react";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { CalendarDisplay } from "@/routes/!main/!signedin/calendar/CalendarDisplay";
import { RouteAction, RouteLoader } from "@/lib/routing.ts";
import { useLoaderData } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmitter } from "@/hooks/use-submitter.ts";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";

const formSchema = z.object({
  date: z.date(),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

type SubmitAction = FrontendAPI["CALENDAR"]["CREATE"]["REQ"];

export const Route: FC = () => {
  const [calendarEvent, setCalendarEvent] = useState();
  const { getAccessTokenSilently } = useAuth0();

  const body: z.infer<typeof formSchema> = {
    date: new Date(1746296668992),
    title: "Title",
    description: "Description",
  };
  //console.log("isValid?: " + z.isValid<z.infer<typeof formSchema>>(body));
  console.log("Body: " + JSON.stringify(body));

  async function testBackend() {
    fetch(API.CALENDAR.CREATE.ROUTE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getAccessTokenSilently()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body) /*as z.infer<typeof formSchema>*/,
    });
  }

  const { data: calendarData }: { data: CalendarEvent[] } = useLoaderData();

  const submitter = useSubmitter<FrontendAPI["CALENDAR"]["CREATE"] /*["TYPE"]*/["REQ"]>();
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

  return (
    <div className={"flex flex-row justify-between m-6"}>
      <div className={"panel p-4 w-fit"}>
        <h1 className={"panel-title !p-0"}>Event Form</h1>
        <hr className={"border-hospital-blue my-2"} />
        <p className={"pb-4"}>Fill out this form to schedule an event.</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              console.log("calendar form data: ", data);

              submitter({
                date: data.date, //data.date,
                title: data.title, //data.title,
                description: data.description, //data.desc,
              });
            }, console.error)}
            className="space-y-4"
          >
            <FormField
              name="date"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Date</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Calendar
                      mode={"single"}
                      selected={field.value}
                      onSelect={field.onChange}
                      className={
                        "panel-interactive w-fit  placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Title</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={"Event title"}
                      className={
                        "panel-interactive w-[100%]  placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Description</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={"Event description"}
                      className={
                        "panel-interactive w-[100%]  placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type={"submit"} className={"panel-interactive text-[unset] !rounded-xl"}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
      {/*<JsonTable //Just here for debug to see events that have been added (doesn't need to be updated to ShadCN table)
        // @ts-expect-error FIXME PLEASE
        jsonList={fetch(API.CALENDAR.ROUTE).then((data) => data.json())}
        custom={{}}
        dateFixColumns={[1]} />*/}
      <div className="border-1 h-screen border-hospital-darkerblue/25"></div>
      <div className={"flex rounded-md w-fit h-fit flex-col panel"}>
        <div className={"panel-title !pb-0"}>Event Calendar</div>
        <hr className={"border-hospital-blue my-2 mb-4 mx-4"} />
        <CalendarDisplay calendarData={calendarData} className={"mx-4 mb-4"} />
      </div>
    </div>
  );
};

export type CalendarEvent = {
  id: number;
  date: Date;
  title: string;
  description: string;
};

const calendarSchema = z.array(
  z.object({
    id: z.number(),
    date: z.coerce.date(),
    title: z.string(),
    description: z.string(),
  })
);

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    const user: FrontendAPI["USERS"]["RES"] = await fetch(
      API.USERS.ROUTE,
      await addTokenHeader(await getAccessTokenSilently())
    )
      .then((res) => res.json())
      .catch(() => undefined);
    if (user === undefined) {
      return undefined;
    }
    return {
      data: calendarSchema.parse(
        await fetch(API.CALENDAR.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
          .then((res) => res.json())
          .catch(() => undefined)
      ),
    };
  }
  return undefined;
};

export const action: RouteAction<SubmitAction> = async (data, args, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    await fetch(API.CALENDAR.CREATE.ROUTE, await addTokenHeaderWithBody(await getAccessTokenSilently(), data))
      .then((res) => {
        if (res.ok) {
          toast.success("Request submitted successfully");
        } else {
          toast.error("Request submission failed");
          console.error("Service request failed on response:", res, "Content:", res.text());
        }
      })
      .catch((reason) => {
        toast.error("Request submission failed");
        console.error("Service request failed at fetch call:", reason);
      });
  }
};
