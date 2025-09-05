import { FC } from "react";
import { Link } from "react-router";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";

const deps = [
  "eslint",
  "prettier",
  "zod",
  "@auth0/auth0-react",
  "@hookform/resolvers",
  "@radix-ui/react-accordion",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tooltip",
  "@react-three/drei",
  "@react-three/fiber",
  "@tailwindcss/vite",
  "@tanstack/react-table",
  "@types/three",
  "@vis.gl/react-google-maps",
  "axios",
  "class-variance-authority",
  "clsx",
  "cmdk",
  "common",
  "date-fns",
  "deepmerge-ts",
  "dotenv",
  "dotenv-cli",
  "embla-carousel-react",
  "localforage",
  "lucide-react",
  "match-sorter",
  "motion",
  "next-themes",
  "react",
  "react-date-range",
  "react-day-picker",
  "react-dom",
  "react-hook-form",
  "react-router",
  "react-router-bootstrap",
  "recharts",
  "serve",
  "simplebar-react",
  "sonner",
  "tailwind-merge",
  "three",
  "tw-animate-css",
  "vaul",
  "zustand",
  "@types/node",
  "@types/prop-types",
  "@types/react",
  "@types/react-date-range",
  "@types/react-dom",
  "@types/react-router",
  "@types/react-router-bootstrap",
  "@vitejs/plugin-react-swc",
  "@yarnpkg/esbuild-plugin-pnp",
  "eslint-plugin-react-compiler",
  "eslint-plugin-react-hooks",
  "eslint-plugin-react-refresh",
  "tailwindcss",
  "typescript",
  "vite",
  "vite-plugin-eslint",
  "vitest",
  "@datastructures-js/priority-queue",
  "@swc/core",
  "@swc/helpers",
  "cookie-parser",
  "cors",
  "database",
  "express",
  "express-oauth2-jwt-bearer",
  "form-data",
  "glob",
  "http-errors",
  "http-terminator",
  "jose",
  "mailgun.js",
  "morgan",
  "multer",
  "openai",
  "pg",
  "ts-node",
  "ws",
  "zod-validation-error",
  "@types/cookie-parser",
  "@types/cors",
  "@types/express",
  "@types/http-errors",
  "@types/morgan",
  "@types/multer",
  "@types/pg",
  "@types/supertest",
  "@types/ws",
  "nodemon",
  "supertest",
];

