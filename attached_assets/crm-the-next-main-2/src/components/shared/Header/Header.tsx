import { Fragment, useState, useCallback } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminMenus, TelecallerMenus } from "@/types/sidebar-menus";
import { HeaderProps, MenuItem } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import Notifications from "./Notifications";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import debounce from "lodash/debounce";
import SearchLeads from "../SearchLeads";

export default function Header({ title }: HeaderProps) {
  const pathName = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get identifier from user role name in lowercase
  const identifier = user?.role?.name?.toLowerCase() || "";

  const navigation: MenuItem[] =
    identifier === "super_admin"
      ? AdminMenus
      : identifier === "telecaller"
      ? TelecallerMenus
      : identifier === "marketing"
      ? TelecallerMenus
      : identifier === "frontdesk"
      ? TelecallerMenus
      : identifier === "counsellor"
      ? TelecallerMenus
      : identifier === "admission"
      ? TelecallerMenus
      : identifier === "department"
      ? TelecallerMenus
      : identifier === "manager"
      ? TelecallerMenus
      : identifier === "visa-lodgment"
      ? TelecallerMenus
      : [];

  const searchLeads = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get("telecaller/leads", {
        params: {
          searchValue: query,
          userId: user.id,
          page: 1,
          pageSize: 5, // Limit to 5 results for the dropdown
        },
      });
      setSearchResults(response.data.data.leads);
    } catch (error) {
      console.error("Error searching leads:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchLeads, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleLeadClick = (leadId: number) => {
    router.push(`/telecaller/leads/edit/${leadId}`);
    setSearchResults([]);
  };

  return (
    <Disclosure as="nav" className="bg-white border-b">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between w-full">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="font-medium">{title}</div>
              {[
                "telecaller",
                "counsellor",
                "marketing",
                "frontdesk",
                "admission",
                "department",
                "manager",
                "visa-lodgment",
                "super_admin",
                "academics",
              ].includes(identifier) && (
                <SearchLeads userId={user.id} role={identifier} />
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Notifications />
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2">
                        <p className="text-sm">
                          <span className="font-semibold">{user.name}</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          <span className="">{user.role.name}</span>
                        </p>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/${identifier}/profile`}
                            className={cn(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={cn(
                              active ? "bg-gray-100" : "",
                              "flex w-full px-4 py-2 text-sm text-gray-700 pointer"
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.title}
                  as="a"
                  href={item.path}
                  className={cn(
                    item.path == pathName
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.path == pathName ? "page" : undefined}
                >
                  {item.title}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
