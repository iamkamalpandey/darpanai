import { RxDashboard } from "react-icons/rx";

import { BiSolidInstitution } from "react-icons/bi";
import {
  MdLabelImportantOutline,
  MdOutlineCampaign,
  MdToday,
} from "react-icons/md";

import {
  Archive,
  Building2Icon,
  CheckCircle2Icon,
  Clock1,
  Clock10Icon,
  FilesIcon,
  GraduationCapIcon,
  LibraryBig,
  LibraryIcon,
  Phone,
  Settings,
  StampIcon,
  UserCheckIcon,
  UserCog,
  Users2,
  VerifiedIcon,
} from "lucide-react";

import { TbReportAnalytics } from "react-icons/tb";

import { AiOutlineClockCircle, AiOutlineUserAdd } from "react-icons/ai";
import {
  GiEarthAsiaOceania,
  GiShadowFollower,
  GiTeacher,
  GiTreeBranch,
} from "react-icons/gi";
import { MenuItem } from "./types";
import { HiOutlineUserAdd, HiOutlineUsers, HiUserAdd } from "react-icons/hi";
import { BiTransfer, BiBook } from "react-icons/bi";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  UserCheck,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
export const FrontdeskMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/frontdesk/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Todays Visitors",
    path: "/frontdesk/today-visitors",
    src: <MdToday />,
  },
];
export const SmeMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/sme/dashboard",
    src: <RxDashboard />,
  },

  {
    title: "Leads",
    path: "/sme/leads",
    src: <AiOutlineUserAdd />,
    children: [
      {
        title: "All Leads",
        path: "/sme/leads",
        src: <TbReportAnalytics />,
      },
      {
        title: "Assigned Leads",
        path: "/sme/assigned-leads",
        src: <TbReportAnalytics />,
      },
      {
        title: "UnAssigned Leads",
        path: "/sme/unassigned-leads",
        src: <TbReportAnalytics />,
      },
      {
        title: "Complete Leads",
        path: "/sme/complete-leads",
        src: <TbReportAnalytics />,
      },
    ],
  },

  {
    title: "Institutions",
    path: "/sme/institutions",
    src: <BiSolidInstitution />,
  },
  {
    title: "Countries",
    path: "/sme/countries",
    src: <GiEarthAsiaOceania />,
  },
  {
    title: "Counsellors",
    path: "/sme/counsellors",
    src: <GiTeacher />,
  },

  {
    title: "Telecaller",
    path: "/sme/telecaller",
    src: <Phone />,
  },
];

export const AcademicsMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/academics/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Students",
    path: "/academics/students",
    src: <Users />,
  },
  {
    title: "Classes",
    path: "/academics/classes",
    src: <BookOpen />,
  },
  // {
  //   title: "Attendance",
  //   path: "/academics/attendance",
  //   src: <ClipboardList />,
  //   // children: [
  //   //   {
  //   //     title: "Mark Attendance",
  //   //     path: "/academics/attendance/mark",
  //   //     src: <CheckCircle />,
  //   //   },
  //   // ],
  // },
  {
    title: "Mock Tests",
    path: "/academics/mock-tests",
    src: <FileText />,
    // children: [
    //   {
    //     title: "All Mock Tests",
    //     path: "/academics/mock-tests",
    //     src: <FileText />,
    //   },
    //   {
    //     title: "Schedule Tests",
    //     path: "/academics/mock-tests/schedule",
    //     src: <Calendar />,
    //   },
    //   {
    //     title: "Test Results",
    //     path: "/academics/mock-tests/results",
    //     src: <Award />,
    //   },
    // ],
  },
  {
    title: "Books",
    path: "/academics/books",
    src: <BiBook />,
  },
  // {
  //   title: "PTE Tests",
  //   path: "/academics/pte-tests",
  //   src: <Calendar />,
  // },
  {
    title: "Results",
    path: "/academics/results",
    src: <Award />,
    children: [
      {
        title: "All Results",
        path: "/academics/results",
        src: <Award />,
      },
      {
        title: "Pending Results",
        path: "/academics/results/pending",
        src: <Clock />,
      },
      {
        title: "Completed Results",
        path: "/academics/results/completed",
        src: <CheckCircle />,
      },
    ],
  },
  {
    title: "Staff",
    path: "/academics/staff",
    src: <GiTeacher />,
    children: [
      {
        title: "All Staff",
        path: "/academics/staff",
        src: <GiTeacher />,
      },
      {
        title: "Counselor Assignment",
        path: "/academics/staff/counselor-assignment",
        src: <UserCheck />,
      },
    ],
  },
];
export const AdminMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/super_admin/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Reports",
    path: "/super_admin/reports",
    src: <TbReportAnalytics />,
  },
  {
    title: "Leads",
    path: "/super_admin/leads",
    src: <AiOutlineUserAdd />,
    children: [
      {
        title: "All Leads",
        path: "/super_admin/leads",
        src: <TbReportAnalytics />,
      },
      {
        title: "Assigned Leads",
        path: "/super_admin/assigned-leads",
        src: <TbReportAnalytics />,
      },
    ],
  },

  {
    title: "Institutions",
    path: "/super_admin/institutions",
    src: <BiSolidInstitution />,
  },
  {
    title: "Courses",
    path: "/super_admin/courses",
    src: <GraduationCapIcon />,
  },
  {
    title: "Countries",
    path: "/super_admin/countries",
    src: <GiEarthAsiaOceania />,
  },
  {
    title: "Counsellors",
    path: "/super_admin/counsellors",
    src: <GiTeacher />,
  },
  // {
  //   title: "Documentation",
  //   path: "/super_admin/documentation",
  //   src: <FilesIcon />,
  // },
  // {
  //   title: "Visa Lodgment",
  //   path: "/super_admin/visa-lodgment",
  //   src: <StampIcon />,
  // },

  {
    title: "Telecaller",
    path: "/super_admin/telecaller",
    src: <Phone />,
  },
  {
    title: "Campaigns",
    path: "/super_admin/campaigns",
    src: <MdOutlineCampaign />,
  },
  {
    title: "User Management",
    path: "/super_admin/users",
    src: <UserCog />,
  },
  {
    title: "Branches",
    path: "/super_admin/branches",
    src: <GiTreeBranch />,
  },
  {
    title: "Checklist Template",
    path: "/super_admin/checklist-template",
    src: <CheckCircle2Icon />,
  },
  {
    title: "Settings",
    path: "/super_admin/settings",
    src: <Settings />,
  },
];
export const ManagerMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/manager/dashboard",
    src: <RxDashboard />,
  },

  {
    title: "Leads",
    path: "/manager/leads",
    src: <AiOutlineUserAdd />,
  },
  {
    title: "Counsellors",
    path: "/manager/counsellors",
    src: <GiTeacher />,
  },

  {
    title: "Institutions",
    path: "/manager/institutions",
    src: <BiSolidInstitution />,
  },
  {
    title: "Courses",
    path: "/manager/courses",
    src: <GraduationCapIcon />,
  },
  {
    title: "Countries",
    path: "/manager/countries",
    src: <GiEarthAsiaOceania />,
  },

  {
    title: "Telecallers",
    path: "/manager/telecaller",
    src: <Phone />,
  },
];

