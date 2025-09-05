import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth0 } from "@auth0/auth0-react";
import { API, FrontendAPI } from "common/src/api/endpoints.ts";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InfoHoverCard } from "@/components/InfoHoverCard";
import { ArrowDownWideNarrow } from "lucide-react";
import { addTokenHeader, addTokenHeaderWithBody } from "@/lib/auth.ts";

/* ───────── Helpers ───────── */
const getRelativeTime = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (w < 4) return `${w}w ago`;
  if (mo < 12) return `${mo}mo ago`;
  return `${y}y ago`;
};

/* ───────── Schema & Types ───────── */
const formSchema = z.object({
  title: z.string(),
  content: z.string(),
});
type ForumPost = {
  id: number;
  authorId: number;
  date: string;
  content: string;
  _count: { replies: number };
  title: string;
  writtenBy: {
    firstName: string;
    lastName: string;
  };
};

export default function ForumPage() {
  /* ───────── State ───────── */
  const { id } = useLoaderData<FrontendAPI["USERS"]["RES"]>();
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostReplies" | "fewestReplies">("newest");

  /* ───────── Form ───────── */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const token = await getAccessTokenSilently();
    const ok = await fetch(
      API.FORUM.CREATE.ROUTE,
      await addTokenHeaderWithBody(await getAccessTokenSilently(), {
        ...data,
        employeeId: id,
      })
    ).then((r) => r.ok);
    if (ok) {
      setRefresh(true);
      form.reset();
      setShowForm(false);
    }
  }

  const { getAccessTokenSilently } = useAuth0();
  /* ───────── Fetch Posts ───────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API.FORUM.ROUTE, await addTokenHeader(await getAccessTokenSilently()));
        setPosts(await res.json());
      } catch (e) {
        console.error("fetch forum posts:", e);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [refresh]);

  if (loading) return <div>Loading…</div>;

  /* ───────── Prep data ───────── */
  const formatted = posts.map((p) => ({
    id: p.id,
    title: p.title,
    author: `${p.writtenBy.firstName} ${p.writtenBy.lastName}`,
    date: p.date,
    content: p.content,
    replies: p._count.replies,
  }));
  const sorted = [...formatted].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return +new Date(a.date) - +new Date(b.date);
      case "mostReplies":
        return b.replies - a.replies;
      case "fewestReplies":
        return a.replies - b.replies;
      case "newest":
      default:
        return +new Date(b.date) - +new Date(a.date);
    }
  });

  /* ───────── Render ───────── */
  return (
    <div className="relative container mx-auto py-4 px-2 max-w-5xl">
      {/* Header */}
      <header className="mb-4 flex flex-col items-start text-left gap-1">
        <div className="flex items-center gap-2">
          <h1 className="panel-title">Employee Forum</h1>
          <span className="peer is-visible hidden" />
          <InfoHoverCard
            title="Using the Forum"
            description="Choose a post to join the conversation, or press ‘＋ New Post’ to begin."
            className="h-5 w-5 -translate-y-0.5 cursor-help"
          />
        </div>

        <p className="text-slate-700 dark:text-slate-200 ml-4 mt-0.5 mb-4">
          Join discussions, ask questions, and share your knowledge with the community.
        </p>
        <hr className="bg-hospital-blue w-full h-px" />
      </header>

      {/* ───────── NEW‑POST FORM ───────── */}
      {showForm ? (
        <div className="ml-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className="text-md">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter post title…"
                        className="panel-input !cursor-text w-60 placeholder:text-slate-700 dark:placeholder:text-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className="text-md">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What do you want to talk about?"
                        className="panel-input !cursor-text w-96 h-36 resize-none placeholder:text-slate-700 dark:placeholder:text-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="submit" className="panel-input interaction:!bg-hospital-blue/30 text-[unset] px-4">
                  Submit
                </Button>
                <Button
                  type="button"
                  className="panel-input interaction:!bg-hospital-blue/30 text-[unset] px-4"
                  onClick={() => {
                    form.reset();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <>
          {/* Sort + New‑Post row */}
          <div className="flex items-center mb-4 px-2">
            {/* Sort */}
            <div className="panel-input interaction:!bg-hospital-blue/30 text-[unset] pl-4 pr-8 py-2 !rounded-full flex items-center gap-2 w-fit">
              <ArrowDownWideNarrow className="h-4 w-4 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent appearance-none cursor-pointer focus:outline-none"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="mostReplies">Sort by: Most replies</option>
                <option value="fewestReplies">Sort by: Fewest replies</option>
              </select>
            </div>

            {/* New Post button on right */}
            <button
              className="panel-input interaction:!bg-hospital-blue/30
                         text-[unset] pl-4 pr-4 py-2 !rounded-full ml-auto"
              onClick={() => setShowForm(true)}
            >
              ＋ New Post
            </button>
          </div>

          {/* Posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
            {sorted.map((p) => (
              <Link
                key={p.id}
                to={`./post/${p.id}`}
                className="flex flex-col panel-interactive p-4 rounded-xl text-slate-900 dark:text-white"
              >
                <div className="mb-2 text-xl">{p.title}</div>
                <div className="text-xs mb-2 text-slate-600 dark:text-slate-300">
                  {p.author} • {getRelativeTime(p.date)}
                </div>
                <p className="text-sm mb-2 text-slate-700 dark:text-slate-200 line-clamp-2">{p.content}</p>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  💬 {p.replies} {p.replies === 1 ? "reply" : "replies"}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
