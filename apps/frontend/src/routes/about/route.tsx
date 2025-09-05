import { FC, ReactNode, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card.tsx";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface Teammate {
  name: string;
  role: ReactNode;
  avatar: string;
  quotePrep: string;
  quote: string;
}

const TEAM: Teammate[] = [
  {
    name: "Michael Primavera",
    role: ["Front-End Software Engineer", <br />],
    avatar: "/images/team/mike-softeng.jpeg",
    quotePrep: "Favorite Quote:",
    quote: "\"It's not about what you become, it's who you become.\"-Unknown",
  },
  {
    name: "Meet Team N",
    role: ["The Nutmeg Narwhals", <br />, <br />],
    avatar: "/images/team/nutmeg-narwhals.png",
    quotePrep: "",
    quote: "",
  },

  {
    name: "Thomas Ricci",
    role: ["Senior Lead Engineer", <br />, <br />],
    avatar: "/images/team/thomas-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote: '"Aw shucks." - Neil Watts',
  },
  {
    name: "Cole Bennett",
    role: ["Senior Front-End Lead Engineer", <br />],
    avatar: "/images/team/cole-softeng.png",
    quotePrep: "Favorite Quote:",
    quote: '"It\'s just poop-eh, let it flow" - Jamie Tartt',
  },

  {
    name: "Daniel Zhang",
    role: ["Senior Back-End Lead Engineer", <br />],
    avatar: "/images/team/daniel-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote: '"Bald is best" - Daniel Zhang',
  },
  {
    name: "Ivan Zheng",
    role: ["Full-Stack Engineer", <br />, <br />],
    avatar: "/images/team/ivan-softeng.JPG",
    quotePrep: "Favorite Quote:",
    quote: '"It is what it is" - Unknown',
  },

  {
    name: "Nicholas Calcasola",
    role: ["Assistant Front-End Lead & Project Manager"],
    avatar: "/images/team/nick-softeng.png",
    quotePrep: "Favorite Quote:",
    quote: "“We don’t make mistakes, we have happy accidents” - Bob Ross",
  },
  {
    name: "Josh Bearfield",
    role: ["Senior Full-Stack Engineer & Scrum Master"],
    avatar: "/images/team/josh-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote: '"Life is this crazy, mystical thing, and sometimes you just go out like a buster." - Joseph Marquez',
  },
  {
    name: "Zheren Li",
    role: ["Back-End Engineer & Documentation Analyst"],
    avatar: "/images/team/zheren-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote:
      "“Impossible? We did a lot of impossible things on this journey. I’m tired of hearing that things are impossible or useless. Those words mean nothing to us.” – Jotaro Kujo",
  },
  {
    name: "Jackson Uttecht",
    role: ["Back-End Engineer", <br />, <br />],
    avatar: "/images/team/jackson-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote: '"Play it where it lies" - Spongebob',
  },
  {
    name: "Beruh F. Zelleke",
    role: ["Back-End Software Engineer & ", "Product Owner"],
    avatar: "/images/team/beruh-softeng.jpg",
    quotePrep: "Favorite Quote:",
    quote: '"Life\'s a b**... and then you keep on living" - Bojack Horseman',
  },
];

