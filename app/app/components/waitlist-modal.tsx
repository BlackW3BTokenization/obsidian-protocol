"use client";

import { useEffect, useState } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WAITLIST_WEBHOOK_URL =
  process.env.NODE_ENV === "production"
    ? "https://oncode.app.n8n.cloud/webhook/40f3a2d0-8390-44c8-a2af-b3add7651a9c"
    : "https://oncode.app.n8n.cloud/webhook-test/40f3a2d0-8390-44c8-a2af-b3add7651a9c";

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(WAITLIST_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "waitlist",
          name: formData.name || undefined,
          email: formData.email,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.status} ${response.statusText}`);
      }

      setSubmitStatus("success");

      setTimeout(() => {
        setFormData({ name: "", email: "" });
        setSubmitStatus("idle");
        setIsSubmitting(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-[100] backdrop-blur-sm transition-opacity"
        style={{ background: "rgba(8,8,8,0.8)" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div
          className="border corner-brackets relative overflow-hidden"
          style={{ background: "var(--void)", borderColor: "var(--gold-border)" }}
        >
          {/* Header */}
          <div
            className="relative px-8 pt-8 pb-6 border-b"
            style={{ borderColor: "var(--carbon)" }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: "var(--gray)", outlineColor: "var(--vault-gold)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <p
              className="font-display uppercase mb-2"
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "var(--gray)",
              }}
            >
              Obsidian Protocol
            </p>
            <h2
              id="waitlist-modal-title"
              className="font-display font-black tracking-[0.05em]"
              style={{
                fontSize: 24,
                color: "var(--gold-light)",
                textShadow: "0 0 30px var(--gold-glow)",
              }}
            >
              JOIN THE WAITLIST
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--parchment)", opacity: 0.7 }}>
              Be first to mint xGOLD against ZK-attested AGX vault reserves.
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="px-8 py-12 text-center">
              <div
                className="w-14 h-14 flex items-center justify-center mx-auto mb-4 border"
                style={{
                  background: "rgba(0,255,136,0.08)",
                  borderColor: "rgba(0,255,136,0.4)",
                }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "var(--mint-green)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3
                className="font-display font-black tracking-[0.05em] mb-2"
                style={{ fontSize: 20, color: "var(--gold-light)" }}
              >
                CONFIRMED
              </h3>
              <p className="text-sm" style={{ color: "var(--parchment)", opacity: 0.75 }}>
                You&apos;re on the list. We&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="font-display block uppercase mb-2"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--gray)",
                  }}
                >
                  Name <span style={{ opacity: 0.6 }}>(Optional)</span>
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--dark2)",
                    borderColor: "var(--carbon)",
                    color: "var(--parchment)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--vault-gold)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--gold-muted)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--carbon)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="waitlist-email"
                  className="font-display block uppercase mb-2"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--gray)",
                  }}
                >
                  Email <span style={{ color: "var(--burn-red)" }}>*</span>
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--dark2)",
                    borderColor: "var(--carbon)",
                    color: "var(--parchment)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--vault-gold)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--gold-muted)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--carbon)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {submitStatus === "error" && errorMessage && (
                <div
                  className="p-3 border"
                  style={{
                    background: "rgba(255,59,59,0.06)",
                    borderColor: "rgba(255,59,59,0.4)",
                  }}
                >
                  <p className="text-sm" style={{ color: "var(--burn-red)" }}>
                    {errorMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="font-display chamfer w-full px-6 py-3 font-black uppercase tracking-[0.2em] transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--vault-gold)",
                  color: "var(--obsidian)",
                  fontSize: 12,
                  boxShadow: "0 0 20px var(--gold-glow)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "var(--gold-light)";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "var(--vault-gold)";
                }}
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          )}

          <div className="px-8 pb-6">
            <p
              className="font-display uppercase text-center"
              style={{
                fontSize: 9,
                letterSpacing: "0.25em",
                color: "var(--gray)",
              }}
            >
              We respect your privacy · Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
