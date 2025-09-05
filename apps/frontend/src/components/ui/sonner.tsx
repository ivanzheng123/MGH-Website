import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme={props.theme as ToasterProps["theme"]} className="toaster group" {...props} />;
};

export { Toaster };
