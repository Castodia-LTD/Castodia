import { Heart, Loader2 } from "lucide-react";

export function FamilyLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#6c806b]/15 bg-[#61745f] shadow-sm">
          <Heart size={21} fill="currentColor" className="text-[#ead8bc]" />
        </div>
        <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-[#5f735f]" />
        <p className="mt-4 text-sm font-medium text-[#566458]">Opening CastodiaFamily...</p>
      </div>
    </div>
  );
}
