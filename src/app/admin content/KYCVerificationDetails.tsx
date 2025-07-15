"use client";
import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ValidationItem {
  id: string;
  label: string;
  status: "success" | "error" | "pending";
}

const KYCVerificationDetails = () => {
  const route = useRouter();
  const [reason, setReason] = useState("");
  const [frontDocument, setFrontDocument] = useState<File | null>(null);
  const [backDocument, setBackDocument] = useState<File | null>(null);

  const validationItems: ValidationItem[] = [
    { id: "government", label: "Government Issued", status: "success" },
    { id: "original", label: "Original, not photocopied", status: "success" },
    {
      id: "corners",
      label: "Four document corners are visible/cropped",
      status: "success",
    },
    { id: "readable", label: "Readable and in focus/clear", status: "success" },
    { id: "visible", label: "Visible entire image", status: "error" },
    { id: "damage", label: "No tears or damage", status: "error" },
  ];

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === "front") {
        setFrontDocument(file);
      } else {
        setBackDocument(file);
      }
    }
  };

  const getStatusIcon = (status: ValidationItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
        );
    }
  };

  const getStatusColor = (status: ValidationItem["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen  text-white">
      {/* Header */}
      <div className="flex items-center p-4 ">
        <button onClick={route.back} className="cursor-pointer">
          <ArrowLeft className="w-6 h-6 mr-3" />
        </button>
        <h1 className="text-xl font-semibold">KYC Verification Details</h1>
      </div>

      <div className="p-4 space-y-4 border border-[#141E32] rounded-lg max-w-3xl">
        {/* Email */}
        <div className="text-sm text-gray-400">
          Email: <span className="text-white">antoniovkachintov@gmail.com</span>
        </div>

        {/* Front of Document */}
        <div className=" flex justify-between">
          <div className="w-1/2">
            <h2 className="text-lg font-medium">Front of Document</h2>
            <p className="text-sm text-gray-400">
              Please ensure the front of the document is fully <br /> visible,
              showing key details such as your name, <br /> photo, ID number,
              and expiration date. The <br /> information should be legible
              without any obstructions.
            </p>
          </div>

          <div className="w-1/2 space-y-1.5">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              {frontDocument ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-sm text-gray-300">{frontDocument.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    National Identity Management System
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "front")}
              className="hidden"
              id="front-upload"
            />
            <label
              htmlFor="front-upload"
              className="block w-full text-center py-2 px-4 bg-[#439A86] rounded-lg cursor-pointer transition-colors"
            >
              Choose Front Document
            </label>
          </div>
        </div>

        {/* Back of Document */}
        <div className="flex justify-between">
          <div className="w-1/2">
            <h2 className="text-lg font-medium">Back of Document</h2>
            <p className="text-sm text-gray-400">
              Ensure the back of the document is also clearly <br /> visible,
              showing any additional security features, <br /> identification
              numbers, or relevant details. If your <br /> document does not
              have a back, please indicate so.
            </p>
          </div>

          <div className="w-1/2 space-y-1.5">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              {backDocument ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-sm text-gray-300">{backDocument.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Upload back of document
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "back")}
              className="hidden"
              id="back-upload"
            />
            <label
              htmlFor="back-upload"
              className="block w-full text-center py-2 px-4 bg-[#439A86] rounded-lg cursor-pointer transition-colors"
            >
              Choose Back Document
            </label>
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Document Validation</h3>
          <div className="space-y-2">
            {validationItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                {getStatusIcon(item.status)}
                <span className={`text-sm ${getStatusColor(item.status)}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reason for Rejecting/Reporting */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">
            Enter reason for rejecting/reporting verification
          </h3>
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for accepting/rejecting verification."
              className="w-full h-32 p-3 border border-[#141E32] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-xs"
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2  px-2 rounded">
              <span className="text-sm text-gray-400">{reason.length}/500</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-3">
            <button className="w-full py-3 px-4 bg-[#439A86] cursor-pointer rounded-lg font-medium transition-colors">
          Verify
        </button>
        <button className="w-full py-3 px-4 bg-[#F23645] cursor-pointer rounded-lg font-medium transition-colors">
          Reject
        </button>
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationDetails;
