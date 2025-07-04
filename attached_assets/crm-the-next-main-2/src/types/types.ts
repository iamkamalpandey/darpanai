import { ReactNode } from "react";

export interface MenuItem {
  title: string;
  path: string;
  src: ReactNode;
  children?: any;
}
export type IdentifierType =
  | "super_admin"
  | "telecaller"
  | "sme"
  | "marketing"
  | "department"
  | "frontdesk"
  | "admission"
  | "manager"
  | "counsellor"
  | "visa-lodgment";
export interface HeaderProps {
  title: string;
}
