import { store } from "@/app/store";
import { Provider } from "react-redux";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}