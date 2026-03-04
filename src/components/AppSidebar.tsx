import { useLocation, useNavigate } from "react-router-dom";
import { Sprout, ChevronRight } from "lucide-react";
import { modules, type MenuItem } from "@/lib/modules";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRef, useState, useCallback } from "react";

function isMenuActive(item: MenuItem, pathname: string): boolean {
  if (item.url) return pathname.startsWith(item.url);
  if (item.children) return item.children.some((c) => isMenuActive(c, pathname));
  return false;
}

function RecursiveMenuItem({ item, pathname, depth = 0 }: { item: MenuItem; pathname: string; depth?: number }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const active = isMenuActive(item, pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  // Leaf node — navigates
  if (item.url) {
    const isExact = pathname.startsWith(item.url);
    return (
      <button
        onClick={() => navigate(item.url!)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          "hover:bg-sidebar-accent/60 text-sidebar-foreground",
          isExact && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{item.title}</span>
      </button>
    );
  }

  // Branch node — opens popup with children on hover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onMouseEnter={handleEnter}
          onMouseLeave={scheduleClose}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-sidebar-accent/60 text-sidebar-foreground",
            active && "text-sidebar-primary font-medium"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left whitespace-nowrap">{item.title}</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={4}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className="w-auto min-w-[13rem] p-1 bg-sidebar/95 backdrop-blur-sm border border-sidebar-border shadow-lg"
      >
        <div className="flex flex-col gap-0.5">
          {item.children!.map((child) => (
            <RecursiveMenuItem key={child.title} item={child} pathname={pathname} depth={depth + 1} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CollapsedPopover({ item, pathname }: { item: MenuItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          onMouseEnter={handleEnter}
          onMouseLeave={scheduleClose}
          className={cn(
            "justify-center",
            isMenuActive(item, pathname) && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={4}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className="w-52 p-1 bg-sidebar/95 backdrop-blur-sm border border-sidebar-border shadow-lg"
      >
        {item.url ? (
          <RecursiveMenuItem item={item} pathname={pathname} />
        ) : item.children ? (
          <div className="flex flex-col gap-0.5">
            <span className="px-3 py-1.5 text-xs font-semibold text-sidebar-foreground/50 uppercase">
              {item.title}
            </span>
            {item.children.map((child) => (
              <RecursiveMenuItem key={child.title} item={child} pathname={pathname} />
            ))}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              AgroERP
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {modules.map((mod) => (
          <SidebarGroup key={mod.title}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
              {!collapsed && mod.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mod.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {collapsed ? (
                      <CollapsedPopover item={item} pathname={location.pathname} />
                    ) : (
                      <RecursiveMenuItem item={item} pathname={location.pathname} />
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
