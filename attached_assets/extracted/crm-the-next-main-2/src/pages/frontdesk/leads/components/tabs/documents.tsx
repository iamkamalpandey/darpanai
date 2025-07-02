import React from "react";
import { generateUploadButton } from "@uploadthing/react";

export const UploadButton = generateUploadButton({
  url: `${process.env.NEXT_PUBLIC_API_URL}uploadthing`,
});
const DocumentsTab = () => {
  return (
    <div>
      {/* <div>Documents</div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      /> */}
    </div>
  );
};

export default DocumentsTab;
