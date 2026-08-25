"use client";

import { Menu, X } from "lucide-react";

import { useFamilyShellController } from "@/hooks/family/useFamilyShellController";

import { FamilyBrand } from "./FamilyBrand";
import { FamilyLoadingScreen } from "./FamilyLoadingScreen";
import { FamilySidebar } from "./FamilySidebar";

type Props = {
  children: React.ReactNode;
};

export default function FamilyAppShell({ children }: Props) {
  const shell = useFamilyShellController();

  if (shell.loading) return <FamilyLoadingScreen />;
  if (!shell.familyUser) return null;

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#34423b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] overflow-hidden border-r border-white/20 bg-[#5f735f] lg:flex lg:flex-col">
        <FamilySidebar
          pathname={shell.pathname}
          serviceUserName={shell.serviceUserName}
          relationship={shell.familyUser.relationship}
          onLogout={() => void shell.logout()}
          loggingOut={shell.loggingOut}
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#d9d1c2]/70 bg-[#f8f5ee]/90 px-4 backdrop-blur-xl lg:hidden">
        <FamilyBrand compact />
        <button
          type="button"
          onClick={shell.openMobileMenu}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8d0c2] bg-white/60 text-[#536454] shadow-sm transition hover:bg-white"
        >
          <Menu size={20} />
        </button>
      </header>

      {shell.mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={shell.closeMobileMenu}
            className="absolute inset-0 bg-[#273229]/40 backdrop-blur-sm"
          />
          <aside className="relative h-full w-[285px] overflow-hidden bg-[#5f735f] shadow-2xl">
            <button
              type="button"
              onClick={shell.closeMobileMenu}
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
            <FamilySidebar
              pathname={shell.pathname}
              serviceUserName={shell.serviceUserName}
              relationship={shell.familyUser.relationship}
              onNavigate={shell.closeMobileMenu}
              onLogout={() => void shell.logout()}
              loggingOut={shell.loggingOut}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[270px]">
        <header className="hidden h-[76px] items-center justify-end border-b border-[#ded7ca]/70 bg-[#f8f5ee]/70 px-8 backdrop-blur-xl lg:flex xl:px-12">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#3f4e45]">{shell.familyMemberName}</p>
              <p className="text-xs text-[#83796b]">
                {shell.familyUser.relationship
                  ? `${shell.familyUser.relationship} of ${shell.serviceUserName}`
                  : `Family of ${shell.serviceUserName}`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-sm font-semibold text-[#566856] shadow-sm backdrop-blur-md">
              {shell.familyMemberName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="relative min-h-[calc(100vh-70px)] overflow-hidden lg:min-h-[calc(100vh-76px)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#d9dfcd]/35 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/4 h-[420px] w-[420px] rounded-full bg-[#d6c1a6]/20 blur-3xl" />
          <div className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12 xl:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
