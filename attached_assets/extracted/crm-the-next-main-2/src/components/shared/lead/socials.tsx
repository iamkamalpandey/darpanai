import React from "react";
import Link from "next/link";
import { MdMailOutline, MdWhatsapp } from "react-icons/md";

const LeadSocials = ({ lead }: { lead: any }) => {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Link
        href={`https://wa.me/${lead?.phone_number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border rounded-full p-2.5 bg-slate-100 inline-flex items-center justify-center"
      >
        <MdWhatsapp />
      </Link>
      <Link
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead?.email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border rounded-full p-2.5 bg-slate-100 inline-flex items-center justify-center"
      >
        <MdMailOutline />
      </Link>
    </div>
  );
};

export default LeadSocials;
