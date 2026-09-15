import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCreateAuction } from "../hooks/useAuction.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import {
  getUploadSignature,
  uploadImageToCloudinary,
  generateAIListingDetails,
} from "../services/auction.service.js";
import toast from "react-hot-toast";

export const CreateAuction = () => {
  useDocumentTitle("Create Auction");
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const uploadedMetaRef = useRef({
    formId: "",
    public_id: "",
    secure_url: "",
  });

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCategory: "",
    startingPrice: "",
    itemStartDate: "",
    itemEndDate: "",
  });

  const [touched, setTouched] = useState({
    itemName: false,
    itemDescription: false,
    itemCategory: false,
    startingPrice: false,
    itemStartDate: false,
    itemEndDate: false,
    photo: false,
  });

  const fieldErrors = {
    itemName:
      !formData.itemName.trim()
        ? "Item title is required"
        : formData.itemName.trim().length < 3
        ? "Title must be at least 3 characters"
        : null,
    itemDescription:
      !formData.itemDescription.trim()
        ? "Item description is required"
        : formData.itemDescription.trim().length < 10
        ? "Description must be at least 10 characters"
        : null,
    itemCategory: !formData.itemCategory ? "Please select a category" : null,
    startingPrice:
      !formData.startingPrice
        ? "Starting price is required"
        : Number(formData.startingPrice) < 1
        ? "Starting price must be at least ₹1"
        : null,
    itemStartDate: !formData.itemStartDate ? "Start date is required" : null,
    itemEndDate:
      !formData.itemEndDate
        ? "End date is required"
        : formData.itemStartDate && new Date(formData.itemEndDate) <= new Date(formData.itemStartDate)
        ? "End date must be after start date"
        : null,
    photo:
      !uploadedMetaRef.current?.secure_url && !previewUrl
        ? "Please upload a photo of the item"
        : null,
  };

  const isFormValid =
    !fieldErrors.itemName &&
    !fieldErrors.itemDescription &&
    !fieldErrors.itemCategory &&
    !fieldErrors.startingPrice &&
    !fieldErrors.itemStartDate &&
    !fieldErrors.itemEndDate &&
    !fieldErrors.photo;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const { mutate, isPending } = useCreateAuction({
    onSuccess: (data) => {
      setFormData({
        itemName: "",
        itemDescription: "",
        itemCategory: "",
        startingPrice: "",
        itemStartDate: "",
        itemEndDate: "",
      });
      setTouched({
        itemName: false,
        itemDescription: false,
        itemCategory: false,
        startingPrice: false,
        itemStartDate: false,
        itemEndDate: false,
        photo: false,
      });

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = "";
      setPreviewUrl("");
      setSelectedFileName("");
      setUploadProgress(0);
      setIsUploading(false);
      uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
      if (fileInputRef.current) fileInputRef.current.value = "";

      setError("");
      navigate(`/auction/${data.newAuction._id}`);
    },
    onError: (err) =>
      setError(err?.response?.data?.message || "Something went wrong"),
  });

  const categories = [
    "Electronics",
    "Antiques",
    "Art",
    "Books",
    "Clothing",
    "Collectibles",
    "Home & Garden",
    "Jewelry",
    "Musical Instruments",
    "Sports",
    "Toys",
    "Vehicles",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleDurationPreset = (days) => {
    const now = new Date();
    const startDateStr = now.toISOString().split("T")[0];
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      itemStartDate: startDateStr,
      itemEndDate: endDateStr,
    }));
    setTouched((prev) => ({
      ...prev,
      itemStartDate: true,
      itemEndDate: true,
    }));
    setError("");
    toast.success(`Set duration to ${days} ${days === 1 ? "day" : "days"}`, {
      icon: "⏱️",
      duration: 2000,
    });
  };

  const clearUploadedImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = "";
    setPreviewUrl("");
    setSelectedFileName("");
    setUploadProgress(0);
    setIsUploading(false);

    uploadedMetaRef.current = {
      formId: "",
      public_id: "",
      secure_url: "",
    };

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (fileSizeMB > 5) {
      setError("File size must be less than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");

    // Instant local preview via ref-backed object URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const localUrl = URL.createObjectURL(file);
    previewUrlRef.current = localUrl;
    setPreviewUrl(localUrl);
    setSelectedFileName(file.name);
    setUploadProgress(10);
    setIsUploading(true);

    try {
      const signatureRes = await getUploadSignature();
      const signatureData = signatureRes?.data;

      if (!signatureData?.formId) {
        throw new Error("Failed to initialize upload session");
      }

      const uploadRes = await uploadImageToCloudinary({
        file,
        signatureData,
        onProgress: (percent) => setUploadProgress(percent),
      });

      const public_id = uploadRes?.public_id;
      const secure_url = uploadRes?.secure_url;

      if (!public_id || !secure_url) {
        throw new Error("Cloud upload failed");
      }

      uploadedMetaRef.current = {
        formId: signatureData.formId,
        public_id,
        secure_url,
      };
      setUploadProgress(100);
      setTouched((prev) => ({ ...prev, photo: true }));
    } catch (err) {
      uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    const uploadMeta = uploadedMetaRef.current;
    if (!uploadMeta?.secure_url) {
      if (isUploading) {
        toast("Please wait until the photo finishes uploading", { icon: "⏳" });
      } else {
        toast.error("Please upload an item photo first");
      }
      return;
    }

    setIsGeneratingAI(true);
    setError("");

    try {
      const res = await generateAIListingDetails({
        imageUrl: uploadMeta.secure_url,
      });

      if (res?.success && res?.data) {
        const { itemName, itemCategory, startingPrice, itemDescription } =
          res.data;
        setFormData((prev) => ({
          ...prev,
          itemName: itemName || prev.itemName,
          itemCategory: itemCategory || prev.itemCategory,
          startingPrice: startingPrice ? String(startingPrice) : prev.startingPrice,
          itemDescription: itemDescription || prev.itemDescription,
        }));
        toast.success("Listing details auto-filled by AI!", {
          icon: "✨",
          duration: 4000,
        });
      }
    } catch (err) {
      const isOverloaded =
        err?.response?.data?.isOverloaded || err?.response?.status === 503;
      const isSafety = err?.response?.data?.isSafety;
      const rawMsg =
        err?.response?.data?.message ||
        err?.message ||
        "";

      const isHighDemand =
        isOverloaded ||
        rawMsg.includes("demand") ||
        rawMsg.includes("503") ||
        rawMsg.includes("capacity") ||
        rawMsg.includes("overload") ||
        rawMsg.includes("unavailable");

      if (isHighDemand) {
        toast(
          "AI service is currently busy. You can continue filling in your listing details manually.",
          {
            icon: "⚡",
            duration: 5000,
          }
        );
      } else if (isSafety || rawMsg.includes("safety") || rawMsg.includes("filter")) {
        toast.error(
          "This image could not be processed by AI filters. Please try another photo or fill in details manually.",
          { duration: 5000 }
        );
      } else {
        const cleanMsg =
          rawMsg.includes("GoogleGenerativeAI") ||
          rawMsg.includes("googleapis.com") ||
          rawMsg.includes("v1beta") ||
          rawMsg.includes("404")
            ? "AI listing generator is temporarily unavailable. Please fill in details manually."
            : rawMsg || "Failed to auto-generate details with AI";
        toast.error(cleanMsg, { duration: 4000 });
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      itemName: true,
      itemDescription: true,
      itemCategory: true,
      startingPrice: true,
      itemStartDate: true,
      itemEndDate: true,
      photo: true,
    });

    const uploadMeta = uploadedMetaRef.current;
    if (!uploadMeta.formId || !uploadMeta.public_id || !uploadMeta.secure_url) {
      setError(
        isUploading
          ? "Image upload is in progress. Please wait."
          : "Please upload an image first."
      );
      return;
    }

    const start = new Date(formData.itemStartDate);
    const end = new Date(formData.itemEndDate);

    if (end <= start) {
      setError("End date must be after start date.");
      return;
    }

    if (!isFormValid) {
      return;
    }

    mutate({
      ...formData,
      formId: uploadMeta.formId,
      public_id: uploadMeta.public_id,
      secure_url: uploadMeta.secure_url,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  const maxStart = new Date();
  maxStart.setDate(maxStart.getDate() + 15);
  const maxStartDate = maxStart.toISOString().split("T")[0];

  let maxEndDate = "";
  if (formData.itemStartDate) {
    const end = new Date(formData.itemStartDate);
    end.setDate(end.getDate() + 15);
    maxEndDate = end.toISOString().split("T")[0];
  }

  const inputClasses =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition";

  const getInputClasses = (fieldName) => {
    const hasErr = touched[fieldName] && fieldErrors[fieldName];
    return `w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${
      hasErr
        ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
        : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
    }`;
  };

  const submitDisabled = isPending || isUploading;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-6 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Auction</h1>
          <p className="text-sm text-gray-400 mt-1">List an item for bidding</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="p-6 sm:p-8">
            {/* AI Assistant Banner */}
            <div className="mb-6 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    AI Auto-Listing Generator
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Gemini Vision
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload an item photo below and let AI automatically generate the title, category, description, and suggested starting price.
                  </p>
                </div>
              </div>

              {previewUrl && (
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI || isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Auto-fill with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Item Name */}
              <div>
                <label
                  htmlFor="itemName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("itemName")}
                  className={getInputClasses("itemName")}
                  placeholder="e.g. Vintage mechanical watch"
                  required
                />
                {touched.itemName && fieldErrors.itemName && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {fieldErrors.itemName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="itemDescription"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("itemDescription")}
                  rows={4}
                  className={`${getInputClasses("itemDescription")} resize-vertical`}
                  placeholder="Describe condition, features, and any relevant details (at least 10 characters)"
                  required
                />
                {touched.itemDescription && fieldErrors.itemDescription && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {fieldErrors.itemDescription}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Category */}
                <div>
                  <label
                    htmlFor="itemCategory"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="itemCategory"
                    name="itemCategory"
                    value={formData.itemCategory}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("itemCategory")}
                    className={getInputClasses("itemCategory")}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {touched.itemCategory && fieldErrors.itemCategory && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {fieldErrors.itemCategory}
                    </p>
                  )}
                </div>

                {/* Starting Price */}
                <div>
                  <label
                    htmlFor="startingPrice"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Starting Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      id="startingPrice"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("startingPrice")}
                      min="1"
                      step="1"
                      className={`${getInputClasses("startingPrice")} pl-9`}
                      placeholder="100"
                      required
                    />
                  </div>
                  {touched.startingPrice && fieldErrors.startingPrice && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {fieldErrors.startingPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quick Duration Presets
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">1-click select</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[1, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleDurationPreset(days)}
                      className="py-2 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition cursor-pointer text-gray-700 shadow-sm text-center active:scale-95"
                    >
                      {days} {days === 1 ? "Day" : "Days"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Start Date */}
                <div>
                  <label
                    htmlFor="itemStartDate"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="itemStartDate"
                    name="itemStartDate"
                    min={today}
                    value={formData.itemStartDate}
                    max={maxStartDate}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("itemStartDate")}
                    className={getInputClasses("itemStartDate")}
                    required
                  />
                  {touched.itemStartDate && fieldErrors.itemStartDate && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {fieldErrors.itemStartDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="itemEndDate"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="itemEndDate"
                    name="itemEndDate"
                    value={formData.itemEndDate}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("itemEndDate")}
                    min={formData.itemStartDate}
                    max={maxEndDate}
                    className={getInputClasses("itemEndDate")}
                    required
                  />
                  {touched.itemEndDate && fieldErrors.itemEndDate && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {fieldErrors.itemEndDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Photo <span className="text-red-500">*</span>
                </label>

                {!previewUrl ? (
                  <label
                    htmlFor="itemPhoto"
                    className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100/60 hover:border-gray-300 transition-colors"
                  >
                    <svg
                      className="w-8 h-8 text-gray-300 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-400">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-300 mt-1">Max 5 MB</p>
                    <input
                      type="file"
                      id="itemPhoto"
                      name="itemPhoto"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start gap-5 p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
                    <div className="relative shrink-0">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />

                      <button
                        type="button"
                        onClick={clearUploadedImage}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                        title="Remove image"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-500 hover:text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 w-full flex flex-col justify-between self-stretch py-1">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 font-medium">
                          <span className="truncate pr-2 max-w-[200px]">
                            {selectedFileName}
                          </span>
                          <span className="tabular-nums font-semibold">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-200 ${
                              uploadProgress === 100
                                ? "bg-emerald-500"
                                : "bg-indigo-500"
                            }`}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5">
                          {isUploading ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                              Uploading to Cloudinary...
                            </>
                          ) : uploadProgress === 100 ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Cloud upload ready
                            </>
                          ) : (
                            "Ready"
                          )}
                        </p>
                      </div>

                      {/* AI Auto-fill Button */}
                      <div className="mt-4 pt-3 border-t border-gray-200/60">
                        <button
                          type="button"
                          onClick={handleAIGenerate}
                          disabled={isGeneratingAI || isUploading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs rounded-xl hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isGeneratingAI ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              <span>Analyzing image with Gemini AI...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">✨</span>
                              <span>Auto-fill details with AI</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-gray-400 text-center mt-1.5">
                          Generates title, category, starting bid & description
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {touched.photo && fieldErrors.photo && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {fieldErrors.photo}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                    submitDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.97] shadow-sm shadow-indigo-200"
                  }`}
                >
                  {isUploading
                    ? "Uploading..."
                    : isPending
                      ? "Creating..."
                      : "Create Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <HelpSection />
      </div>
    </div>
  );
};

export const HelpSection = () => {
  const tips = [
    "Use clear, high-quality photos showing your item from multiple angles",
    "Write detailed descriptions including condition, dimensions, and flaws",
    "Set a reasonable starting price to attract bidders",
    "3-7 day auction duration typically works best",
    "Select the most accurate category to help buyers find your item",
  ];

  return (
    <div className="mt-6 bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-amber-800 mb-3">
        Tips for a successful listing
      </h3>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
            <span className="text-amber-400 mt-0.5">&#10148;</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};
