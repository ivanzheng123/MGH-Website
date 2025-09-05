import { ReactElement, useState } from "react";
import { RouteLoader } from "@/lib/routing.ts";
import { API } from "common/src/api/endpoints.ts";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { CalendarEvent } from "@/routes/!main/!signedin/calendar/route.tsx";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card.tsx";

export const loader: RouteLoader = async ({ request, params }) => {
  return await fetch(API.CALENDAR.ROUTE).then((x) => x.json());
};

export function CalendarDisplay(input: { calendarData: CalendarEvent[]; className?: string }): ReactElement {
  const [selected, setSelect] = useState<Date>();
  //const [calendarData, setCalendarData] = useState<Date[]>();
  const calendarData: CalendarEvent[] = input.calendarData; //useLoaderData();
  //console.log("useLoaderData(): " + useLoaderData<{ data: CalendarEvent[] }>());
  //const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  //useEffect(() => {
  /* Promise.resolve(
       fetch(API.CALENDAR.ROUTE, {
         headers: {
           Authorization: `Bearer ${getAccessTokenSilently()}`,
         },
       })
         .then((data) => data.json())
         .then((data) => setCalendarData(data))
     );*/

  //});

  console.log("CalendarData: " + JSON.stringify(calendarData));

  return (
    <DayPicker
      mode={"single"}
      selected={selected}
      onSelect={setSelect}
      className={input.className}
      components={{
        Day: ({ ...props }) => {
          const { displayMonth, date, ...dayProps } = props;
          return (
            <td {...dayProps}>
              <ul className={"w-full h-full"}>
                <li className={"text-lg pl-1 text-left"}>
                  {date.getMonth() == displayMonth.getMonth() ? (
                    <strong>{date.getDate()}</strong>
                  ) : (
                    <div className="text-muted-foreground">{date.getDate()}</div>
                  )}
                </li>
                {calendarData.map((dateData) => {
                  // (getDate gets only the day of the month)
                  if (
                    date.getFullYear() == dateData.date.getFullYear() &&
                    date.getMonth() == dateData.date.getMonth() &&
                    date.getDate() == dateData.date.getDate()
                  ) {
                    return (
                      <li>
                        <HoverCard closeDelay={150} openDelay={300}>
                          <HoverCardTrigger
                            asChild
                            className={
                              "peer-[.is-visible]:opacity-100 peer-[.is-visible]:[display:unset] transition-all " +
                              "transition-discrete cursor-pointer m-1"
                            }
                          >
                            <p
                              className={
                                "panel !rounded-md text-sm truncate w-20.5 pl-1 text-left " +
                                (date.getMonth() == displayMonth.getMonth() ? "" : " text-muted-foreground")
                              }
                            >
                              {dateData.title}
                            </p>
                          </HoverCardTrigger>
                          <HoverCardContent sideOffset={15} className="w-75 panel p-0">
                            <h2 className="font-medium p-3 pb-2.5 text-md">{dateData.title}</h2>
                            <hr className={"border-hospital-blue "} />
                            <p className={"text-sm p-3 pb-2.5 text-md"}>
                              <strong>Time: </strong>
                              {dateData.date.toLocaleString()}
                            </p>
                            <hr className={"border-hospital-blue"} />
                            <p className={"text-sm p-3 pb-2.5 text-md"}>
                              <strong>Description: </strong>
                              {dateData.description}
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </li>
                    );
                  }
                })}
              </ul>
            </td>
          );
        },
      }}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "panel h-full flex flex-col",
        caption: "flex justify-center py-1 relative bg-hospital-darkerblue/20 rounded-t-3xl items-center w-full pb-2",
        caption_label: "text-2xl font-bold",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-3",
        nav_button_next: "absolute right-3",
        table: "w-full border-collapse space-x-1 ",
        head_row: "flex ",
        head_cell: " w-22.5 font-normal bg-hospital-darkerblue/20",
        row: "border-t border-hospital-blue flex !bg-white/20 dark:!bg-white/10 last:rounded-b-3xl",
        cell: cn(
          //TODO make not hardcoded width and height
          "last:border-r-0 text-left w-22.5 min-h-22.5 border-r border-hospital-blue relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected])]:rounded-md "
        ),
        day: cn(buttonVariants({ variant: "ghost" }), "size-8 p-0 font-normal aria-selected:opacity-100"),
        day_range_start: "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end: "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
    ></DayPicker>
  );
}
