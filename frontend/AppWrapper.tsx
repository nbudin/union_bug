import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { MakeAvatarContextProvider } from "./MakeAvatarContext";

const queryClient = new QueryClient();

export type AppWrapperProps = {
  children: ReactNode;
};

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <BrowserRouter>
      <MakeAvatarContextProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MakeAvatarContextProvider>
    </BrowserRouter>
  );
}
