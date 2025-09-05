import React from "react";
import { Link } from "react-router";
import { LucideIcon } from "lucide-react";

type ServiceButtonProps = {
  label: string;
  icon: LucideIcon;
  to: string;
};

const ServiceButton = ({ label, icon: Icon, to }: ServiceButtonProps) => {
  return (
    <Link to={to}>
      <div
        className={
          "bg-hospital-darkblue text-hospital-lightgray p-6 flex-1 flex flex-col items-center justify-center rounded-4xl " +
          "hover:bg-white hover:text-hospital-darkblue hover:border-8 hover:border-hospital-darkblue w-84 h-40"
        }
      >
        <div className="mb-6 text-xl font-semibold">{label}</div>
        <div className={"border-solid border-4 p-2 rounded-xl border-hospital-yellow"}>
          <Icon size={42} />
        </div>
      </div>
    </Link>
  );
};

export default ServiceButton;
