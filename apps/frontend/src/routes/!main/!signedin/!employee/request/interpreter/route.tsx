import { FC, Fragment, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouteAction, RouteLoader } from "@/lib/routing.ts";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { useSubmitter } from "@/hooks/use-submitter.ts";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";
import { useLoaderData, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import { departmentsByHospital } from "@/routes/!main/navigation/navinfo.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";
import { ArrayElementOf } from "@/lib/array-element-of.ts";

const departments = departmentsByHospital;

const formSchema = z.object({
  // COMMON
  assignedId: z.string().optional().default("0"),
  hospitalName: z.preprocess(
    (val) => val ?? "",
    z.enum(["Patriot Place", "Chestnut Hill", "Faulkner", "Main Campus"], {
      message: "Required",
    })
  ),
  department: z.string().min(2, "Required").default(""),
  urgency_level: z.preprocess(
    (val) => val ?? "",
    z.enum(["Low", "Medium", "High", "Emergency"], {
      message: "Required",
    })
  ),
  note: z.string().default(""),
  // SPECIFIC
  age: z
    .string()
    .min(1, "Required")
    .regex(/\d/g, "Age must be a number")
    .refine((arg) => parseInt(arg) >= 0, { message: "Age must be positive" })
    .default(""),
  language: z.string().min(2, "Required").default(""),
});

type SubmitAction =
  | FrontendAPI["REQUESTS"]["CREATE"]["LANGUAGE"]["REQ"]
  | FrontendAPI["REQUESTS"]["UPDATE"]["LANGUAGE"]["REQ"];

export const Route: FC = () => {
  const formRef = useRef<HTMLFormElement>(undefined as unknown as HTMLFormElement);

  const { user, employees } = useLoaderData<{
    user: FrontendAPI["USERS"]["RES"];
    employees: FrontendAPI["EMPLOYEES"]["RES"];
  }>();
  const { id: requesterId } = user;
  const [searchParams] = useSearchParams();
  const providedData: ArrayElementOf<FrontendAPI["REQUESTS"]["VIEW"]["CREATED"]["RES"]> | { a: "f" } = JSON.parse(
    searchParams.entries().next().value?.[0] ?? '{"a":"f"}'
  );
  const useProvidedData = !("a" in providedData);
  const submitter = useSubmitter<SubmitAction>();
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });
  // use provided form data, if it exists
  // FIXME: this will probably cause a race condition
  useEffect(() => {
    setTimeout(() => {
      if (useProvidedData) {
        form.setValue(
          "hospitalName",
          providedData.hospital as "Patriot Place" | "Chestnut Hill" | "Faulkner" | "Main Campus"
        );
        if (providedData.location !== null && providedData.location !== undefined) {
          form.setValue("department", providedData.location);
        }
        if (providedData.assignedToId !== null && providedData.assignedToId !== undefined) {
          form.setValue("assignedId", `${providedData.assignedToId}`);
        }
        form.setValue("urgency_level", providedData.urgency_level as "Low" | "Medium" | "High" | "Emergency");
        if (providedData.languageRequest !== null) {
          form.setValue("language", providedData.languageRequest.language);
          form.setValue("age", providedData.languageRequest.age.toString());
        }
      }
    }, 100);
  }, []);
  const hospital = form.watch("hospitalName");

  useEffect(() => {
    const handleSetAssignee = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const names = custom.detail.split(" ");

      let firstName = names[0].trim();
      firstName = `${firstName[0].toUpperCase()}${firstName.substring(1)}`;
      let lastName = names[1].trim();
      lastName = `${lastName[0].toUpperCase()}${lastName.substring(1)}`;

      console.log(`${firstName} ${lastName}`);
      const employee = employees.find((value) => {
        return value.firstName === firstName && value.lastName === lastName;
      });
      if (employee !== undefined) {
        form.setValue("assignedId", "-1");
        form.setValue("assignedId", `${employee.id}`);
      }
    };

    const handleSetHospital = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const val = custom.detail;
      console.log(val);
      switch (val) {
        case "patriots place":
          form.setValue("hospitalName", "Patriot Place");
          break;
        case "patriot place":
          form.setValue("hospitalName", "Patriot Place");
          break;
        case "chestnut hill":
          form.setValue("hospitalName", "Chestnut Hill");
          break;
        case "faulkner":
          form.setValue("hospitalName", "Faulkner");
          break;
        case "main campus":
          form.setValue("hospitalName", "Main Campus");
          break;
      }
    };

    const handleSetDepartment = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const val = custom.detail.toLowerCase();
      const deptList = departments[form.getValues("hospitalName")];

      const match = deptList.find((dept: string) => dept.toLowerCase() === val);

      if (match) {
        form.setValue("department", match);
      } else {
        console.warn("No department matched voice input:", val);
      }
    };

    const handleSetUrgency = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const urgency_levels = ["low", "medium", "high", "emergency"];
      const val = custom.detail;
      if (urgency_levels.includes(val)) {
        form.setValue(
          "urgency_level",
          (val.charAt(0).toUpperCase() + val.slice(1)) as "Low" | "Medium" | "High" | "Emergency"
        );
      }
    };

    const handleSetNote = (e: Event) => {
      const custom = e as CustomEvent<string>;
      form.setValue("note", custom.detail);
    };

    const handleSetLanguage = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const val = custom.detail;
      form.setValue("language", val);
    };

    const handleSetAge = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const val = custom.detail;
      form.setValue("age", val);
    };

    const handleSubmitForm = (e: Event) => {
      formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    };

    window.addEventListener("set_assignee", handleSetAssignee);
    window.addEventListener("set_hospital", handleSetHospital);
    window.addEventListener("set_department", handleSetDepartment);
    window.addEventListener("set_urgency", handleSetUrgency);
    window.addEventListener("set_note", handleSetNote);
    window.addEventListener("set_language", handleSetLanguage);
    window.addEventListener("set_age", handleSetAge);
    window.addEventListener("submit_form", handleSubmitForm);

    return () => {
      window.removeEventListener("set_assignee", handleSetAssignee);
      window.removeEventListener("set_hospital", handleSetHospital);
      window.removeEventListener("set_department", handleSetDepartment);
      window.removeEventListener("set_urgency", handleSetUrgency);
      window.removeEventListener("set_note", handleSetNote);
      window.removeEventListener("submit_form", handleSubmitForm);
      window.removeEventListener("set_age", handleSetAge);
    };
  }, [form]);

  return (
    <div className="p-4 flex justify-center">
      <div className={"panel w-fit p-4"}>
        <h1 className={"panel-title !p-0"}>Language Interpreter Form</h1>
        <hr className={"border-hospital-blue my-2"} />
        <p>Fill out this form to request the assistance of an interpreter.</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              const reqId = useProvidedData ? (providedData.requestedById ?? requesterId) : requesterId;

              if (useProvidedData) {
                submitter({
                  requestId: providedData.id,
                  requesterId: reqId,
                  assignedId: data.assignedId !== "-1" ? parseInt(data.assignedId) : undefined,
                  hospitalName: data.hospitalName,
                  department: data.department,
                  urgency_level: data.urgency_level,
                  note: data.note.length === 0 ? "No notes" : data.note,
                  // SPECIFIC
                  age: parseInt(data.age),
                  language: data.language,
                });
              } else {
                submitter({
                  requesterId: reqId,
                  assignedId: data.assignedId !== "-1" ? parseInt(data.assignedId) : undefined,
                  hospitalName: data.hospitalName,
                  department: data.department,
                  urgency_level: data.urgency_level,
                  note: data.note.length === 0 ? "No notes" : data.note,
                  // SPECIFIC
                  age: parseInt(data.age),
                  language: data.language,
                });
              }
            }, console.error)}
            className={"flex flex-col gap-4 w-[28rem] !mt-4"}
          >
            <FormField
              control={form.control}
              name="hospitalName"
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Hospital Name</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger
                        className={
                          "panel-interactive w-full data-[placeholder]:text-foreground !text-foreground !rounded-xl"
                        }
                      >
                        <SelectValue placeholder="Select a hospital" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={"panel !p-0 !rounded-xl"}>
                      {formSchema.shape.hospitalName._def.schema.options.map((value) => (
                        <Fragment key={`${field.name}$${value}`}>
                          <SelectItem
                            value={value}
                            className={
                              "panel-clear-inline-interactive interaction:!bg-hospital-blue/20 rounded-none px-3 py-3 text-md"
                            }
                          >
                            {value}
                          </SelectItem>
                        </Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Department</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={
                            "panel-interactive justify-between font-normal text-foreground w-full data-[placeholder]:text-foreground/70 !rounded-xl"
                          }
                        >
                          {field.value
                            ? (departments[hospital].find((value: string) => value === field.value) ??
                              "Select department")
                            : "Select department"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className={"panel !p-0 !rounded-xl w-[28rem]"}>
                      <Command className={"bg-transparent"}>
                        <CommandInput placeholder="Search department..." className={"placeholder:text-foreground/75"} />
                        <CommandList>
                          {hospital ? (
                            <>
                              <CommandEmpty className={"p-2 pl-9 text-left"}>No department found.</CommandEmpty>
                            </>
                          ) : (
                            <>
                              <CommandEmpty className={"p-2 pl-9 text-left"}>Please choose a hospital.</CommandEmpty>
                            </>
                          )}
                          {hospital && (
                            <>
                              <CommandGroup className={"p-0"}>
                                {departments[hospital].map((value: string) => (
                                  <CommandItem
                                    value={value}
                                    key={value}
                                    onSelect={() => {
                                      form.setValue("department", value);
                                    }}
                                    className={
                                      "panel-clear-inline-interactive !bg-transparent interaction:!bg-hospital-blue/20 rounded-none px-3 py-3 text-md"
                                    }
                                  >
                                    {value}
                                    <Check
                                      className={cn("ml-auto", value === field.value ? "opacity-100" : "opacity-0")}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedId"
              defaultValue={"-1"}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"opacity-0 font-normal"}>*</div>
                    <span className={"text-foreground"}>Assigned Employee</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={
                            "panel-interactive justify-between font-normal text-foreground w-full data-[placeholder]:text-foreground/70 !rounded-xl"
                          }
                        >
                          {field.value
                            ? (() => {
                                const a = employees.find((value) => `${value.id}` === field.value);
                                return `${a?.firstName ?? ""} ${a?.lastName ?? "Unassigned"}`;
                              })()
                            : "Select employee"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className={"panel !p-0 !rounded-xl w-[28rem]"}>
                      <Command className={"bg-transparent"}>
                        <CommandInput placeholder="Search employee..." className={"placeholder:text-foreground/75"} />
                        <CommandList>
                          <CommandEmpty className={"p-2 pl-9 text-left"}>No employee found.</CommandEmpty>
                          <CommandGroup className={"p-0"}>
                            <CommandItem
                              value={"-1"}
                              key={`employees_-1`}
                              onSelect={() => {
                                form.setValue("assignedId", "-1");
                              }}
                              className={
                                "panel-clear-inline-interactive !bg-transparent interaction:!bg-hospital-blue/20 rounded-none px-3 py-3 text-md"
                              }
                            >
                              Unassigned
                              <Check className={cn("ml-auto", "-1" === field.value ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                            {employees.map((value) => (
                              <CommandItem
                                value={`${value.id}`}
                                key={`employees_${value.id}`}
                                onSelect={() => {
                                  form.setValue("assignedId", `${value.id}`);
                                }}
                                className={
                                  "panel-clear-inline-interactive !bg-transparent interaction:!bg-hospital-blue/20 rounded-none px-3 py-3 text-md"
                                }
                              >
                                {value.firstName} {value.lastName}
                                <Check
                                  className={cn("ml-auto", `${value.id}` === field.value ? "opacity-100" : "opacity-0")}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urgency_level"
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Urgency Level</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger
                        className={
                          "panel-interactive w-full data-[placeholder]:text-foreground !text-foreground !rounded-xl"
                        }
                      >
                        <SelectValue placeholder="Select an urgency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={"panel !p-0 !rounded-xl"}>
                      {formSchema.shape.urgency_level._def.schema.options.map((value) => (
                        <Fragment key={`${field.name}$${value}`}>
                          <SelectItem
                            value={value}
                            className={
                              "panel-clear-inline-interactive interaction:!bg-hospital-blue/20 rounded-none px-3 py-3 text-md"
                            }
                          >
                            {value}
                          </SelectItem>
                        </Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/*

              SPECIFIC FIELDS

            */}

            <FormField
              name="age"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Age of Patient</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={"Enter age"}
                      className={
                        "panel-interactive w-full  placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="language"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"text-red-500 font-normal"}>*</div>
                    <span className={"text-foreground"}>Interpreted Language</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={"Specify language"}
                      className={
                        "panel-interactive w-full  placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/*

              END SPECIFIC FIELDS

            */}

            <FormField
              name="note"
              control={form.control}
              render={({ field }) => (
                <FormItem className={"gap-0"}>
                  <FormLabel className={"pb-2 cursor-pointer gap-1 text-md"}>
                    <div className={"opacity-0 font-normal"}>*</div>
                    <span className={"text-foreground"}>Notes</span>
                    <FormMessage className={"ml-auto font-normal"} />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add notes, if any"
                      className={
                        "panel-interactive w-full placeholder:text-foreground/75 !text-foreground !rounded-xl !ring-0 !cursor-text resize-none"
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type={"submit"} className={"panel-interactive-submit text-[unset] !rounded-xl w-[70%] mx-auto"}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export const action: RouteAction<SubmitAction> = async (data, args, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    if ("requestId" in data && data.requestId !== undefined) {
      await fetch(
        API.REQUESTS.UPDATE.LANGUAGE.ROUTE,
        await addTokenHeaderWithBody(await getAccessTokenSilently(), data)
      )
        .then((res) => {
          if (res.ok) {
            toast.success("Request updated successfully");
          } else {
            toast.error("Request update failed");
            console.error("Service request failed on response:", res, "Content:", res.text());
          }
        })
        .catch((reason) => {
          toast.error("Request update failed");
          console.error("Service request failed at fetch call:", reason);
        });
    } else {
      await fetch(
        API.REQUESTS.CREATE.LANGUAGE.ROUTE,
        await addTokenHeaderWithBody(await getAccessTokenSilently(), data)
      )
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
  } else {
    toast.error("Request submission failed", {
      description: "Please log out and log back in, then try again.",
    });
  }
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, user, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    const user = await fetch(API.USERS.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
    const employees = await fetch(API.EMPLOYEES.ROUTE)
      .then((res) => res.json())
      .catch(() => undefined);
    return {
      user,
      employees,
    };
  }
  const employees = await fetch(API.EMPLOYEES.ROUTE)
    .then((res) => res.json())
    .catch(() => undefined);
  return {
    user: undefined,
    employees,
  };
};
