import { FC } from "react";
import { Outlet } from "react-router"; // (only needed if you actually use <Link>)

// Export Route which uses Replies
export const Route: FC = () => {
  return <Outlet />;
};
