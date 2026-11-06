import { Bot, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { AssistantPanel } from "@/features/assistant/AssistantPanel";
import { useCart } from "@/features/cart/queries";
import { cn } from "@/lib/cn";

const links = [
  ["Shop", "/products"],
  ["AI machines", "/products?category=ai-laptops"],
  ["Workstations", "/products?category=ai-workstations"],
  ["My orders", "/orders"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const [ai, setAi] = useState(false);
  const [search, setSearch] = useState("");
  const nav = useNavigate();
  const { data: cart } = useCart();
  const count = cart?.items.reduce((n, x) => n + x.quantity, 0) ?? 0;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim())
      nav(`/products?keyword=${encodeURIComponent(search.trim())}`);
  };
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/80 backdrop-blur-2xl">
        <div className="page-shell flex h-18 items-center gap-5">
          <Logo />
          <nav className="ml-5 hidden items-center gap-1 lg:flex">
            {links.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/6 hover:text-white",
                    isActive && "bg-white/8 text-white",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <form
            onSubmit={submit}
            className="ml-auto hidden w-full max-w-xs md:block"
          >
            <label className="glass flex items-center gap-2 rounded-full px-4 py-2.5">
              <Search size={16} className="text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your next machine"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
            </label>
          </form>
          <button
            onClick={() => setAi(true)}
            className="hidden items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-violet-400/20 sm:flex"
          >
            <Bot size={16} /> Ask Nexa AI
          </button>
          <Link
            to="/orders"
            className="hidden rounded-full p-2.5 text-slate-400 hover:bg-white/8 hover:text-white sm:block"
            aria-label="Account"
          >
            <UserRound size={19} />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-full p-2.5 text-slate-300 hover:bg-white/8 hover:text-white"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-electric-300 text-[10px] font-black text-ink-950">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full p-2.5 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="page-shell grid gap-2 border-t border-white/8 py-4 lg:hidden">
            {links.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/7"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <AssistantPanel open={ai} onClose={() => setAi(false)} />
    </>
  );
}