export const TelecallerMenus = [
  {
    title: "Dashboard",
    path: "/telecaller/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Assigned Data",
    path: "/telecaller/leads",
    src: <HiOutlineUsers />,
  },
  {
    title: "Follow Up",
    path: "/telecaller/follow-up",
    src: <MdLabelImportantOutline />,
  },
  {
    title: "Completed Data",
    path: "/telecaller/completed-data",
    src: <UserCheckIcon />,
  },
  {
    title: "Add Lead",
    path: "/telecaller/leads/create",
    src: <HiOutlineUserAdd />,
  },
  {
    title: "Archived Data",
    path: "/telecaller/archived-data",
    src: <Archive />,
  },
];
export const CounsellorMenus = [
  {
    title: "Dashboard",
    path: "/counsellor/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Followers",
    path: "/counsellor/followers",
    src: <HiUserAdd />,
  },
  // {
  //   title: "Prospects",
  //   path: "/counsellor/prospects",
  //   src: <HiOutlineUsers />,
  // },

  {
    title: "Leads",
    path: "/counsellor/leads",
    src: <UserCheckIcon />,
  },
  {
    title: "Followup",
    path: "/counsellor/follow-up",
    src: <Clock10Icon />,
  },

  {
    title: "Completed Data",
    path: "/counsellor/completed-data",
    src: <VerifiedIcon />,
  },
  {
    title: "Archived Data",
    path: "/counsellor/archived-data",
    src: <Archive />,
  },
];
export const AdmissionMenus = [
  {
    title: "Dashboard",
    path: "/admission/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Followers",
    path: "/admission/followers",
    src: <HiUserAdd />,
  },
  {
    title: "Students",
    path: "/admission/leads",
    src: <HiOutlineUsers />,
  },

  {
    title: "Followup",
    path: "/admission/follow-up",
    src: <Clock10Icon />,
  },
  {
    title: "Institutions",
    path: "/admission/institutions",
    src: <LibraryBig />,
  },
  {
    title: "Completed Data",
    path: "/admission/completed-data",
    src: <VerifiedIcon />,
  },
  {
    title: "Archived Data",
    path: "/admission/archived-data",
    src: <Archive />,
  },
];
export const SMEMenus = [
  {
    title: "Dashboard",
    path: "/sme/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Assign Counsellor",
    path: "/sme/leads",
    src: <HiOutlineUsers />,
  },

  {
    title: "Counsellors",
    path: "/sme/counsellors",
    src: <UserCheckIcon />,
  },
  {
    title: "Institutions",
    path: "/sme/institutions",
    src: <Archive />,
  },
];
export const VisaLodgmentMenus = [
  {
    title: "Dashboard",
    path: "/visa_lodgment/dashboard",
    src: <RxDashboard />,
  },
  {
    title: "Assign Counsellor",
    path: "/visa_lodgment/leads",
    src: <HiOutlineUsers />,
  },

  {
    title: "Counsellors",
    path: "/visa_lodgment/counsellors",
    src: <UserCheckIcon />,
  },
  {
    title: "Institutions",
    path: "/visa_lodgment/institutions",
    src: <Archive />,
  },
];
