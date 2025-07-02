import Image from "next/image";
import { useRouter } from "next/router";
import Error from "@/assets/images/404.svg";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full items-center justify-center h-full gap-2.5">
      <Image src={Error} alt="Not authorized" className="object-contain h-32" />
      <p>You are not authorized.</p>
      <Button
        className="bg-[#9e0105] hover:bg-red-700"
        onClick={() => router.back()}
      >
        Go back
      </Button>
    </div>
  );
}
