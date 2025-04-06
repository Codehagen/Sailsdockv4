"use client";

import Link from "next/link";
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useCommandPalette } from "@/providers/command-palette-provider";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon: Icon;
    isActive?: boolean;
    badge?: number | ReactNode;
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const { toggle } = useCommandPalette();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Hurtigvalg (⌘K)"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              onClick={toggle}
            >
              <IconCirclePlusFilled />
              <span>Hurtigvalg</span>
              <span className="ml-auto hidden md:inline-flex">
                <kbd className="h-5 select-none items-center gap-0.5 rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium text-primary-foreground flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild data-active={item.isActive}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto">
                      {typeof item.badge === "number" && item.badge > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center text-xs"
                        >
                          {item.badge}
                        </Badge>
                      ) : (
                        item.badge
                      )}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
