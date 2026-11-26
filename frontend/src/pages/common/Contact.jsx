import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaCrown,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaParking,
  FaWifi,
  FaPlaneArrival,
  FaConciergeBell,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import { flower_Image } from "../../assets";
import { sendContactInquiryApi } from "../../apis/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Room Reservation",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSending(true);
    try {
      await sendContactInquiryApi({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });

      toast.success("Message sent! Our front desk will contact you shortly.");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Room Reservation",
        message: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    {
      icon: FaPhone,
      label: "Front Desk Phone",
      value: "+91 93733 69332",
      sub: "Available 24/7 for reservations & assistance",
      href: "tel:+919373369332",
      bg: "bg-blue-50",
      text: "text-blue-600",
      rotate: "rotate-90",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp Concierge",
      value: "+91 93733 69332",
      sub: "Quick replies for bookings & airport pickup",
      href: "https://wa.me/919373369332",
      external: true,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      rotate: "",
    },
    {
      icon: FaEnvelope,
      label: "Email Reservations",
      value: "athitya@gmail.com",
      sub: "We respond to all inquiries within 24 hours",
      href: "mailto:athitya@gmail.com",
      bg: "bg-amber-50",
      text: "text-amber-700",
      rotate: "",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Property Address",
      value: "Naik Nagar, Chandranagar, Rameshwari, Nagpur - 440027",
      sub: "Maharashtra, India • 15 mins from Nagpur Airport",
      href: "https://maps.google.com/?q=Naik+Nagar,+Chandranagar,+Rameshwari,+Nagpur+440027",
      external: true,
      bg: "bg-purple-50",
      text: "text-purple-600",
      rotate: "",
    },
    {
      icon: FaClock,
      label: "Front Desk Hours",
      value: "Open 24 Hours / 7 Days",
      sub: "Check-In: 2:00 PM | Check-Out: 12:00 PM",
      bg: "bg-orange-50",
      text: "text-orange-600",
      rotate: "",
    },
  ];

  const socialLinks = [
    {
      icon: FaFacebookF,
      label: "Facebook",
      href: "#",
      baseBg: "bg-blue-50",
      baseText: "text-blue-600",
      hoverBg: "hover:bg-blue-600",
    },
    {
      icon: FaInstagram,
      label: "Instagram",
      href: "#",
      baseBg: "bg-pink-50",
      baseText: "text-pink-600",
      hoverBg: "hover:bg-pink-600",
    },
    {
      icon: FaTwitter,
      label: "Twitter",
      href: "#",
      baseBg: "bg-sky-50",
      baseText: "text-sky-600",
      hoverBg: "hover:bg-sky-500",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      href: "https://wa.me/919373369332",
      external: true,
      baseBg: "bg-emerald-50",
      baseText: "text-emerald-600",
      hoverBg: "hover:bg-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <FaCrown className="text-amber-900 text-9xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400" />
              <img
                src={flower_Image}
                alt="Hotel Athitya"
                className="h-12 opacity-90"
              />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <span className="text-amber-700 font-semibold text-xs uppercase tracking-[0.25em] bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 inline-block">
              Contact Hotel Athitya
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mt-4 mb-4 tracking-tight">
              Get in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                Touch
              </span>
            </h1>

            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-light">
              We are here to make your stay in Nagpur effortless. Reach out to
              our front desk for room reservations, airport transfers, or any
              special requests.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-500 border border-amber-100 hover:border-amber-200 overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50/70 to-transparent rounded-full -mt-32 -mr-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tl from-amber-50/40 to-transparent rounded-full -mb-24 -ml-24 pointer-events-none" />

              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-gradient-to-br from-amber-600 to-amber-700 p-3 rounded-2xl mr-4 shadow-lg shadow-amber-600/25">
                    <FaPhone className="text-white text-lg rotate-90" />
                  </span>
                  <span>Contact Information</span>
                  <span className="ml-auto text-amber-400/40">✦</span>
                </h2>

                <div className="space-y-2.5">
                  {contactItems.map((item, index) => {
                    const Wrapper = item.href ? "a" : "div";
                    const wrapperProps = item.href
                      ? {
                          href: item.href,
                          ...(item.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {}),
                        }
                      : {};

                    return (
                      <Wrapper
                        key={index}
                        {...wrapperProps}
                        className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50/90 hover:to-transparent transition-all duration-300 border border-transparent hover:border-amber-200"
                      >
                        <div
                          className={`${item.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shrink-0`}
                        >
                          <item.icon
                            className={`${item.text} text-lg ${item.rotate}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p className="text-gray-800 font-bold text-sm sm:text-base mt-0.5 break-words">
                            {item.value}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {item.sub}
                          </p>
                        </div>
                        {item.href && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                            <FaArrowRight className="text-amber-600 text-xs" />
                          </div>
                        )}
                      </Wrapper>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-gray-700 font-semibold text-sm mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-amber-400" />
                    Connect With Us
                    <span className="w-8 h-0.5 bg-amber-400" />
                  </p>
                  <div className="flex space-x-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        {...(social.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={`group ${social.baseBg} ${social.hoverBg} p-3.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md`}
                        aria-label={social.label}
                      >
                        <social.icon
                          className={`${social.baseText} group-hover:text-white transition-colors text-lg`}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-500 border border-amber-100 hover:border-amber-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full pointer-events-none" />

            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-br from-amber-600 to-amber-700 p-3 rounded-2xl shadow-lg shadow-amber-600/25">
                  <FaEnvelope className="text-white text-lg" />
                </span>
                Send Us a Message
                <span className="ml-auto text-amber-400/40">✦</span>
              </h2>

              {submitted ? (
                <div className="py-12 px-6 text-center bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
                  <FaCheckCircle className="text-emerald-600 text-5xl mx-auto" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to <strong>Hotel Athitya</strong>.
                    Our front desk has received your inquiry via email and will
                    reply shortly. For immediate assistance, call{" "}
                    <a
                      href="tel:+919373369332"
                      className="text-amber-700 font-semibold underline"
                    >
                      +91 93733 69332
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-gray-700 font-semibold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="text-amber-500">●</span>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Rohan Sharma"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-amber-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 font-semibold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500">●</span>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-amber-300"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-semibold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500">●</span>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-amber-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="text-amber-500">●</span>
                      Inquiry Type
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-amber-300"
                    >
                      <option value="Room Reservation">Room Reservation</option>
                      <option value="Airport Pickup & Transfers">
                        Airport Pickup &amp; Transfers
                      </option>
                      <option value="Corporate & Group Stays">
                        Corporate &amp; Group Stays
                      </option>
                      <option value="Events & Celebrations">
                        Events &amp; Celebrations
                      </option>
                      <option value="Feedback & General Inquiry">
                        Feedback &amp; General Inquiry
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="text-amber-500">●</span>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share your check-in dates, room preferences, or questions..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:border-amber-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="group w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl shadow-amber-600/20 flex items-center justify-center space-x-3 text-sm cursor-pointer disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <BiLoaderAlt className="animate-spin text-lg" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="text-white" />
                        <span>Send Message</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center pt-1">
                    <FaCheck className="inline mr-1 text-amber-500" />
                    Front desk responds within 24 hours
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 relative">
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-100">
            <div className="py-12 px-6 bg-gradient-to-br from-amber-100/60 via-amber-50/80 to-white flex items-center justify-center relative">
              <div className="text-center relative max-w-xl">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/25">
                  <FaMapMarkerAlt className="text-white text-2xl" />
                </div>
                <h3 className="text-gray-800 font-bold text-xl">
                  Hotel Athitya, Nagpur
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Naik Nagar, Chandranagar, Rameshwari, Nagpur - 440027,
                  Maharashtra
                </p>
                <p className="text-xs text-amber-700 font-medium mt-1">
                  15 mins from Dr. Babasaheb Ambedkar International Airport • 12
                  mins from Nagpur Junction
                </p>
                <a
                  href="https://maps.google.com/?q=Naik+Nagar,+Chandranagar,+Rameshwari,+Nagpur+440027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-amber-700 hover:text-white text-xs font-bold uppercase tracking-wider border border-amber-600/40 px-6 py-2.5 rounded-full hover:bg-amber-700 transition-all"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: FaClock,
              label: "Front Desk Service",
              value: "24/7",
              desc: "Always here for you",
            },
            {
              icon: FaWifi,
              label: "Free Fiber Wi-Fi",
              value: "100 Mbps",
              desc: "Throughout the property",
            },
            {
              icon: FaPlaneArrival,
              label: "Airport Pickup",
              value: "On Request",
              desc: "Nagpur Airport transfers",
            },
            {
              icon: FaStar,
              label: "Guest Rating",
              value: "4.8 / 5",
              desc: "Verified guest reviews",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 text-center border border-gray-100 hover:border-amber-200 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <item.icon className="text-amber-600 text-lg" />
              </div>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                {item.value}
              </p>
              <p className="text-gray-700 font-semibold text-sm mt-1">
                {item.label}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FaParking, label: "Valet Parking", rotate: "" },
            { icon: FaConciergeBell, label: "24/7 Concierge", rotate: "" },
            {
              icon: FaShieldAlt,
              label: "Instant GST Billing",
              rotate: "",
            },
            { icon: FaCheck, label: "Direct Booking Rates", rotate: "" },
          ].map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-3 shadow-xs border border-gray-100 hover:border-amber-200 transition-all"
            >
              <service.icon
                className={`text-amber-600 text-sm ${service.rotate}`}
              />
              <span className="text-gray-700 text-xs sm:text-sm font-medium">
                {service.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;