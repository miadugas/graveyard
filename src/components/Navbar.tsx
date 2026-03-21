import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import logo from "@/assets/grave_goods_logo.png";
import type { AuthUser } from "@/types";

type NavbarRoute = "shop" | "about" | "admin" | "checkout" | "orders" | "order";
type AuthMode = "login" | "register";

interface NavbarProps {
  routeName: NavbarRoute;
  authUser: AuthUser | null | undefined;
  isAdmin: boolean;
  itemCount: number;
  mobileNavOpen: boolean;
  logoutPending: boolean;
  onHomeClick: () => void;
  onOpenCart: () => void;
  onToggleMobileNav: () => void;
  onOpenAuth: (mode: AuthMode) => void;
  onLogout: () => void;
}

interface NavItem {
  name: string;
  href: string;
  route: NavbarRoute | NavbarRoute[];
}

export function Navbar({
  routeName,
  authUser,
  isAdmin,
  itemCount,
  logoutPending,
  onHomeClick,
  onOpenCart,
  onOpenAuth,
  onLogout
}: NavbarProps) {
  const accountLabel = authUser?.fullName?.trim() || authUser?.email || "Guest";
  const accountInitial = accountLabel.charAt(0).toUpperCase();

  const navigation: NavItem[] = [
    { name: "Shop", href: "#/", route: "shop" },
    { name: "About", href: "#/about", route: "about" },
    ...(authUser ? [{ name: "Orders", href: "#/orders", route: ["orders", "order"] as NavbarRoute[] }] : []),
    ...(isAdmin ? [{ name: "Admin", href: "#/admin", route: "admin" as NavbarRoute }] : [])
  ];

  function isCurrent(route: NavbarRoute | NavbarRoute[]): boolean {
    if (Array.isArray(route)) {
      return route.includes(routeName);
    }
    return routeName === route;
  }

  return (
    <Disclosure
      as="header"
      className="sticky top-0 z-50 isolate border-b border-white/10 bg-base-100/80 text-base-content backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-[min(1120px,92vw)] items-center justify-between">
        {/* Left — Logo */}
        <div className="flex items-center">
          <a className="flex items-center gap-3 transition hover:opacity-80" href="#/" onClick={onHomeClick}>
            <img
              alt="Grave Goods logo"
              className="h-9 w-9 rounded-full border border-base-300 object-cover sm:h-10 sm:w-10"
              src={logo}
            />
            <h1 className="font-poster text-lg tracking-[0.06em] text-base-content sm:text-2xl">
              Grave Goods
            </h1>
          </a>
        </div>

        {/* Center — Desktop nav links */}
        <nav className="hidden sm:flex sm:items-center sm:gap-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              aria-current={isCurrent(item.route) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isCurrent(item.route)
                  ? "bg-primary/15 text-primary shadow-[0_0_12px_rgb(var(--gg-accent-rgb)/0.2)]"
                  : "text-base-content/70 hover:bg-white/5 hover:text-primary"
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Right — Cart + Account (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            type="button"
            className="relative rounded-full p-2 text-base-content/70 transition hover:text-base-content focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            onClick={onOpenCart}
          >
            <span className="sr-only">View cart</span>
            <ShoppingCartIcon aria-hidden="true" className="h-6 w-6" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-content">
                {itemCount}
              </span>
            ) : null}
          </button>

          {/* Account dropdown — desktop only */}
          <Menu as="div" className="relative ml-1 hidden sm:block">
            <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="sr-only">Open user menu</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  authUser
                    ? "bg-primary text-primary-content"
                    : "border border-base-300 bg-base-200 text-base-content"
                }`}
              >
                {accountInitial}
              </div>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-primary/20 bg-base-200 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] outline-none ring-1 ring-white/5 transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
            >
              <div className="border-b border-white/10 px-4 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                  {authUser ? "Signed in as" : "Account"}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-base-content">
                  {accountLabel}
                </p>
              </div>
              {authUser ? (
                <>
                  <MenuItem>
                    <a
                      href="#/orders"
                      className="block px-4 py-2 text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                    >
                      Order History
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#/checkout"
                      className="block px-4 py-2 text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                    >
                      Checkout
                    </a>
                  </MenuItem>
                  {isAdmin ? (
                    <MenuItem>
                      <a
                        href="#/admin"
                        className="block px-4 py-2 text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                      >
                        Admin Panel
                      </a>
                    </MenuItem>
                  ) : null}
                  <div className="border-t border-white/10" />
                  <MenuItem>
                    <button
                      type="button"
                      disabled={logoutPending}
                      onClick={onLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary disabled:opacity-50"
                    >
                      {logoutPending ? "Signing out..." : "Sign out"}
                    </button>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem>
                    <button
                      type="button"
                      onClick={() => onOpenAuth("login")}
                      className="block w-full px-4 py-2 text-left text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                    >
                      Sign In
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      onClick={() => onOpenAuth("register")}
                      className="block w-full px-4 py-2 text-left text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                    >
                      Create Account
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#/checkout"
                      className="block px-4 py-2 text-sm text-base-content transition data-[focus]:bg-primary/15 data-[focus]:text-primary"
                    >
                      Checkout
                    </a>
                  </MenuItem>
                </>
              )}
            </MenuItems>
          </Menu>

          {/* Mobile hamburger */}
          <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-base-content/70 transition hover:bg-white/5 hover:text-base-content focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
          </DisclosureButton>
        </div>
      </div>

      {/* Mobile nav panel */}
      <DisclosurePanel className="border-t border-white/10 bg-base-100/95 backdrop-blur sm:hidden">
        <div className="mx-auto grid w-[min(1120px,92vw)] gap-1 px-2 pb-4 pt-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={isCurrent(item.route) ? "page" : undefined}
              className={`block rounded-lg px-4 py-2.5 text-base font-medium transition ${
                isCurrent(item.route)
                  ? "bg-primary/15 text-primary"
                  : "text-base-content/80 hover:bg-white/5 hover:text-base-content"
              }`}
            >
              {item.name}
            </DisclosureButton>
          ))}

          <DisclosureButton
            as="a"
            href="#/checkout"
            className={`block rounded-lg px-4 py-2.5 text-base font-medium transition ${
              routeName === "checkout"
                ? "bg-primary/15 text-primary"
                : "text-base-content/80 hover:bg-white/5 hover:text-base-content"
            }`}
          >
            Checkout
          </DisclosureButton>

          <div className="my-2 border-t border-white/10" />

          {authUser ? (
            <>
              <div className="px-4 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                  Signed in as
                </p>
                <p className="mt-0.5 text-sm font-semibold text-base-content">{accountLabel}</p>
              </div>
              <DisclosureButton
                as="button"
                type="button"
                disabled={logoutPending}
                onClick={onLogout}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-base font-medium text-base-content/80 transition hover:bg-white/5 hover:text-base-content disabled:opacity-50"
              >
                {logoutPending ? "Signing out..." : "Sign out"}
              </DisclosureButton>
            </>
          ) : (
            <>
              <DisclosureButton
                as="button"
                type="button"
                onClick={() => onOpenAuth("login")}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-base font-medium text-base-content/80 transition hover:bg-white/5 hover:text-base-content"
              >
                Sign In
              </DisclosureButton>
              <DisclosureButton
                as="button"
                type="button"
                onClick={() => onOpenAuth("register")}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-base font-medium text-base-content/80 transition hover:bg-white/5 hover:text-base-content"
              >
                Create Account
              </DisclosureButton>
            </>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
