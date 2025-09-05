import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { MouseEventHandler, ReactNode } from "react";

type InfoProps = {
  title: string;
  description: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function InfoPopover({ title, description, onClick }: InfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={"cursor-help bg-transparent hover:bg-transparent scale-125 hover:scale-150 text-white"}
          onClick={onClick}
        >
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mx-6 shadow-xl">
        <div className="">
          <h2 className="font-medium text-sm mb-1">{title}</h2>
          <hr className={"border-1 border-black mb-1"} />
          <p className={"text-xs"}>{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
