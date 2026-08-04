export default function Footer() {
  return (
    <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm bg-[#0A0E1A] text-[#E0F0E8] ">
      &copy; {new Date().getFullYear()} Prompt-Alchemy. All rights reserved.
    </footer>
  );
}
