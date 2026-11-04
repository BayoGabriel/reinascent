import { Icon } from "@/components/ui/Icon";
import type { ComplaintThread } from "../types";
import { SolvedToggle } from "./solved-toggle";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

/** One support thread: subject, messages, solved toggle. */
export function ComplaintThreadView({ thread }: { thread: ComplaintThread }) {
  const [first, ...replies] = thread.messages;
  return (
    <article className="border-b border-line py-6 first:pt-0 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <h3 className="flex items-center gap-2.5 text-sm font-semibold text-[#1F253F]">
          <Icon
            name="info"
            className={`size-5 shrink-0 ${
              thread.status === "solved" ? "text-emerald-500" : "text-red-500"
            }`}
          />
          {thread.subject}
        </h3>
        <SolvedToggle
          complaintId={thread.id}
          solved={thread.status === "solved"}
        />
      </div>
      <div className="mt-3 space-y-4 pl-7">
        {first && (
          <div>
            <p className="text-sm leading-relaxed text-cocoa/90">{first.body}</p>
            <p className="mt-2 text-xs text-cocoa/60">
              {formatDate(first.createdAt)}
            </p>
          </div>
        )}
        {replies.map((reply, i) => (
          <div key={i}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1F253F]">
              <Icon name="user" className="size-4" />
              {reply.author === "admin" ? "Admin" : "You"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-cocoa/90">
              {reply.body}
            </p>
            <p className="mt-2 text-xs text-cocoa/60">
              {formatDate(reply.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
