import MenuButton from "@/components/UI/MenuButton";

export function UserNavbar() {
  return (
    <nav className="col-span-3 bg-[#101826]/30 mb-2 rounded-lg p-4">
      {/* Desktop navbar */}
      <div className="max-md:hidden">
        <div>
          <MenuButton />
        </div>
      </div>

      {/* Mobile navbar */}
      <div className="md:hidden">
        <div className="flex items-center justify-end w-full">
          <MenuButton />
        </div>
      </div>
    </nav>
  );
}
