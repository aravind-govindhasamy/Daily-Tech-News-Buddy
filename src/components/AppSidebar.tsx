import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Settings,
  Zap,
  TrendingUp,
  ShieldAlert,
  Tag,
  Trophy,
  Landmark,
  Cpu,
  Rocket,
  Code,
  Bot,
  LogIn,
  LogOut,
  Clock,
  Briefcase,
  EyeOff,
  BookOpen,
  Users,
  Tv,
  Navigation,
  Compass,
  Heart,
  Activity,
  MapPin
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
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "./FirebaseProvider";

const items = [
  {
    title: "Daily Feed",
    url: "feed",
    icon: LayoutDashboard,
  },
  {
    title: "Community Social Hub",
    url: "community",
    icon: Users,
  },
  {
    title: "Resource & Feed Hub",
    url: "resources",
    icon: BookOpen,
  },
  {
    title: "Make & Save Money",
    url: "money",
    icon: TrendingUp,
  },
  {
    title: "Corporate & Career",
    url: "corporate",
    icon: Briefcase,
  },
  {
    title: "Cyber Crime",
    url: "cyber",
    icon: ShieldAlert,
  },
  {
    title: "Dark Web & Tor",
    url: "darkweb",
    icon: EyeOff,
  },
  {
    title: "Deals & Giveaways",
    url: "deals",
    icon: Tag,
  },
  {
    title: "Hackathons & Comps",
    url: "competitions",
    icon: Trophy,
  },
  {
    title: "Govt Schemes",
    url: "schemes",
    icon: Landmark,
  },
  {
    title: "IoT & Electronics",
    url: "iot",
    icon: Cpu,
  },
  {
    title: "Startups",
    url: "startup",
    icon: Rocket,
  },
  {
    title: "Open Source",
    url: "opensource",
    icon: Code,
  },
  {
    title: "AI in Enterprise",
    url: "ai_enterprise",
    icon: Bot,
  },
  {
    title: "Generated Posts",
    url: "generated",
    icon: FileText,
  },
  {
    title: "Saved Posts",
    url: "saved",
    icon: FileText,
  },
  {
    title: "Read Later",
    url: "readlater",
    icon: Clock,
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

const communityCircles = [
  {
    title: "1. Marvel Universe",
    url: "community_marvel",
    icon: Tv,
  },
  {
    title: "2. Bike Rides & Riders",
    url: "community_riders",
    icon: Navigation,
  },
  {
    title: "3. Tourism & Travel",
    url: "community_travel",
    icon: Compass,
  },
  {
    title: "4. NGO & Social Impact",
    url: "community_ngo",
    icon: Heart,
  },
  {
    title: "5. Volunteer Opportunities",
    url: "community_volunteering",
    icon: Activity,
  },
  {
    title: "6. Local Communities",
    url: "community_local",
    icon: MapPin,
  },
];

interface AppSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ currentTab, onTabChange }: AppSidebarProps) {
  const { user, loading, signIn, logOut } = useAuth();
  
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
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>Community Interest Circles</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityCircles.map((circle) => (
                <SidebarMenuItem key={circle.title}>
                  <SidebarMenuButton 
                    isActive={currentTab === circle.url}
                    onClick={() => onTabChange(circle.url)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <circle.icon className="w-4 h-4 text-indigo-500/80 dark:text-indigo-400" />
                      <span>{circle.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {loading ? null : user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm px-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="User" /> : <span className="font-bold text-primary">{user.email?.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex-1 truncate truncate text-xs">
                 {user.email}
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={logOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        ) : (
          <Button variant="default" className="w-full justify-start" onClick={signIn}>
            <LogIn className="w-4 h-4 mr-2" /> Sign In with Google
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
