import React, { useState, useEffect } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, PlusCircle, PackagePlus, History } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api"; // Your API service

// --- TYPE DEFINITIONS ---
interface Book {
  id: number;
  title: string;
  course: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
  };
}

interface StockHistory {
  id: number;
  bookId: number;
  quantity: number;
  addedAt: string;
}

// --- FORM & DIALOG COMPONENTS ---
const BookForm = ({
  book,
  onSave,
  onCancel,
}: {
  book: Partial<Book> | null;
  onSave: (data: Partial<Book>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    course: book?.course || "",
    stock: book?.stock || 0,
  });
  const isEditing = !!book;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.course) {
      toast.error("Title and Course are required.");
      return;
    }
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Book Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="course">Course (e.g., IELTS, PTE)</Label>
        <Input
          id="course"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="stock">Initial Stock</Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          disabled={isEditing}
        />
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            Use the "Restock" action to add more stock.
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Book</Button>
      </DialogFooter>
    </form>
  );
};

const RestockForm = ({
  book,
  onSave,
  onCancel,
}: {
  book: Book;
  onSave: (quantity: number) => void;
  onCancel: () => void;
}) => {
  const [quantity, setQuantity] = useState(1);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      toast.error("Restock quantity must be positive.");
      return;
    }
    onSave(quantity);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="quantity">Quantity to Add</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          min="1"
        />
      </div>
      <p className="text-sm text-slate-600">
        Current stock for <strong>{book.title}</strong> is{" "}
        <strong>{book.stock}</strong>. After restocking, it will be{" "}
        <strong>{book.stock + quantity}</strong>.
      </p>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Stock</Button>
      </DialogFooter>
    </form>
  );
};

// --- MAIN PAGE COMPONENT ---
const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/books");
      setBooks(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const closeAllDialogs = () => {
    setIsFormDialogOpen(false);
    setIsRestockDialogOpen(false);
    setIsHistoryDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedBook(null);
  };

  const handleOpenHistoryDialog = async (book: Book) => {
    setSelectedBook(book);
    setIsHistoryDialogOpen(true);
    setIsHistoryLoading(true);
    try {
      const response = await api.get(`/books/${book.id}/history`);
      setStockHistory(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch stock history.");
      setStockHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSaveBook = async (data: Partial<Book>) => {
    const { stock, ...updateData } = data;
    const apiCall = selectedBook
      ? api.put(`/books/${selectedBook.id}`, updateData)
      : api.post("/books", data);
    toast.promise(apiCall, {
      loading: "Saving book...",
      success: () => {
        fetchBooks();
        closeAllDialogs();
        return `Book has been ${selectedBook ? "updated" : "created"}.`;
      },
      error: (err) => err.response?.data?.message || "Failed to save book.",
    });
  };

  const handleRestockBook = async (quantity: number) => {
    if (!selectedBook) return;
    toast.promise(api.post(`/books/${selectedBook.id}/restock`, { quantity }), {
      loading: "Adding stock...",
      success: () => {
        fetchBooks();
        closeAllDialogs();
        return "Book has been restocked.";
      },
      error: (err) => err.response?.data?.message || "Failed to restock book.",
    });
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    toast.promise(api.delete(`/books/${selectedBook.id}`), {
      loading: "Deleting book...",
      success: () => {
        fetchBooks();
        closeAllDialogs();
        return "Book has been deleted.";
      },
      error: (err) => err.response?.data?.message || "Failed to delete book.",
    });
  };

  return (
    <Layout>
      <Header title="Book Inventory" />
      <div className="p-4 md:p-6">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setSelectedBook(null);
              setIsFormDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Book
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Total Stock</TableHead>
                <TableHead className="text-center">Issued</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No books found.
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.course}</TableCell>
                    <TableCell className="text-center">{book.stock}</TableCell>
                    <TableCell className="text-center">
                      {book._count.students}
                    </TableCell>
                    <TableCell
                      className={`text-center font-semibold ${
                        book.stock - book._count.students > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {book.stock - book._count.students}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenHistoryDialog(book)}
                          >
                            <History className="mr-2 h-4 w-4" /> View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBook(book);
                              setIsRestockDialogOpen(true);
                            }}
                          >
                            <PackagePlus className="mr-2 h-4 w-4" /> Restock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBook(book);
                              setIsFormDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBook(book);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            book={selectedBook}
            onSave={handleSaveBook}
            onCancel={closeAllDialogs}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock: {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <RestockForm
              book={selectedBook}
              onSave={handleRestockBook}
              onCancel={closeAllDialogs}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedBook?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAllDialogs}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Stock History Dialog --- */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stock History: {selectedBook?.title}</DialogTitle>
            <DialogDescription>
              Log of all stock additions for this book.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-80 overflow-y-auto">
            {isHistoryLoading ? (
              <p className="text-center py-4">Loading history...</p>
            ) : stockHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No stock history found.
              </p>
            ) : (
              <ul className="space-y-2">
                {stockHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-md"
                  >
                    <span className="font-semibold text-green-600">
                      +{entry.quantity} units
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.addedAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeAllDialogs}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Dummy components to avoid errors if they don't exist
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
  >
    {children}
  </div>
);
const CardHeader = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className="p-6 pb-0">
    {children}
  </div>
);
const CardTitle = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 {...props} className="text-lg font-semibold">
    {children}
  </h3>
);
const CardDescription = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className="text-sm text-slate-500 dark:text-slate-400 mt-1">
    {children}
  </p>
);
const CardContent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className="p-6">
    {children}
  </div>
);

export default BooksPage;
