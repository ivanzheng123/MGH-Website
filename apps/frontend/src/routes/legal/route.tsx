import { FC } from "react";

export const Route: FC = () => {
  return (
    <>
      <div className={"h-full w-full p-5"}>
        <div className={"text-center panel h-full w-full flex items-center flex-col justify-center"}>
          <h1 className={"text-[unset] !p-0 !m-0"}>Privacy Policy</h1>
          <p className={"mt-4 max-w-[800px]"}>
            We do not directly store any personal identifying information. However, our authentication provider Auth0
            may. Refer to their Privacy Policy for more information.
          </p>
          <hr className={"border-hospital-blue w-[90%] my-8"} />
          <h1 className={"text-[unset] !p-0 !m-0"}> Terms of Use </h1>
          <p className={"mt-4 max-w-[800px]"}>
            We may suspend your account and/or prevent you from accessing this internet property at at any time for any
            reason.
          </p>
        </div>
      </div>
    </>
  );
};
