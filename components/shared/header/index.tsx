import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import ModeToggle from "./mode-toggle";

const Hearder = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-2xl ml-3">{APP_NAME}</span>
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
};

export default Hearder;
