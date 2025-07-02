import React from "react";
import Image from "next/image";
import Error from "@/assets/images/404.svg";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
const index = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full items-center justify-center h-full gap-2.5">
      <Image src={Error} alt="404 Not found" className="object-contain h-32" />
      <p>Page Not Found.</p>
      <Button
        className="bg-[#9e0105] hover:bg-red-700"
        onClick={() => router.back()}
      >
        Go back
      </Button>
    </div>
  );
};

export default index;
