import api from "@/services/api";
import router, { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import Select from "react-select";

const UploadAndAssignDialog = ({ users }: { users: any[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("/campaigns");
        setCampaigns(response.data.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to fetch campaigns");
      }
    };
    fetchCampaigns();
  }, []);

  const onDrop = useCallback((acceptedFiles: any) => {
    const file = acceptedFiles[0];
    setFile(file);
    setFileName(file.name);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleUserChange = (selected: any) => {
    setSelectedUserId(selected?.value || "");
  };

  const handleCampaignChange = (selected: any) => {
    setSelectedCampaignId(selected?.value || "");
  };

  // Create memoized options to avoid recreating them on every render
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  const campaignOptions = campaigns.map((campaign: any) => ({
    value: campaign.id,
    label: campaign.title,
  }));

  // Create memoized selected values
  const selectedUserOption = userOptions.find(
    (option) => option.value === selectedUserId
  );

  const selectedCampaignOption = campaignOptions.find(
    (option) => option.value === selectedCampaignId
  );

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const data = {
      ...(selectedUserId && { userId: selectedUserId }),
      ...(selectedCampaignId && { campaignId: selectedCampaignId }),
    };

    formData.append("data", JSON.stringify(data));

    try {
      const response = await api.post("/lead-upload", formData);
      toast.success("File uploaded successfully.");
      setIsDialogOpen(false);
      router.reload();
    } catch (error) {
      toast.error("Error uploading file.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        Upload Leads
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload & Assign Leads</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Upload Lead File</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary"
                  }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {fileName ? (
                      <>
                        <p className="font-medium text-primary">{fileName}</p>
                        <p className="text-xs">Click or drag to replace</p>
                      </>
                    ) : (
                      <>
                        <p>Drop your file here or click to browse</p>
                        <p className="text-xs">Supports CSV files</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Assignment Section */}
            <div className="space-y-2">
              <Label>Assign To User (Optional)</Label>
              <Select
                value={selectedUserOption}
                onChange={handleUserChange}
                options={userOptions}
                isSearchable
                isClearable
                placeholder="Select a user to assign leads"
                className="w-full"
              />
            </div>

            {/* Campaign Assignment Section */}
            <div className="space-y-2">
              <Label>Assign To Campaign (Optional)</Label>
              <Select
                value={selectedCampaignOption}
                onChange={handleCampaignChange}
                options={campaignOptions}
                isSearchable
                isClearable
                placeholder="Select a campaign"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload & Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadAndAssignDialog;