export const Route: FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden z-0">
      <div className={"absolute inset-0 -z-10 opacity-30"}></div>
      <Link
        to={"../"}
        className="panel-interactive p-4 px-6 text-xl absolute inset-5 w-fit h-fit flex flex-row items-center"
      >
        <ArrowLeft className={"w-6 h-6 mr-2"} />
        <span>Back</span>
      </Link>
      <div className="flex flex-col items-center justify-start h-full pt-3 z-10">
        <div className="">
          <Accordion
            type="multiple"
            defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]}
            className="flex flex-col items-center font-open-sans text-center text-lg"
          >
            <AccordionItem value="item-1" className="mb-1 mt-5 w-full min-w-4xl max-w-4xl px-4">
              <AccordionTrigger className="panel-interactive px-4 py-2 ![text-decoration:none]">
                Developed with the PERN Stack
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-center transition-all duration-400 overflow-hidden pt-4">
                <div className="w-full grid grid-cols-4 gap-4 panel">
                  <a
                    href="https://www.postgresql.org/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">PostgreSQL</div>
                    <p className="font-bold">Object Relational Database</p>
                    <p>Version 17.4</p>
                    <img
                      src="/images/credit/postSQL.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://expressjs.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-l-none !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">Express</div>
                    <p className="font-bold">Node.js Web Framework</p>
                    <p>Version 22.14.0</p>
                    <img
                      src="/images/credit/express.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://react.dev/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-l-none !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">React</div>
                    <p className="font-bold">Front-End JavaScript Library</p>
                    <p>Version 19.1</p>
                    <img
                      src="/images/credit/react.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue opacity-70 !mb-1"
                    />
                  </a>
                  <a href="https://nodejs.org/en" target="_blank" className="panel-clear-interactive !rounded-l-none">
                    <div className="font-bold flex items-center justify-center">Node.js</div>
                    <p className="font-bold">JavaScript Environment</p>
                    <p>Version 22.14.0</p>
                    <img
                      src="/images/credit/nodeJs.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
            <br />

            <AccordionItem value="item-2" className="mb-1 mt-5 w-full min-w-4xl max-w-4xl px-4">
              <AccordionTrigger className="panel-interactive px-4 py-2 ![text-decoration:none]">
                Developer Tools
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-center transition-all duration-400 overflow-hidden pt-4">
                <div className="w-full grid grid-cols-4 gap-4 panel">
                  <a
                    href="https://www.jetbrains.com/webstorm/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-tr-none !rounded-b-none"
                  >
                    <div className="font-bold flex items-center justify-center">Webstorm</div>
                    <p className="font-bold">IDE</p>
                    <p>Version 2024.3.5</p>
                    <img
                      src="/images/credit/webstorm.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://git-scm.com/downloads"
                    target="_blank"
                    className="panel-clear-interactive !rounded-l-none !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">Git</div>
                    <p className="font-bold">Version Control System</p>
                    <p>Version 2.49.0</p>
                    <img
                      src="/images/credit/git.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-l-none !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">GitHub</div>
                    <p className="font-bold">Collaboration Software</p>
                    <p>Version 3.4.18</p>
                    <img
                      src="/images/credit/github.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://www.docker.com/products/docker-desktop/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-tl-none !rounded-b-none "
                  >
                    <div className="font-bold flex items-center justify-center">Docker</div>
                    <p className="font-bold">Collaboration Software</p>
                    <p>Version 4.39.0</p>
                    <img
                      src="/images/credit/docker.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <div className="col-span-4 flex justify-center">
                    <a
                      href="https://www.usebruno.com/downloads"
                      target="_blank"
                      className="panel-clear-interactive !rounded-t-none w-full"
                    >
                      <div className="font-bold flex items-center justify-center">Bruno</div>
                      <p className="font-bold">API Testing IDE</p>
                      <p>Version 1.39.1</p>
                      <img
                        src="/images/credit/bruno.png"
                        className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                      />
                    </a>
                  </div>
                </div>
              </AccordionContent>
              <br />
            </AccordionItem>
            <AccordionItem value="item-3" className="mb-1 mt-5 w-full min-w-4xl max-w-4xl px-4">
              <AccordionTrigger className="panel-interactive px-4 py-2 ![text-decoration:none]">
                Libraries
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-center transition-all duration-400 overflow-hidden pt-4">
                <div className="w-full grid grid-cols-4 gap-4 panel">
                  <a
                    href="https://ui.shadcn.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-tr-none !rounded-r-none"
                  >
                    <div className="font-bold flex items-center justify-center">ShadCN</div>
                    <p className="font-bold">UI Components</p>
                    <p>Version 2.5.0</p>
                    <img
                      src="/images/credit/shadcn.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://reactrouter.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-t-none !rounded-b-none"
                  >
                    <div className="font-bold flex items-center justify-center">React Router</div>
                    <p className="font-bold">Router Library</p>
                    <p>Version 7.5.3</p>
                    <img
                      src="/images/credit/react-router.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a
                    href="https://auth0.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-t-none !rounded-b-none"
                  >
                    <div className="font-bold flex items-center justify-center">Auth0</div>
                    <p className="font-bold">IDaaS</p>
                    <p>Version 2.17.0</p>
                    <img
                      src="/images/credit/auth0.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                  <a href="https://gravatar.com/" target="_blank" className="panel-clear-interactive !rounded-l-none">
                    <div className="font-bold flex items-center justify-center">Gravatar</div>
                    <p className="font-bold">Global Avatar</p>
                    <p>Version - </p>
                    <img
                      src="/images/credit/gravitar.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
            <br />
            <AccordionItem value="item-4" className="mb-1 mt-5 w-full min-w-4xl max-w-4xl px-4">
              <AccordionTrigger className="panel-interactive px-4 py-2 ![text-decoration:none]">
                Frameworks
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-center transition-all duration-400 overflow-hidden pt-4">
                <div className="w-full flex panel justify-between">
                  <a
                    href="https://tailwindcss.com/"
                    target="_blank"
                    className="panel-clear-interactive !rounded-none grow"
                  >
                    <div className="font-bold flex items-center justify-center">TailwindCSS</div>
                    <p className="font-bold">CSS Framework</p>
                    <p>Version 4.1</p>
                    <img
                      src="/images/credit/tailwinds.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>

                  <a href="https://yarnpkg.com/" target="_blank" className="panel-clear-interactive !rounded-none grow">
                    <div className="font-bold flex items-center justify-center">Yarn</div>
                    <p className="font-bold">Package Manager</p>
                    <p>Version 4.7.0</p>
                    <img
                      src="/images/credit/yarn.png"
                      className="bg-slate-200 w-32 h-32 object-contain mx-auto rounded-lg border-2 border-hospital-darkblue !mb-1"
                    />
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="mb-1 mt-5 w-full min-w-4xl max-w-4xl px-4">
              <AccordionTrigger className="panel-interactive px-4 py-2 ![text-decoration:none]">
                Software Packages
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-center transition-all duration-400 overflow-hidden pt-4 mb-5">
                <div className="w-full panel p-5">
                  {deps.map((dep) => (
                    <>
                      <div className="">
                        <div className="panel-clear-interactive font-bold flex">
                          <a href={`https://npmjs.com/package/${dep}`} target="_blank" className="text-m py-1 w-full">
                            {dep}
                          </a>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};
