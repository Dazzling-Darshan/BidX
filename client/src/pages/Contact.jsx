import { useState } from "react";
import { FiSend, FiMail, FiClock, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { useSendMessage } from "../hooks/useContact";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export const Contact = () => {
  useDocumentTitle("Contact Us | BidX");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState("");

  const { isPending, mutate } = useSendMessage({
    onSuccess: () => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setTouched({
        name: false,
        email: false,
        subject: false,
        message: false,
      });
      setSubmitted(true);
    },
    onError: (error) => {
      setIsError(error?.response?.data?.message || error?.response?.data?.error || "Failed to send message. Please try again.");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    },
  });

  const quickSubjects = [
    "General Inquiry",
    "Bidding Question",
    "Seller Support",
    "Account / Security",
    "Report an Issue",
  ];

  // Validation logic
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters";
    }

    if (!formData.message.trim()) {
      errors.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      errors.message = `Message must be at least 10 characters (currently ${formData.message.trim().length})`;
    } else if (formData.message.length > 1000) {
      errors.message = "Message cannot exceed 1,000 characters";
    }

    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleQuickSubject = (subj) => {
    setFormData((prev) => ({ ...prev, subject: subj }));
    setTouched((prev) => ({ ...prev, subject: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (!isValid) return;
    mutate(formData);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4 text-indigo-600 shadow-sm">
            <FiMail className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm sm:text-base">
            Have a question, feedback, or need help with a live auction? Reach out and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:border-indigo-200 transition">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl shrink-0 text-indigo-600">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Official Support Email
                  </h3>
                  <p className="text-sm text-indigo-600 font-medium mt-1">
                    support@bidx-auction.com
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Direct inquiries & account assistance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:border-emerald-200 transition">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl shrink-0 text-emerald-600">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Response Window
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    Within 24 Hours
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Monday to Saturday, 9 AM &ndash; 8 PM IST
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:border-amber-200 transition">
              <div className="flex items-start gap-4">
                <div className="bg-amber-50 p-3 rounded-xl shrink-0 text-amber-600">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Headquarters
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    BidX Digital Auctions
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Worldwide digital operations
                  </p>
                </div>
              </div>
            </div>

            {/* Quick tips card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/70 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
                Need Fast Help?
              </h4>
              <p className="text-xs text-indigo-700/80 leading-relaxed">
                If you are reporting an active auction dispute, please include the Auction Title or ID in your message for expedited review.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-7">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-5 text-emerald-600 shadow-sm">
                    <FiCheckCircle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h2>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                    Thank you for reaching out. Your message has been recorded and delivered to the platform administration.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition"
                  >
                    Send Another Message &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Quick Subject Category Selectors */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Topic Suggestion
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickSubjects.map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => handleQuickSubject(subj)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                            formData.subject === subj
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                          touched.name && errors.name
                            ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                            : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                        }`}
                        placeholder="John Doe"
                      />
                      {touched.name && errors.name && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                          touched.email && errors.email
                            ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                            : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                        }`}
                        placeholder="john@example.com"
                      />
                      {touched.email && errors.email && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                        touched.subject && errors.subject
                          ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                      }`}
                      placeholder="e.g. Issue with payment on Auction #402"
                    />
                    {touched.subject && errors.subject && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Field with Character Counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-xs ${
                          formData.message.length > 1000
                            ? "text-red-600 font-bold"
                            : formData.message.length < 10
                            ? "text-gray-400"
                            : "text-emerald-600 font-medium"
                        }`}
                      >
                        {formData.message.length}/1000
                      </span>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={5}
                      maxLength={1000}
                      className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-none text-sm ${
                        touched.message && errors.message
                          ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                      }`}
                      placeholder="Please describe your question or issue in detail (at least 10 characters)..."
                    ></textarea>
                    {touched.message && errors.message && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {isError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {isError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                  >
                    {isPending ? (
                      "Sending Message..."
                    ) : (
                      <>
                        <span>Send Message</span>
                        <FiSend className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
