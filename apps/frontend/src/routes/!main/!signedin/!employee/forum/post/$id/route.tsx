/* PostPage.tsx */

import {FC, useEffect, useState} from "react";
import {useLoaderData, useNavigate, useParams} from "react-router";
import {API, FrontendAPI} from "common/src/api/endpoints.ts";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {ArrowLeft} from "lucide-react";
import {useAuth0} from "@auth0/auth0-react";
import {addTokenHeader, addTokenHeaderWithBody} from "@/lib/auth.ts";
import {RouteLoader} from "@/lib/routing.ts";

/* ───────── Types & schema ───────── */
interface Reply {
  id: number;
  content: string;
  date: string;
  postId: number;
  writtenBy: WrittenBy;
}

interface WrittenBy {
  firstName: string;
  lastName: string;
}

interface ForumPost {
  id: number;
  authorId: number;
  title: string;
  content: string;
  date: string;
  replies: Reply[];
  writtenBy: WrittenBy;
}

const formSchema = z.object({ content: z.string() });

export const Route: FC = () => {
  const loaderData = useLoaderData<FrontendAPI["USERS"]["RES"]>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [post, setPost] = useState<ForumPost | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: "" },
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const { getAccessTokenSilently } = useAuth0();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await fetch(
      API.FORUM.REPLIES.CREATE.ROUTE,
      await addTokenHeaderWithBody(await getAccessTokenSilently(), {
        originalid: +id!,
        employeeId: loaderData.id,
        content: data.content,
      })
    )
      .then((res) => res.json())
      .then(console.log);
    setRefresh(true);
  }

  /* fetch post + replies */
  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch(API.FORUM.REPLIES.ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      setPost(await res.json());
      setRefresh(false);
      form.reset();
    })();
  }, [refresh]);

  if (!post) return <div>Loading…</div>;
  const { title, content, date, writtenBy, replies } = post;

  return (
    <div className="container mx-auto">
      {/* Header with Back */}
      <div className="p-8 pb-0 flex items-center justify-between">
        <h1 className="panel-title !p-0 !mb-0">{title}</h1>
        <Button
          onClick={() => navigate(-1)}
          className="panel-input interaction:!bg-hospital-blue/30 text-[unset] flex items-center gap-1 px-4 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Post body */}
      <div className="px-8 mb-4 mt-2">
        <div className="text-sm text-foreground/75">
          Posted by {writtenBy.firstName} {writtenBy.lastName} on {formatDate(date)}
        </div>
        <p className="text-lg mt-4">{content}</p>
      </div>

      {/* matching blue divider */}
      <hr className="border-hospital-blue w-full h-px" />
      {/* Replies section */}
      <div className="pt-6 px-8">
        {/* Reply form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-2xl font-semibold mb-4">
                    <h1 className="text-2xl font-semibold !p-0 !text-[unset]">Comment</h1>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Engage in the discussion"
                      className="w-full resize-none panel-interactive !cursor-text
                         placeholder:text-foreground/75 !rounded-xl !ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons: Cancel (left) + Submit (right) */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="panel-input interaction:!bg-hospital-blue/30 text-[unset] px-4"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit" className="panel-input interaction:!bg-hospital-blue/30 text-[unset] px-4">
                Submit
              </Button>
            </div>
          </form>
        </Form>

        {/* Replies list */}
        <h2 className="text-2xl !font-normal mb-4">Replies</h2>
        {replies.length ? (
          <div className="space-y-4">
            {replies.map((r) => (
              <div key={r.id} className="panel !rounded-xl p-4">
                <p className="text-sm text-foreground/75 mb-1">
                  <span className="font-medium">
                    {r.writtenBy.firstName} {r.writtenBy.lastName}
                  </span>{" "}
                  replied on {formatDate(r.date)}
                </p>
                <p className="text-md">{r.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-foreground/75">No replies yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export const loader: RouteLoader = async ({ request, params }, context) => {
  const { isAuthenticated, getAccessTokenSilently } = context.auth;
  if (isAuthenticated) {
    return await fetch(API.USERS.ROUTE, await addTokenHeader(await getAccessTokenSilently()))
      .then((res) => res.json())
      .catch(() => undefined);
  }
  return undefined;
};
