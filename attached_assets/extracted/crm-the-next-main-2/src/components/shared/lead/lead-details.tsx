import api from "@/services/api";
import React, { useEffect, useState } from "react";
import TypeSelector from "./type-selector";
import FollowupModal from "./followup-modal";
import LeadSocials from "./socials";
import EditLeadModal from "./edit-lead";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ReactCountryFlag from "react-country-flag";
import { Separator } from "@/components/ui/separator";
import AssignUserModal from "./assign-user-modal";
import MainTabs from "./tabs/main-tab";
import ArchiveModal from "./archive-modal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactSelect from "react-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarIcon,
  Edit,
  Trash2,
  BookUp,
  BookMarked,
  PlusCircle,
} from "lucide-react";
import FollowersUserModel from "./followers-user-model";
import { Label } from "@/components/ui/label";
import CounsellorStatusSelector from "./counsellor-status-selector";
import { useAuth } from "@/contexts/AuthContext";

// --- START: BOOK MANAGEMENT COMPONENTS ---

interface StudentBook {
  id: number;
  studentId: number;
  bookId: number;
  status: "RECEIVED" | "RETURNED";
  issuedAt: string;
  returnedAt: string | null;
  book: {
    id: number;
    title: string;
    course: string;
  };
}

const AssignBookDialog = ({
  studentId,
  assignedBookIds,
  onSuccess,
}: {
  studentId: number;
  assignedBookIds: number[];
  onSuccess: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllBooks = async () => {
    try {
      const response = await api.get("/books");
      const availableBooks = response.data.data.filter(
        (book: any) =>
          !assignedBookIds.includes(book.id) &&
          book.stock - (book._count?.students || 0) > 0
      );
      setAllBooks(availableBooks);
    } catch (error) {
      toast.error("Failed to fetch book list.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllBooks();
    }
  }, [isOpen, assignedBookIds]);

  const handleAssign = async () => {
    if (!selectedBook) {
      toast.error("Please select a book to assign.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/books/assign", {
        studentId,
        bookId: parseInt(selectedBook),
      });
      toast.success("Book assigned successfully!");
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign book.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Assign Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a Book</DialogTitle>
          <DialogDescription>
            Select a book from the inventory to issue to this student.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedBook} value={selectedBook}>
            <SelectTrigger>
              <SelectValue placeholder="Select an available book..." />
            </SelectTrigger>
            <SelectContent>
              {allBooks.length > 0 ? (
                allBooks.map((book) => (
                  <SelectItem key={book.id} value={String(book.id)}>
                    {book.title} ({book.course})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="-" disabled>
                  No available books
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || !selectedBook}>
            {isLoading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StudentBookManager = ({
  student,
  onUpdate,
}: {
  student: any;
  onUpdate: () => void;
}) => {
  const { user } = useAuth();
  const [assignedBooks, setAssignedBooks] = useState<StudentBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentBooks = async () => {
    if (!student?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/books/student/${student.id}`);
      setAssignedBooks(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch student's book records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentBooks();
  }, [student?.id]);

  const handleReturnBook = (bookId: number) => {
    toast.promise(api.put("/books/return", { studentId: student.id, bookId }), {
      loading: "Marking book as returned...",
      success: () => {
        onUpdate();
        return "Book marked as returned!";
      },
      error: (err) => err.response?.data?.message || "Failed to return book.",
    });
  };

  if (!student) {
    return null;
  }

  const currentlyReceivedBooksIds = assignedBooks
    .filter((b) => b.status === "RECEIVED")
    .map((b) => b.bookId);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">Book Status:</div>
        {user?.role?.name === "ACADEMICS" && (
          <AssignBookDialog
            studentId={student.id}
            assignedBookIds={currentlyReceivedBooksIds}
            onSuccess={onUpdate}
          />
        )}
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading book status...</p>
      ) : assignedBooks.length === 0 ? (
        <p className="text-sm text-gray-500">
          No books have been assigned to this student.
        </p>
      ) : (
        <ul className="space-y-2">
          {assignedBooks.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md"
            >
              <div className="flex items-center gap-3">
                {item.status === "RECEIVED" ? (
                  <BookUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <BookMarked className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium">{item.book.title}</p>
                  <p className="text-xs text-gray-500">
                    Issued: {formatDate(item.issuedAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EnrollStudentDialog = ({
  lead,
  onSuccess,
}: {
  lead: any;
  onSuccess: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trialDays, setTrialDays] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(
        response.data.data.filter((cls: any) => cls.status === "active")
      );
    } catch (error) {
      toast.error("Failed to fetch classes.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const handleEnrollSubmit = async () => {
    if (!selectedClass || !selectedStatus) {
      toast.error("Please select a class and a status.");
      return;
    }
    if (
      selectedStatus === "TRIAL" &&
      (!trialDays || parseInt(trialDays) <= 0)
    ) {
      toast.error("Please enter a valid number of trial days.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        leadId: lead.id,
        classId: parseInt(selectedClass),
        status: selectedStatus,
        ...(selectedStatus === "TRIAL" && { trialDays: parseInt(trialDays) }),
      };
      await api.post("/students/enroll", payload);
      toast.success(`${lead.first_name} has been enrolled successfully!`);
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to enroll student.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Enroll as Student</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll {lead.first_name}</DialogTitle>
          <DialogDescription>
            Select a class and enrollment status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">
              Class
            </Label>
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={setSelectedStatus} value={selectedStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedStatus === "TRIAL" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trialDays" className="text-right">
                Trial Days
              </Label>
              <Input
                id="trialDays"
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 7"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleEnrollSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Enrolling..." : "Enroll Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- END: HELPER COMPONENTS ---

// --- MAIN COMPONENT ---
const LeadDetails = ({ leadId }: { leadId: any }) => {
  const { user } = useAuth();
  const [lead, setLead] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [unarchiveModalOpen, setUnarchiveModalOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //@ts-ignore
    const selectedValue = event ? event.value : "";
    setSelectedUserId(selectedValue);
  };
  const handlePurposeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPurpose(event.target.value);
  };
  const fetchCountries = async () => {
    // setLoading(true);
    try {
      const response = await api.get("/countries");
      if (!response) throw new Error("Network response was not ok");
      const countryOptions = response.data.data.map((country: any) => ({
        value: country.id,
        label: country.name,
      }));
      setCountries(countryOptions);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };
  const fetchUser = () => {
    api.get("user/get-all").then((response) => {
      setUsers(response.data.data);
    });
  };

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/lead/${leadId}`);
      setLead(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch lead details:", err);
      toast.error("Failed to load lead details.");
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
      fetchUser();
      fetchCountries();
    }
  }, [leadId]);
  const date = new Date();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleVisitSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user and at least one lead.");
      return;
    }
    if (purpose.length < 1) {
      toast.error("Purpose Required!");
      return;
    }
    // Here you would call your API with the selectedUserId and selectedLeadIds
    try {
      const response = await api.post("visit-history", {
        userId: selectedUserId,
        leadId: leadId,
        date: date,
        purpose: purpose,
      });
      toast.success("Lead Assigned Successfully");
      console.log(response); // Handle your response here
      closeDialog(); // Close the dialog on success
    } catch (error) {
      console.error(error); // Handle error case
    }
  };
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const handleRoleChange = (role: any, isChecked: any) => {
    setSelectedRoles((prev: any) =>
      isChecked ? [...prev, role] : prev.filter((r: any) => r !== role)
    );
  };

  const handleRemoveAssignedUser = async (userId: string) => {
    toast.promise(
      api.delete(`/lead/remove-assigned-user`, { data: { userId, leadId } }),
      {
        loading: "Removing user...",
        success: () => {
          fetchLeadDetails();
          return "User removed successfully";
        },
        error: "Failed to remove user",
      }
    );
  };

  const handleRemoveAssignedFollower = async (userId: string) => {
    toast.promise(
      api.delete(`/lead/remove-assigned-follower`, {
        data: { userId, leadId },
      }),
      {
        loading: "Removing follower...",
        success: () => {
          fetchLeadDetails();
          return "Follower removed successfully";
        },
        error: "Failed to remove follower",
      }
    );
  };

  const handleUnarchiveLead = () => {
    if (!lead?.archives?.[0]?.id) return;
    toast.promise(api.delete(`archive/${lead.archives[0].id}`), {
      loading: "Unarchiving lead...",
      success: () => {
        fetchLeadDetails();
        return "Lead unarchived successfully!";
      },
      error: "Failed to unarchive lead",
    });
    setUnarchiveModalOpen(false);
  };

  const getInitialCountrySelections = () => {
    return (
      lead?.interestedCountries
        ?.map((ic: any) => {
          const match = countries.find((c: any) => c.value === ic.countryId);
          return match ? { value: match.value, label: match.label } : null;
        })
        .filter(Boolean) || []
    );
  };

  const initialValues = {
    id: lead?.id,
    first_name: lead?.first_name,
    last_name: lead?.last_name,
    gender: lead?.gender,
    email: lead?.email || "",
    phone_number: lead?.phone_number,
    secondary_number: lead?.secondary_number ?? "",
    course: lead?.interested_course,
    remark: "",
    dob: lead?.dob || "",
    address: lead?.address || "",
    field_of_study: lead?.field_of_study || "",
    slc_institution_name: lead?.slc_institution_name || "",
    slc_grade: lead?.slc_grade || "",
    slc_year: lead?.slc_year || "",
    highschool_institution_name: lead?.highschool_institution_name || "",
    highschool_grade: lead?.highschool_grade || "",
    highschool_year: lead?.highschool_year || "",
    bachelors_institution_name: lead?.bachelors_institution_name || "",
    bachelors_grade: lead?.bachelors_grade || "",
    bachelors_year: lead?.bachelors_year || "",
    masters_institution_name: lead?.masters_institution_name || "",
    masters_grade: lead?.masters_grade || "",
    masters_year: lead?.masters_year || "",
    ielts_overall_score: lead?.ielts_overall_score || "",
    ielts_listening_score: lead?.ielts_listening_score || "",
    ielts_speaking_score: lead?.ielts_speaking_score || "",
    ielts_reading_score: lead?.ielts_reading_score || "",
    ielts_date: lead?.ielts_date || "",
    pte_overall_score: lead?.pte_overall_score || "",
    pte_listening_score: lead?.pte_listening_score || "",
    pte_speaking_score: lead?.pte_speaking_score || "",
    pte_reading_score: lead?.pte_reading_score || "",
    pte_date: lead?.pte_date || "",
    city: lead?.city || "",
    remarks: lead?.remarks || [],
    followUpDates: lead?.followUpDates || [],
    interested_course: lead?.interested_course || "",
    profile_status: lead?.profile_status || "incomplete",
  };

  if (!lead) return <div>Loading...</div>;

  return (
    <div>
      <div className="m-2.5 flex gap-2.5 max-w-full">
        <section
          aria-labelledby="timeline-title"
          className="border rounded max-w-xs w-full mx-auto"
        >
          <div className="bg-white px-6 py-6 shadow-lg rounded-lg">
            <div className="flex flex-col gap-6 items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-600">
                  <span className="text-3xl font-bold text-white">
                    {lead?.first_name?.[0]?.toUpperCase()}
                    {lead?.last_name?.[0]?.toUpperCase()}
                  </span>
                </span>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  lead?.isArchived
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {lead?.isArchived ? "Archived" : "In Progress"}
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                {lead?.first_name}&nbsp;{lead?.last_name}
              </h2>
              <TypeSelector lead={lead} fetchLeadDetails={fetchLeadDetails} />
              <div className="flex gap-2.5">
                {!lead?.isArchived && (
                  <ArchiveModal lead={lead} fetchData={fetchLeadDetails} />
                )}
                <FollowupModal lead={lead} fetchData={fetchLeadDetails} />
              </div>
              <LeadSocials lead={lead} />
              {user?.role?.name === "COUNSELLOR" && (
                <CounsellorStatusSelector
                  lead={lead}
                  fetchLeadDetails={fetchLeadDetails}
                />
              )}
              <div className="flex gap-2.5 w-full items-center justify-center">
                <Button variant="outline" onClick={openDialog}>
                  Add Visit
                </Button>
                {lead?.isArchived && (
                  <Button
                    variant="destructive"
                    onClick={() => setUnarchiveModalOpen(true)}
                  >
                    Unarchive
                  </Button>
                )}
              </div>
              {isDialogOpen && (
                <Dialog open={isDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Visit History</DialogTitle>
                    </DialogHeader>
                    <div className="col-span-2">
                      <Label htmlFor="name">Assign User</Label>
                      <ReactSelect
                        id="assignedUser"
                        // value={selectedUser}
                        //@ts-ignore
                        onChange={handleUserChange}
                        name="assignedUser"
                        options={users.map((user: any) => ({
                          value: user.id,
                          label: user.name,
                        }))}
                        isSearchable
                        placeholder="Select User"
                      />
                    </div>
                    <div>
                      <div>Filter by Roles</div>
                      <div className="grid grid-cols-3">
                        {Array.from(
                          new Set(users.map((user: any) => user.role.name))
                        ).map((role) => (
                          <div key={role}>
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                onChange={(e) =>
                                  handleRoleChange(role, e.target.checked)
                                }
                              />
                              <span className="ml-2">{role}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="name">Purpose</Label>
                      <Input
                        placeholder="purpose"
                        //@ts-ignore
                        onChange={handlePurposeChange}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant={"default"} onClick={handleVisitSubmit}>
                        Assign Leads
                      </Button>
                      <Button variant="outline" onClick={closeDialog}>
                        Close
                      </Button>
                      {/* Add more dialog actions here */}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <AlertDialog
                open={unarchiveModalOpen}
                onOpenChange={setUnarchiveModalOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unarchive Lead</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to unarchive this lead?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnarchiveLead}>
                      Unarchive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <hr className="w-full border-gray-300" />
              <div className="flex flex-col items-start justify-start w-full gap-4">
                <div className="flex w-full items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">
                    Personal Details
                  </div>
                  <EditLeadModal
                    lead={lead}
                    fetchData={fetchLeadDetails}
                    initialValues={initialValues}
                    countries={countries}
                    getInitialCountrySelections={getInitialCountrySelections}
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    Phone Number:
                  </div>
                  <div className="text-gray-600">{lead?.phone_number}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Email:</div>
                  <div className="text-gray-600">{lead?.email || "N/A"}</div>
                </div>

                <Separator />
                <div className="w-full">
                  <div className="font-semibold text-gray-800 mb-2">
                    Academic Status
                  </div>
                  {lead.Student && lead.Student.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Status: </span>
                        <Badge variant={"default"}>STUDENT</Badge>
                      </div>
                    </div>
                  ) : (
                    <>
                      {user?.role?.name === "ACADEMICS" ? (
                        <EnrollStudentDialog
                          lead={lead}
                          onSuccess={fetchLeadDetails}
                        />
                      ) : (
                        <p className="text-sm text-gray-500">
                          Not enrolled as a student.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Separator />
                <StudentBookManager
                  student={
                    lead.Student && lead.Student.length > 0
                      ? lead.Student[0]
                      : null
                  }
                  onUpdate={fetchLeadDetails}
                />
                <Separator />

                <div className="w-full">
                  <div className="font-semibold text-gray-800">
                    Interested Countries:
                  </div>
                  <div className="text-gray-600 grid grid-cols-2 mt-2.5 gap-2">
                    {lead?.interestedCountries?.map((item: any) => (
                      <Badge
                        key={item.countryId}
                        className="bg-slate-100 text-black hover:text-white flex gap-2.5"
                      >
                        <ReactCountryFlag
                          countryCode={item.country.signature}
                          svg
                          style={{ width: "2em", height: "2em" }}
                          title={item.country.name}
                        />
                        {item.country.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-semibold text-gray-800">
                      Assigned Users:
                    </div>
                    {user?.role.name !== "COUNSELLOR" &&
                      user?.role.name !== "ADMISSION" && (
                        <AssignUserModal
                          users={users}
                          leadId={leadId}
                          fetchLeadData={fetchLeadDetails}
                        />
                      )}
                  </div>
                  <div className="flex flex-col gap-2.5 w-full mt-2.5">
                    {lead?.assignedUsers?.map((item: any) => (
                      <div
                        key={item.user.id}
                        className="border rounded p-2.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full bg-slate-100 text-center flex items-center justify-center">
                            {item.user.name[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-left font-medium">
                              {item.user.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {item.user.role.name}
                            </div>
                          </div>
                        </div>
                        {user?.role.name === "SUPER_ADMIN" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-red-500 hover:text-red-700 transition-colors">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove the
                                  assigned user from this lead.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemoveAssignedUser(item.user.id)
                                  }
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-semibold text-gray-800">
                      Followers:
                    </div>
                    {user?.role.name !== "COUNSELLOR" &&
                      user?.role.name !== "ADMISSION" && (
                        <FollowersUserModel
                          users={users}
                          leadId={leadId}
                          fetchLeadData={fetchLeadDetails}
                        />
                      )}
                  </div>
                  <div className="flex flex-col gap-2.5 w-full mt-2.5">
                    {lead?.assignedFollowers?.map((item: any) => (
                      <div
                        key={item.user.id}
                        className="border rounded p-2.5 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-center flex items-center justify-center">
                              {item.user.name[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <div className="text-left font-medium">
                                {item.user.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {item.user.role.name}
                              </div>
                            </div>
                          </div>
                          {user?.role.name === "SUPER_ADMIN" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="text-red-500 hover:text-red-700 transition-colors">
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the assigned
                                    follower from this lead.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveAssignedFollower(item.user.id)
                                    }
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        {item.createdAt && (
                          <div className="flex items-center text-xs text-slate-500">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            <span>
                              Assigned on: {formatDate(item.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <MainTabs
          lead={lead}
          fetchData={fetchLeadDetails}
          initialValues={initialValues}
          countries={countries}
          getInitialCountrySelections={getInitialCountrySelections}
        />
      </div>
    </div>
  );
};
export default LeadDetails;
