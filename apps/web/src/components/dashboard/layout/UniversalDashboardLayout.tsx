import { ReactNode } from "react";
import { GlobalSidebar } from "./GlobalSidebar";
import { TopBar } from "./TopBar";
import { MobileSidebar } from "./MobileSidebar";
import { UniversalSearch } from "../widgets/UniversalSearch";
import { NotificationDrawer } from "../drawers/NotificationDrawer";
import { MessageDrawer } from "../drawers/MessageDrawer";
import { AiAssistantDrawer } from "../drawers/AiAssistantDrawer";
import { DashboardWrapper } from "../DashboardWrapper";
import { useUiStore } from "@/stores/uiStore";

export function UniversalDashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarExpanded } = useUiStore();

  return (
    <DashboardWrapper>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <GlobalSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <UniversalSearch />
        <NotificationDrawer />
        <MessageDrawer />
        <AiAssistantDrawer />
        <MobileSidebar />
      </div>
    </DashboardWrapper>
  );
}
