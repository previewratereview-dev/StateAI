/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { createBooking } from "@/app/actions/booking";

const purposes = [
  "AI Strategy & Consulting",
  "Custom AI Automation Solutions",
  "Software Development & DevOps",
  "Job Application / Careers",
  "Partnership / General Inquiry",
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    purpose: purposes[0],
    meeting_date: "",
    meeting_time: "",
    duration: 30,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Get tomorrow's date string in YYYY-MM-DD format as min date
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectTimeSlot = (time: string) => {
    setFormData((prev) => ({ ...prev, meeting_time: time }));
  };

  const selectDuration = (mins: number) => {
    setFormData((prev) => ({ ...prev, duration: mins }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.meeting_date) return "Please select a date.";
    if (!formData.meeting_time) return "Please choose a time slot.";
    return null;
  };

  const nextStep = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  const prevStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createBooking(formData);

    setLoading(false);
    if (result.success) {
      setSuccessData(formData);
      setStep(3);
    } else {
      setError(result.error || "An error occurred while booking.");
    }
  };

  // Step 1 UI: Info and Purpose
  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-silver-bright">Tell us about yourself</h3>
        <p className="text-xs sm:text-sm text-gray-400">Step 1 of 2: Basic details</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="relative">
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Ghulam Mustafa"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground placeholder-gray-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. details@stateai.in"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground placeholder-gray-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Company */}
        <div className="relative">
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Company Name <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="e.g. State AI"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground placeholder-gray-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Purpose */}
        <div className="relative">
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Purpose of Call <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground appearance-none outline-none transition-all"
            >
              {purposes.map((p) => (
                <option key={p} value={p} className="bg-neutral-900 text-foreground">
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400 w-0 h-0" />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={nextStep}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver-bright font-semibold text-sm sm:text-base rounded-lg border border-silver-bright/15 hover:border-silver-bright/30 transition-all duration-300 group"
      >
        Choose Date & Time
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );

  // Step 2 UI: Timing and Message
  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-silver-bright">Pick a convenient slot</h3>
        <p className="text-xs sm:text-sm text-gray-400">Step 2 of 2: Meeting schedule</p>
      </div>

      <div className="space-y-4">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Select Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="meeting_date"
              value={formData.meeting_date}
              min={getMinDate()}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground outline-none transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Meeting Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => selectDuration(mins)}
                className={`py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  formData.duration === mins
                    ? "bg-silver-bright/10 border-silver-bright text-silver-bright"
                    : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] text-gray-400"
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Select Time Slot <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => selectTimeSlot(time)}
                className={`py-2 px-1 rounded-lg border text-[10px] sm:text-xs font-semibold transition-all ${
                  formData.meeting_time === time
                    ? "bg-silver-bright/10 border-silver-bright text-silver-bright shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                    : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] text-gray-400"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-silver/80 uppercase tracking-wider mb-2">
            Additional Notes / Project Summary
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="e.g. Looking to build an automated agent for customer retention..."
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-silver focus:ring-1 focus:ring-silver text-sm text-foreground placeholder-gray-500 transition-all outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-3 glass-card hover:bg-white/[0.05] text-gray-300 font-semibold text-sm rounded-lg border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-silver-bright/10 hover:bg-silver-bright/20 disabled:bg-white/[0.02] disabled:border-white/[0.05] disabled:text-gray-600 text-silver-bright font-semibold text-sm sm:text-base rounded-lg border border-silver-bright/15 hover:border-silver-bright/30 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-silver-bright"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Scheduling...
            </div>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </div>
  );

  // Step 3 UI: Success Confirmation
  const renderStep3 = () => {
    // Format meeting date nicely
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Date(successData?.meeting_date).toLocaleDateString(
      "en-US",
      dateOptions
    );

    return (
      <div className="text-center py-6 space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-silver-bright">Meeting Scheduled!</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            Thanks, {successData?.name}. We have automatically logged your details in our system. An invitation will be sent to your email.
          </p>
        </div>

        <div className="max-w-md mx-auto glass-card p-5 rounded-xl border border-white/[0.05] text-left space-y-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-silver flex-shrink-0" />
            <div>
              <span className="text-gray-500 font-medium">Topic:</span> {successData?.purpose}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-silver flex-shrink-0" />
            <div>
              <span className="text-gray-500 font-medium">Date:</span> {formattedDate}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
            <Clock className="w-4 h-4 text-silver flex-shrink-0" />
            <div>
              <span className="text-gray-500 font-medium">Time:</span> {successData?.meeting_time} (
              {successData?.duration} Mins)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              company: "",
              purpose: purposes[0],
              meeting_date: "",
              meeting_time: "",
              duration: 30,
              notes: "",
            });
            setStep(1);
            setSuccessData(null);
          }}
          className="px-6 py-2.5 glass-card hover:bg-white/[0.05] text-silver-bright text-xs sm:text-sm font-semibold rounded-lg border border-white/[0.08] hover:border-white/[0.15] transition-all"
        >
          Book Another Meeting
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-left">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </form>
  );
}