export const Route: FC = () => {
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isFlippable, makeFlippable] = useState<number | null>(null);

  const handleClick = (idx: number) => {
    if (idx === current && idx !== 1) {
      makeFlippable(isFlippable === idx ? null : idx);
    }
    if (idx === 0 && current == 11) {
      makeFlippable(isFlippable === idx ? null : idx);
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    onSelect();

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="relative min-h-screen overflow-hidden z-0">
      <div className={"absolute inset-0 -z-10 opacity-30"}></div>
      <div className="flex flex-col items-center pt-8 text-center pb-10">
        <h1 className={"text-xl text-[unset] pb-0"}>WPI Computer Science Department</h1>
        <h2 className={"text-5xl pt-4 pb-2 font-semibold"}>CS3733-D25 Software Engineering</h2>
        <h3 className={"text-4xl font-semibold pb-4"}>Professor Wilson Wong</h3>
        <h4>Team Coaches: Andy Truong & Daniel Gorbunov</h4>
      </div>
      <Link
        to={"../"}
        className="panel-interactive p-4 px-6 text-xl absolute inset-5 w-fit h-fit flex flex-row items-center"
      >
        <ArrowLeft className={"w-6 h-6 mr-2"} />
        <span>Back</span>
      </Link>
      <div className="mx-auto max-w-215 transition-all duration-1000 ease-in-out">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setApi}
          className={"mb-1px "}
        >
          <CarouselContent className={"mx-1"}>
            {TEAM.map((member, idx) => {
              const centerIndex = current % TEAM.length; // current  modulo team.length index to ensure it doesnt wrap back improperly (thomas card)
              const isCenter = idx === centerIndex; //compares the idx to the calculated center one if it is it centers using line below
              const className = isCenter
                ? "scale-110 shadow-xl !cursor-pointer group"
                : "scale-90 opacity-80 shadow-lg ";
              const centerImg = isCenter
                ? " transition-all duration-500 group-hover:shadow-2xl shadow-blue-500/80 pointer-events-auto"
                : "";
              const clickImg = isCenter ? "group [perspective:1000px]" : "";
              const flippable = isFlippable === idx;

              return (
                <CarouselItem key={member.name} className={"basis-1/3 px-1"}>
                  <Card
                    className={
                      className +
                      " transition-all duration-700 ease-in-out mt-7 mb-9 bg-slate-500/60 border-2 border-hospital-darkblue"
                    }
                  >
                    <div
                      className={` relative transition-all duration-500 [transform-style:preserve-3d] ${
                        flippable ? "[transform:rotateY(180deg)] " : ""
                      }`}
                      onClick={() => handleClick(idx)}
                    >
                      <CardContent
                        className={
                          "flex flex-col items-center justify-center p-6 min-h-75 space-y-1  [backface-visibility:hidden]"
                        }
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className={centerImg + clickImg + "w-60 rounded-full border-3 border-hospital-darkblue "}
                        />
                        <CardTitle className={"font-bold text-xl"}>{member.name}</CardTitle>
                        <CardDescription
                          className={"dark:text-hospital-skyblue text-hospital-darkblue text-center text-lg "}
                        >
                          {member.role}
                        </CardDescription>
                      </CardContent>
                      <div
                        className="  absolute inset-0 px-5 text-center text-hosptial-darkblue
                          [transform:rotateY(180deg)] [backface-visibility:hidden]"
                      >
                        <div className="  flex h-full flex-col items-center justify-center">
                          <p className="font-bold text-xl">{member.quotePrep}</p>
                          <br />
                          <p className="text-hospital-darkblue text-center text-lg">{member.quote}</p>
                          <br />
                          <button className="panel-interactive scale-100 !rounded-lg !ring-0 px-2 absolute bottom-8">
                            Click to flip back
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className={"panel-interactive scale-200 !rounded-lg !ring-0"} />
          <CarouselNext className={"panel-interactive scale-200 !rounded-lg !ring-0"} />
        </Carousel>
      </div>
      <div className="flex flex-col items-center pt-5 text-center mt-1 mb-5 font-bold text-2xl">
        <p className="dark:text-white font-bold text-xl text-hospital-darkblue">
          We would like to extend our gratitude to:
        </p>
        <p>Brigham and Women’s Hospital and Andrew Shinn </p>
      </div>

      <div className="sticky left-0 right-0 pb-3 pl-3 pt-10">
        <div className="text-slate-300 font-bold text-sm text-center ">
          The Brigham & Women’s Hospital maps and data used in this application are copyrighted
          <br />
          and provided for the sole use of educational purposes.
        </div>
      </div>
    </div>
  );
};
