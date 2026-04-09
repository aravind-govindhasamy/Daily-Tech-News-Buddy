import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Settings,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Daily Feed",
    url: "feed",
    icon: LayoutDashboard,
  },
  {
    title: "Generated Posts",
    url: "generated",
    icon: FileText,
  },
  {
    title: "Scheduled Queue",
    url: "scheduled",
    icon: Calendar,
  },
  {
    title: "AI Assistant",
    url: "chat",
    icon: MessageSquare,
  },
];

interface AppSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ currentTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Zap className="w-6 h-6 fill-primary" />
          <span>TechBuddy</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={<div />}
                    isActive={currentTab === item.url}
                    onClick={() => onTabChange(item.url)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
