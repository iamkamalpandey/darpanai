import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Assuming you have these imports available
import Logo from "@/assets/icons/logo.svg";
import LogoSmall from "@/assets/logos/logo-small.png";
import { MenuItem } from "@/types/types";

const Sidebar = ({
  children,
  menus,
}: {
  children: React.ReactNode;
  menus: MenuItem[];
}) => {
  const [open, setOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();

  const toggleSubMenu = (index: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <div
        className={cn(
          "hidden sm:block relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          open ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-center h-16">
            <Link href="/admin/dashboard">
              {open ? (
                <Image
                  src={Logo}
                  alt="Logo"
                  className="h-28 w-auto object-contain"
                />
              ) : (
                <Image
                  src={LogoSmall}
                  alt="Logo Small"
                  width={32}
                  height={32}
                />
              )}
            </Link>
          </div>
          {/* <Separator /> */}
          {/* Sidebar Body */}
          <div className="flex-grow overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menus.map((menu, index) => {
                const hasChildren = menu.children && menu.children.length > 0;
                return (
                  <React.Fragment key={index}>
                    {hasChildren ? (
                      <div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm font-medium",
                            router.pathname.startsWith(menu.path) &&
                              "bg-gray-100 text-primary"
                          )}
                          onClick={() => toggleSubMenu(`submenu-${index}`)}
                        >
                          <span className="flex items-center">
                            {React.cloneElement(
                              menu.src as React.ReactElement,
                              { className: "h-5 w-5" }
                            )}
                            {open && <span className="ml-3">{menu.title}</span>}
                          </span>
                          {open && (
                            <ChevronRight
                              className={cn(
                                "ml-auto h-4 w-4 transition-transform",
                                openSubmenus[`submenu-${index}`] &&
                                  "transform rotate-90"
                              )}
                            />
                          )}
                        </Button>
                        {openSubmenus[`submenu-${index}`] && open && (
                          <div className="ml-4 mt-1 space-y-1">
                            {menu.children.map(
                              (subMenu: any, subIndex: any) => (
                                <Button
                                  key={subIndex}
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-sm font-medium",
                                    router.pathname === subMenu.path &&
                                      "bg-gray-100 text-primary"
                                  )}
                                  asChild
                                >
                                  <Link href={subMenu.path}>
                                    {subMenu.title}
                                  </Link>
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm font-medium",
                          router.pathname === menu.path &&
                            "bg-gray-100 text-primary"
                        )}
                        asChild
                      >
                        <Link href={menu.path} className="flex items-center">
                          {React.cloneElement(menu.src as React.ReactElement, {
                            className: "h-5 w-5",
                          })}
                          {open && <span className="ml-3">{menu.title}</span>}
                        </Link>
                      </Button>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
          {/* Sidebar Footer */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full overflow-scroll">{children}</div>
    </>
  );
};

export default Sidebar;
