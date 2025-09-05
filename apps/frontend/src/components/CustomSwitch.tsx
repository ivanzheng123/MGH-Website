import { FC } from "react";

type CustomSwitchProps = {
  checked: boolean;
  onChange: (state: boolean) => void;
  thumbImage: string;
  uncheckedColor: string;
  checkedColor: string;
  id: string;
};

export const CustomSwitch: FC<CustomSwitchProps> = ({
  checked,
  onChange,
  thumbImage,
  uncheckedColor,
  checkedColor,
  id,
}: CustomSwitchProps) => {
  return (
    <div className={"inline-block"}>
      <label
        htmlFor={id}
        aria-checked={checked}
        className={`inline-block w-12 h-6 rounded-full items-center transition-colors relative ${checked ? checkedColor : uncheckedColor} cursor-pointer`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={"sr-only"}
        />

        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transform transition-transform overflow-hidden ${checked ? "translate-x-6" : "translate-x-0"}`}
        >
          <img src={thumbImage} alt={"Switch Image"} className={"w-full h-full object-cover"} />
        </span>
      </label>
    </div>
  );
};
