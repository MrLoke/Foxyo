"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  BiSolidHome,
  BiSolidChat,
  BiSolidBell,
  BiSolidCog,
} from "react-icons/bi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoAddCircle } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { Circle } from "../ui/circle";
import {
  ROOMS_LIST_ROUTE,
  DASHBOARD_ROUTE,
  MESSAGES_ROUTE,
  NOTIFICATIONS_ROUTE,
  SETTINGS_ROUTE,
  USER_ACCOUNT_ROUTE,
} from "@/lib/constants";

export const SidebarMenuSection = () => {
  const buttonClasses =
    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <Link
              href={DASHBOARD_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton tooltip="Dashboard" className={buttonClasses}>
                <Circle>
                  <BiSolidHome className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Dashboard
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={USER_ACCOUNT_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton tooltip="Dashboard" className={buttonClasses}>
                <Circle>
                  <MdAccountCircle className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Account
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={NOTIFICATIONS_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton
                tooltip="Notifications"
                className={buttonClasses}
              >
                <Circle>
                  <BiSolidBell className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Notifications
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={MESSAGES_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton tooltip="Messages" className={buttonClasses}>
                <Circle>
                  <BiSolidChat className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Messages
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={SETTINGS_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton tooltip="Settings" className={buttonClasses}>
                <Circle>
                  <BiSolidCog className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>

      <SidebarGroupLabel className="mt-2 group-data-[collapsible=icon]:hidden">
        Rooms
      </SidebarGroupLabel>
      <SidebarGroupContent className="mt-2 group-data-[collapsible=icon]:mt-8">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem className="mb-2 justify-center font-medium">
            <Link
              href={SETTINGS_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton
                tooltip="Add new room"
                className={buttonClasses}
              >
                <Circle>
                  <IoAddCircle className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  Add new room
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={ROOMS_LIST_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton
                tooltip="#Test Room 1"
                className={buttonClasses}
              >
                <Circle>
                  <HiMiniUserGroup className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  #Test Room 1
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={ROOMS_LIST_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton
                tooltip="#Test Room 2"
                className={buttonClasses}
              >
                <Circle>
                  <HiMiniUserGroup className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  #Test Room 2
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href={ROOMS_LIST_ROUTE}
              className="flex justify-center font-medium"
            >
              <SidebarMenuButton
                tooltip="#Test Room 3"
                className={buttonClasses}
              >
                <Circle>
                  <HiMiniUserGroup className="h-5 w-5" />
                </Circle>
                <span className="group-data-[collapsible=icon]:hidden">
                  #Test Room 3
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
