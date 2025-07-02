import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
const index = () => {
  const router = useRouter();
  //@ts-ignore
  const { user } = useAuth();
  useEffect(() => {
    console.log("test");
    router.push(`/${user.role.name.toLowerCase()}/dashboard`);
  }, []);
  return (
    <div className="items-center justify-center bg-slate-100 h-screen w-full flex"></div>
  );
};

export default index;
