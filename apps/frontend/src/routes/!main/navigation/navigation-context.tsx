import React, { createContext, useContext, useState } from "react";

type NavigationContextType = {
  navigationStarted: boolean;
  setNavigationStarted: (started: boolean) => void;
  clearNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigationStarted, setNavigationStarted] = useState(false);

  const clearNavigation = () => {
    setNavigationStarted(false);
  };

  return (
    <NavigationContext.Provider value={{ navigationStarted, setNavigationStarted, clearNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used within a NavigationProvider");
  return context;
};
