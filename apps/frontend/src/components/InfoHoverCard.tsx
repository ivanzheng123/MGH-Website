import { Info } from "lucide-react";
import { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type InfoProps = {
  title: string;
  description: ReactNode;
  className?: string;
};

export function InfoHoverCard({ title, description, className }: InfoProps) {
  return (
    <HoverCard closeDelay={150} openDelay={300}>
      <HoverCardTrigger asChild className={className}>
        <button>
          <Info />
        </button>
      </HoverCardTrigger>
      <HoverCardContent sideOffset={15} className="w-75 panel-2 p-0 mr-6">
        <h2 className="font-medium p-3 px-6 pb-2.5 text-md dark:text-black">{title}</h2>
        <hr className={"border-hospital-blue"} />
        <p className={"text-sm p-3 px-6 pb-2.5 text-md dark:text-black"}>{description}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
