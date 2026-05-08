import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  CalendarCheck,
  Grid3X3,
  UsersRound,
  Menu,
  MapPin,
  Phone,
  Scissors,
  X,
  Clock,
  CheckCircle2,
  User,
  CalendarDays,
  Sparkles,
  Mail,
  LogOut,
  Camera,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  query,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { auth, db, googleProvider, storage } from "./firebase";
import logoImg from "./assets/liran-logo.jpeg";
import heroImg from "./assets/liran-main.jpeg";
import liranImg from "./assets/liran-portrait.jpeg";
import ohadImg from "./assets/ohad-portrait.jpeg";
import gallery1 from "./assets/gallery-1.jpeg";
import gallery2 from "./assets/gallery-2.jpeg";
import gallery3 from "./assets/gallery-3.jpeg";
import gallery4 from "./assets/gallery-4.jpeg";
import gallery5 from "./assets/gallery-5.jpeg";
import gallery6 from "./assets/gallery-6.jpeg";

const shopPhone = "0544888509";
const shopAddress = "פינס 19, פתח תקווה";
const adminEmails = ["tomern700@gmail.com"];

const yaronDefaultImg = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop";
const aboutDefaultImg = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop";

const workers = [
  {
    name: "לירן לוי",
    role: "בעלים וספר",
    img: liranImg,
  },
  {
    name: "ירון דדון",
    role: "ספר",
    img: yaronDefaultImg,
  },
  {
    name: "אוהד גולן",
    role: "ספר",
    img: ohadImg,
  },
];

const gallery = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

const services = [
  { title: "תספורת + זקן", price: "₪90", icon: Scissors, note: "מראה חד ומלא" },
  { title: "סידור זקן", price: "₪30", icon: User, note: "קווים נקיים" },
  { title: "שעווה", price: "₪50", icon: Sparkles, note: "גימור נקי" },
];

const hours = ["10:00", "10:30", "11:00", "12:00", "13:30", "15:00", "16:30", "18:00"];

function todayValue() {
  return new Date().toISOString().split("T")[0];
}

function nextYearValue() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

function formatHebDate(value) {
  if (!value) return "לא נבחר תאריך";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildSlotId(date, hour, workerName) {
  return [date, hour, workerName].map((part) => encodeURIComponent(part)).join("_");
}

function buildBlockedSlotId(date, hour, workerName) {
  return `blocked_${buildSlotId(date, hour, workerName)}`;
}

function mapAppointmentDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    service: data.serviceTitle,
    barber: data.workerName,
    location: data.location || shopAddress,
    date: formatHebDate(data.date),
    rawDate: data.date,
    hour: data.hour,
    price: data.price,
    status: data.status,
    slotId: data.slotId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone,
  };
}

function getWeekRange() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function isDateInCurrentWeek(dateValue) {
  if (!dateValue) return false;
  const date = new Date(`${dateValue}T12:00:00`);
  const { start, end } = getWeekRange();
  return date >= start && date < end;
}

function isToday(dateValue) {
  return dateValue === todayValue();
}

function getActiveStories(stories) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return stories.filter((story) => story.createdAtMs > dayAgo);
}

function getLatestStoryForWorker(stories, workerName) {
  return stories
    .filter((story) => story.workerName === workerName)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)[0];
}

function AppointmentCard({ appointment, onCancel, isCancelling }) {
  return (
    <motion.div
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[1.8rem] border border-[#e7ded1]/25 bg-gradient-to-br from-[#e9e0d3] via-[#ded2c4] to-[#cfc1b0] text-[#201b17] shadow-[0_18px_42px_rgba(0,0,0,0.32)]"
    >
      <div className="p-5 text-right">
        <div className="flex flex-row-reverse items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f6358]">Liran Levy</p>
            <h4 className="mt-1 text-2xl font-semibold leading-tight">{appointment.service}</h4>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/10">
            <Scissors size={21} />
          </div>
        </div>

        <div className="mt-5 space-y-3 text-base text-[#5d5650]">
          <p className="flex flex-row-reverse items-center justify-start gap-3">
            <User size={19} className="shrink-0" />
            <span>אצל {appointment.barber}</span>
          </p>
          <p className="flex flex-row-reverse items-center justify-start gap-3">
            <MapPin size={19} className="shrink-0" />
            <span>{appointment.location}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-row-reverse items-center justify-between border-t border-black/10 bg-black/5 px-5 py-4 text-base font-semibold text-[#3b342e]">
        <div className="flex flex-row-reverse items-center gap-2">
          <CalendarDays size={20} />
          <span>{appointment.date}</span>
        </div>
        <div className="flex flex-row-reverse items-center gap-2">
          <Clock size={20} />
          <span>{appointment.hour}</span>
        </div>
      </div>

      {onCancel && (
        <div className="border-t border-black/10 bg-black/5 px-5 py-4 text-left">
          <button
            onClick={() => onCancel(appointment)}
            disabled={isCancelling}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition disabled:bg-black/40"
          >
            {isCancelling ? "מבטל..." : "ביטול תור"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function BottomNav({ screen, setScreen, isAdmin }) {
  const items = isAdmin
    ? [
        { id: "gallery", icon: Grid3X3, label: "גלריה" },
        { id: "admin", icon: CalendarCheck, label: "ניהול תורים" },
        { id: "home", icon: Scissors, label: "בית" },
        { id: "profile", icon: User, label: "פרופיל" },
        { id: "menu", icon: Menu, label: "תפריט צד" },
      ]
    : [
        { id: "gallery", icon: Grid3X3, label: "גלריה" },
        { id: "booking", icon: CalendarCheck, label: "קביעת תור" },
        { id: "home", icon: Scissors, label: "בית" },
        { id: "team", icon: UsersRound, label: "צוות" },
        { id: "menu", icon: Menu, label: "תפריט צד" },
      ];

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[88%] max-w-sm -translate-x-1/2 rounded-[2rem] border border-white/10 bg-black/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between text-white/60">
        {items.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              aria-label={item.label}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                active ? "bg-[#e7ded1] text-black shadow-[0_0_24px_rgba(231,222,209,0.22)]" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Header({ isHome }) {
  return (
    <div
      className={`sticky top-0 z-40 px-0 pb-0 pt-0 text-center ${
        isHome
          ? "relative bg-transparent shadow-none after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[12rem] after:bg-gradient-to-b after:from-black/75 after:via-black/35 after:to-transparent after:content-['']"
          : "bg-[#070707] shadow-lg"
      }`}
    >
      <img
        src={logoImg}
        alt="Liran Levy Barbershop"
        className={`h-[7.7rem] w-full object-cover object-center ${
          isHome ? "relative z-10 opacity-95 mix-blend-screen [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)]" : ""
        }`}
      />
    </div>
  );
}

function LoginModal({ isOpen, setIsOpen }) {
  const [isSignup, setIsSignup] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
    setAuthError("");
  };

  const saveUserProfile = async (firebaseUser, fallbackName = "", fallbackPhone = "") => {
    const profileData = {
      name: firebaseUser.displayName || fallbackName || firebaseUser.email || "לקוח",
      email: firebaseUser.email || "",
      updatedAt: serverTimestamp(),
    };

    if (fallbackPhone) {
      profileData.phone = fallbackPhone;
    }

    await setDoc(
      doc(db, "users", firebaseUser.uid),
      profileData,
      { merge: true }
    );
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(result.user);
      closeModal();
    } catch (error) {
      setAuthError("לא הצלחנו להתחבר עם Google. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async () => {
    const cleanEmail = emailInput.trim();
    const cleanName = nameInput.trim();
    const cleanPhone = phoneInput.trim();
    if (!cleanEmail || !passwordInput || (isSignup && (!cleanName || !cleanPhone))) return;

    setAuthError("");
    setIsSubmitting(true);
    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
        await updateProfile(result.user, { displayName: cleanName });
        await saveUserProfile(result.user, cleanName, cleanPhone);
      } else {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        await saveUserProfile(result.user);
      }
      closeModal();
      setNameInput("");
      setPhoneInput("");
      setEmailInput("");
      setPasswordInput("");
    } catch (error) {
      setAuthError(isSignup ? "לא הצלחנו ליצור חשבון. בדוק את הפרטים ונסה שוב." : "האימייל או הסיסמה אינם נכונים.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir="rtl"
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-[2.2rem] border border-white/10 bg-[#171310] p-6 text-right text-white shadow-2xl"
          >
            <button onClick={closeModal} aria-label="סגירת התחברות" className="mb-5 rounded-full bg-white/10 p-3">
              <X />
            </button>

            <h3 className="text-3xl font-semibold">{isSignup ? "יצירת חשבון" : "התחברות"}</h3>
            <p className="mt-2 text-[#e7ded1]/70">התחבר כדי לשמור תורים ולנהל את האזור האישי.</p>

            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white px-5 py-4 text-lg font-semibold text-black transition hover:bg-[#e7ded1]"
            >
              <span className="text-xl font-bold">G</span>
              <span>המשך עם Google</span>
            </button>

            <div className="my-5 flex items-center gap-3 text-sm text-white/35">
              <div className="h-px flex-1 bg-white/10" />
              <span>או</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {isSignup && (
              <>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="שם מלא"
                  className="w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#e7ded1]"
                />
                <input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  type="tel"
                  placeholder="מספר טלפון"
                  className="mt-3 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#e7ded1]"
                />
              </>
            )}

            <div className={isSignup ? "mt-3" : ""}>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                placeholder="אימייל"
                className="w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#e7ded1]"
              />
            </div>

            <input
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              type="password"
              placeholder="סיסמה"
              className="mt-3 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#e7ded1]"
            />

            {authError && <p className="mt-3 text-sm font-semibold text-red-300">{authError}</p>}

            <button
              onClick={handleEmailLogin}
              disabled={isSubmitting || !emailInput.trim() || !passwordInput || (isSignup && (!nameInput.trim() || !phoneInput.trim()))}
              className={`mt-5 w-full rounded-full py-4 text-xl font-semibold transition ${
                emailInput.trim() && passwordInput && (!isSignup || (nameInput.trim() && phoneInput.trim())) ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"
              }`}
            >
              {isSubmitting ? "רגע..." : isSignup ? "צור חשבון" : "התחבר עם אימייל"}
            </button>

            <button
              onClick={() => {
                setIsSignup((prev) => !prev);
                setAuthError("");
              }}
              className="mt-4 w-full text-center text-sm font-semibold text-[#e7ded1]/75 hover:text-[#e7ded1]"
            >
              {isSignup ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? צור חשבון"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HomeScreen({
  setScreen,
  userName,
  setLoginOpen,
  appointments,
  appointmentsLoading,
  isAdmin,
  adminAppointments,
  adminAppointmentsLoading,
  stories,
  onAddStory,
  uploadingStoryFor,
}) {
  const isLoggedIn = Boolean(userName);
  const nextAppointment = appointments[0];
  const upcomingAdminAppointments = adminAppointments.slice(0, 3);
  const weeklyAppointmentsCount = adminAppointments.filter((appointment) => isDateInCurrentWeek(appointment.rawDate)).length;
  const todayAppointmentsCount = adminAppointments.filter((appointment) => isToday(appointment.rawDate)).length;
  const nextAdminAppointment = upcomingAdminAppointments[0];
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <div className="pb-28" dir="rtl">
      <div className="sticky top-0 -mt-[7.7rem] h-[41rem] overflow-hidden">
        <motion.img
          alt="Liran Levy Barbershop interior"
          src={heroImg}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 7, ease: "easeOut" }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80" />
        <div className="absolute inset-x-0 top-0 h-[15rem] bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div className="absolute bottom-40 right-7 max-w-xs text-right text-white drop-shadow-2xl">
          <h2 className="text-5xl font-medium leading-tight tracking-tight">
            <span className="block">שלום,</span>
            <span className="mt-1 block break-words">{isLoggedIn ? userName : "אורח"}</span>
          </h2>
        </div>
      </div>

      <motion.div
        initial={{ y: 32, opacity: 0.94 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 -mt-16 rounded-t-[2.8rem] bg-[#141210]/88 px-6 pb-8 pt-8 shadow-[0_-18px_45px_rgba(0,0,0,0.55)] backdrop-blur-md"
      >
        {!isAdmin && (
          <div className="flex flex-row-reverse items-center justify-between gap-4">
            <motion.a
              whileTap={{ scale: 0.94 }}
              href={`tel:${shopPhone}`}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7ded1] text-black shadow-2xl"
              aria-label="חיוג למספרה"
            >
              <Phone size={28} />
            </motion.a>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => (isLoggedIn ? setScreen("booking") : setLoginOpen(true))}
              className="rounded-full bg-[#e7ded1] px-10 py-5 text-xl font-semibold text-black shadow-2xl"
            >
              {isLoggedIn ? "קביעת תור" : "התחברות"}
            </motion.button>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#1f1b18] p-4 text-right">
                <p className="text-sm text-[#e7ded1]/55">תורים היום</p>
                <p className="mt-2 text-4xl font-semibold text-white">{todayAppointmentsCount}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-[#1f1b18] p-4 text-right">
                <p className="text-sm text-[#e7ded1]/55">תורים השבוע</p>
                <p className="mt-2 text-4xl font-semibold text-white">{weeklyAppointmentsCount}</p>
              </div>
            </div>

            {nextAdminAppointment && (
              <div className="mt-4 rounded-[1.7rem] border border-[#e7ded1]/15 bg-[#e7ded1] p-5 text-right text-black shadow-xl">
                <p className="text-sm font-semibold text-black/55">התור הבא</p>
                <h3 className="mt-1 text-2xl font-semibold">{nextAdminAppointment.hour} · {nextAdminAppointment.userName || "לקוח"}</h3>
                <p className="mt-2 text-black/65">{nextAdminAppointment.service} אצל {nextAdminAppointment.barber}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-right text-2xl font-semibold text-white">סטורי של הספרים</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {workers.map((worker) => {
                  const latestStory = getLatestStoryForWorker(stories, worker.name);
                  return (
                    <label key={worker.name} className="cursor-pointer rounded-[1.5rem] border border-white/10 bg-[#1f1b18] p-3 text-center text-white">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(event) => onAddStory(worker, event.target.files?.[0], event)}
                      />
                      <div className={`relative mx-auto h-16 w-16 rounded-full p-[3px] ${latestStory ? "bg-[#e7ded1]" : "bg-white/10"}`}>
                        <img src={worker.img} alt={worker.name} className="h-full w-full rounded-full object-cover" />
                        <span className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#e7ded1] text-black">
                          {uploadingStoryFor === worker.name ? <Camera size={14} /> : <Plus size={16} />}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold">{worker.name}</p>
                      <p className="mt-1 text-xs text-[#e7ded1]/50">{latestStory ? "סטורי פעיל" : "הוסף סטורי"}</p>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!isAdmin && (
          <div className="mt-8">
            <div className="flex justify-center gap-5">
              {workers.map((worker) => {
                const latestStory = getLatestStoryForWorker(stories, worker.name);
                return (
                  <button
                    key={worker.name}
                    onClick={() => latestStory && setSelectedStory(latestStory)}
                    className="text-center"
                    aria-label={`סטורי של ${worker.name}`}
                  >
                    <div className={`mx-auto h-20 w-20 rounded-full p-[3px] ${latestStory ? "bg-[#e7ded1] shadow-[0_0_22px_rgba(231,222,209,0.25)]" : "bg-white/10"}`}>
                      <img src={worker.img} alt={worker.name} className="h-full w-full rounded-full border-2 border-[#141210] object-cover" />
                    </div>
                    <p className="mt-2 max-w-[5rem] text-sm font-semibold text-white">{worker.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-end justify-between gap-4">
          <h3 className="text-right text-3xl font-semibold leading-tight tracking-tight text-white">{isAdmin ? "התורים הקרובים במספרה" : "התורים הבאים שלך"}</h3>
          <button
            onClick={() => setScreen(isAdmin ? "admin" : "profile")}
            className="pb-1 text-sm font-medium text-[#e7ded1]/70 underline-offset-4 hover:text-[#e7ded1] hover:underline"
          >
            הצג הכל
          </button>
        </div>

        <div className="mt-5">
          {isAdmin && adminAppointmentsLoading && <p className="text-right text-[#e7ded1]/70">טוען תורים...</p>}
          {isAdmin && !adminAppointmentsLoading && upcomingAdminAppointments.length === 0 && (
            <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right text-[#e7ded1]/75">
              אין תורים קרובים במספרה.
            </div>
          )}
          {isAdmin && upcomingAdminAppointments.map((appointment) => (
            <div key={appointment.id} className="mb-3 rounded-[1.5rem] border border-white/10 bg-[#1f1b18] p-4 text-right text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#e7ded1]/55">{appointment.date} · {appointment.hour}</p>
                  <h4 className="mt-1 text-xl font-semibold">{appointment.userName || "לקוח"}</h4>
                  <p className="mt-1 text-sm text-[#e7ded1]/65">{appointment.service} אצל {appointment.barber}</p>
                </div>
                <span className="rounded-full bg-[#e7ded1] px-4 py-2 text-sm font-semibold text-black">{appointment.price}</span>
              </div>
            </div>
          ))}
          {!isAdmin && isLoggedIn && nextAppointment && <AppointmentCard appointment={nextAppointment} />}
          {!isAdmin && isLoggedIn && !nextAppointment && !appointmentsLoading && (
            <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right text-[#e7ded1]/75">
              עדיין אין לך תור קרוב. אפשר לקבוע תור חדש בכפתור למעלה.
            </div>
          )}
          {!isAdmin && !isLoggedIn && (
            <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right text-[#e7ded1]/75">
              התחבר כדי לראות את התורים שלך ולבצע הזמנה אמיתית.
            </div>
          )}
        </div>

        {!isAdmin && (
          <>
            <h3 className="mt-10 text-3xl font-semibold tracking-tight text-white">הכירו אותנו</h3>
            <div className="mt-5 overflow-hidden rounded-[2rem] bg-[#090909] shadow-xl">
              <img
                alt="Barbershop tools"
                src={aboutDefaultImg}
                className="h-56 w-full object-cover opacity-70"
              />
              <p className="p-5 text-right text-lg leading-8 text-[#e7ded1]">
                Liran Levy Barbershop נוצר כדי לתת חוויית טיפוח מדויקת, נקייה ואישית. אצלנו משלבים מקצועיות, אווירה טובה וסטייל מודרני, כדי שכל לקוח יצא עם מראה חד וביטחון גבוה. המספרה נמצאת ב{shopAddress}.
              </p>
            </div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 z-[88] flex items-center justify-center bg-black/92 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <button
              onClick={() => setSelectedStory(null)}
              aria-label="סגירת סטורי"
              className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white"
            >
              <X />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[2rem] bg-[#111] shadow-2xl"
            >
              <img src={selectedStory.imageUrl} alt={`סטורי של ${selectedStory.workerName}`} className="max-h-[78vh] w-full object-cover" />
              <div className="flex items-center justify-between p-4 text-right text-white">
                <div>
                  <p className="text-lg font-semibold">{selectedStory.workerName}</p>
                  <p className="text-sm text-[#e7ded1]/60">סטורי זמין ל-24 שעות</p>
                </div>
                <Camera className="text-[#e7ded1]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileScreen({ appointments, appointmentsLoading, user, setLoginOpen, onCancelAppointment, cancellingAppointmentId }) {
  return (
    <div className="min-h-screen px-6 pb-32 pt-7 text-white" dir="rtl">
      <h2 className="text-4xl font-semibold tracking-tight">האזור האישי</h2>
      <p className="mt-2 text-[#e7ded1]/70">כל התורים הקרובים שלך במקום אחד.</p>
      <div className="mt-7 space-y-5">
        {!user && (
          <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right">
            <p className="text-[#e7ded1]/75">צריך להתחבר כדי לראות תורים אמיתיים.</p>
            <button onClick={() => setLoginOpen(true)} className="mt-4 rounded-full bg-[#e7ded1] px-6 py-3 font-semibold text-black">
              התחברות
            </button>
          </div>
        )}
        {user && appointmentsLoading && <p className="text-[#e7ded1]/70">טוען תורים...</p>}
        {user && !appointmentsLoading && appointments.length === 0 && (
          <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right text-[#e7ded1]/75">
            אין לך תורים קרובים כרגע.
          </div>
        )}
        {user && appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id || appointment.service + appointment.date}
            appointment={appointment}
            onCancel={onCancelAppointment}
            isCancelling={cancellingAppointmentId === appointment.id}
          />
        ))}
      </div>
    </div>
  );
}

function BookingStepTitle({ number, title, subtitle }) {
  return (
    <div className="relative mt-8 pr-12 text-right">
      <span className="absolute right-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7ded1]/25 bg-[#e7ded1]/10 text-sm font-bold text-[#e7ded1]">
        {number}
      </span>
      <div>
        <h3 className="text-2xl font-semibold">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-[#e7ded1]/55">{subtitle}</p>}
      </div>
    </div>
  );
}

function AdminScreen({
  appointments,
  appointmentsLoading,
  onCancelAppointment,
  cancellingAppointmentId,
  blockedSlots,
  onBlockHour,
  onUnblockHour,
  blockingHour,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [blockWorker, setBlockWorker] = useState(workers[0].name);
  const [blockDate, setBlockDate] = useState(todayValue());
  const [blockHour, setBlockHour] = useState(hours[0]);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate = selectedDate ? appointment.rawDate === selectedDate : true;
    const matchesWorker = selectedWorker === "all" ? true : appointment.barber === selectedWorker;
    return matchesDate && matchesWorker;
  });

  const filteredBlockedSlots = blockedSlots
    .filter((slot) => (selectedDate ? slot.date === selectedDate : true))
    .filter((slot) => (selectedWorker === "all" ? true : slot.workerName === selectedWorker))
    .sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`));

  return (
    <div className="min-h-screen px-6 pb-32 pt-7 text-white" dir="rtl">
      <h2 className="text-4xl font-semibold tracking-tight">ניהול תורים</h2>
      <p className="mt-2 text-[#e7ded1]/70">כל התורים של המספרה במקום אחד.</p>

      <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[#1f1b18] p-4">
        <label className="block text-sm font-semibold text-[#e7ded1]/65">תאריך</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-3 font-semibold text-white outline-none focus:border-[#e7ded1]"
        />

        <label className="mt-4 block text-sm font-semibold text-[#e7ded1]/65">ספר</label>
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-3 font-semibold text-white outline-none focus:border-[#e7ded1]"
        >
          <option value="all">כל הספרים</option>
          {workers.map((worker) => (
            <option key={worker.name} value={worker.name}>
              {worker.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 rounded-[1.7rem] border border-[#e7ded1]/15 bg-[#1f1b18] p-4 text-right">
        <h3 className="text-2xl font-semibold">חסימת שעה</h3>
        <p className="mt-1 text-sm text-[#e7ded1]/60">חסום שעה שבה ספר לא זמין, כדי שלקוחות לא יוכלו לקבוע בה תור.</p>

        <label className="mt-4 block text-sm font-semibold text-[#e7ded1]/65">ספר</label>
        <select
          value={blockWorker}
          onChange={(e) => setBlockWorker(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-3 font-semibold text-white outline-none focus:border-[#e7ded1]"
        >
          {workers.map((worker) => (
            <option key={worker.name} value={worker.name}>
              {worker.name}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#e7ded1]/65">תאריך</label>
            <input
              type="date"
              value={blockDate}
              min={todayValue()}
              max={nextYearValue()}
              onChange={(e) => setBlockDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-3 font-semibold text-white outline-none focus:border-[#e7ded1]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#e7ded1]/65">שעה</label>
            <select
              value={blockHour}
              onChange={(e) => setBlockHour(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-3 font-semibold text-white outline-none focus:border-[#e7ded1]"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onBlockHour({ workerName: blockWorker, date: blockDate, hour: blockHour })}
          disabled={blockingHour}
          className="mt-4 w-full rounded-full bg-[#e7ded1] px-6 py-4 text-lg font-semibold text-black transition disabled:bg-white/20 disabled:text-white/35"
        >
          {blockingHour ? "חוסם..." : "חסום שעה"}
        </button>

        {filteredBlockedSlots.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-semibold text-[#e7ded1]/65">שעות חסומות</p>
            {filteredBlockedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                <button onClick={() => onUnblockHour(slot)} className="rounded-full bg-[#e7ded1] px-4 py-2 text-sm font-semibold text-black">
                  שחרור
                </button>
                <p className="text-sm text-white">{formatHebDate(slot.date)} · {slot.hour} · {slot.workerName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {appointmentsLoading && <p className="text-[#e7ded1]/70">טוען תורים...</p>}
        {!appointmentsLoading && filteredAppointments.length === 0 && (
          <div className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right text-[#e7ded1]/75">
            אין תורים להצגה.
          </div>
        )}
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="rounded-[1.8rem] border border-white/10 bg-[#1f1b18] p-5 text-right shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#e7ded1]/55">{appointment.date} · {appointment.hour}</p>
                <h3 className="mt-1 text-2xl font-semibold">{appointment.service}</h3>
                <p className="mt-2 text-[#e7ded1]/75">אצל {appointment.barber}</p>
              </div>
              <span className="rounded-full bg-[#e7ded1] px-4 py-2 text-sm font-semibold text-black">{appointment.price}</span>
            </div>

            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm leading-7 text-[#e7ded1]/75">
              <p>לקוח: {appointment.userName || "לא ידוע"}</p>
              <p>אימייל: {appointment.userEmail || "לא ידוע"}</p>
              <p>טלפון: {appointment.userPhone || "לא הוזן"}</p>
            </div>

            <button
              onClick={() => onCancelAppointment(appointment)}
              disabled={cancellingAppointmentId === appointment.id}
              className="mt-4 rounded-full bg-[#e7ded1] px-6 py-3 font-semibold text-black transition disabled:bg-white/20 disabled:text-white/35"
            >
              {cancellingAppointmentId === appointment.id ? "מבטל..." : "ביטול תור"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingScreen({ user, userProfile, setLoginOpen }) {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [done, setDone] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookedHours, setBookedHours] = useState([]);
  const [blockedHours, setBlockedHours] = useState([]);

  const formattedDate = useMemo(() => formatHebDate(selectedDate), [selectedDate]);
  const selectedClass = "border-[#e7ded1] bg-[#e7ded1] text-black shadow-xl";
  const regularClass = "border-[#342d27] bg-[#1f1b18] text-white shadow-md";
  const isReady = selectedService && selectedWorker && selectedDate && selectedHour;

  useEffect(() => {
    if (!selectedDate || !selectedWorker) {
      setBookedHours([]);
      setBlockedHours([]);
      return undefined;
    }

    const slotsQuery = query(collection(db, "bookedSlots"), where("date", "==", selectedDate));
    const blockedQuery = query(collection(db, "blockedSlots"), where("date", "==", selectedDate));
    const unsubscribeBooked = onSnapshot(slotsQuery, (snapshot) => {
      const workerBookedHours = snapshot.docs
        .map((slotDoc) => slotDoc.data())
        .filter((slot) => slot.workerName === selectedWorker.name && slot.status === "booked")
        .map((slot) => slot.hour);

      setBookedHours(workerBookedHours);
      if (selectedHour && workerBookedHours.includes(selectedHour)) {
        setSelectedHour(null);
      }
    });
    const unsubscribeBlocked = onSnapshot(blockedQuery, (snapshot) => {
      const workerBlockedHours = snapshot.docs
        .map((slotDoc) => slotDoc.data())
        .filter((slot) => slot.workerName === selectedWorker.name && slot.status === "blocked")
        .map((slot) => slot.hour);

      setBlockedHours(workerBlockedHours);
      if (selectedHour && workerBlockedHours.includes(selectedHour)) {
        setSelectedHour(null);
      }
    });

    return () => {
      unsubscribeBooked();
      unsubscribeBlocked();
    };
  }, [selectedDate, selectedWorker, selectedHour]);

  const handleConfirmAppointment = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!isReady || isBooking) return;

    setBookingError("");
    setIsBooking(true);

    try {
      const slotId = buildSlotId(selectedDate, selectedHour, selectedWorker.name);
      const blockedSlotId = buildBlockedSlotId(selectedDate, selectedHour, selectedWorker.name);
      const slotRef = doc(db, "bookedSlots", slotId);
      const blockedSlotRef = doc(db, "blockedSlots", blockedSlotId);
      const appointmentRef = doc(collection(db, "appointments"));

      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        const blockedSlotSnap = await transaction.get(blockedSlotRef);
        if (slotSnap.exists()) {
          throw new Error("slot-taken");
        }
        if (blockedSlotSnap.exists()) {
          throw new Error("slot-blocked");
        }

        const appointmentData = {
          userId: user.uid,
          userName: user.displayName || user.email || "לקוח",
          userEmail: user.email || "",
          userPhone: userProfile?.phone || "",
          serviceTitle: selectedService.title,
          price: selectedService.price,
          workerName: selectedWorker.name,
          date: selectedDate,
          hour: selectedHour,
          location: shopAddress,
          status: "booked",
          slotId,
          createdAt: serverTimestamp(),
        };

        transaction.set(appointmentRef, appointmentData);
        transaction.set(slotRef, {
          appointmentId: appointmentRef.id,
          workerName: selectedWorker.name,
          date: selectedDate,
          hour: selectedHour,
          status: "booked",
          createdAt: serverTimestamp(),
        });
      });

      setDone(true);
    } catch (error) {
      setBookingError(error.message === "slot-taken" || error.message === "slot-blocked" ? "השעה הזו לא זמינה. בחר שעה אחרת." : "לא הצלחנו לקבוע את התור. נסה שוב.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="px-6 pb-32 pt-7 text-white" dir="rtl">
      <h2 className="text-4xl font-semibold tracking-tight">קביעת תור</h2>
      <p className="mt-2 text-[#e7ded1]/70">בחר שירות, ספר, תאריך ושעה.</p>
      {!user && (
        <button onClick={() => setLoginOpen(true)} className="mt-5 flex items-center gap-2 rounded-full border border-[#e7ded1]/20 bg-[#e7ded1]/10 px-5 py-3 text-sm font-semibold text-[#e7ded1]">
          <Mail size={17} />
          <span>התחבר כדי לקבוע תור אמיתי</span>
        </button>
      )}

      <BookingStepTitle number="1" title="בחר שירות" subtitle="המחיר יופיע בסיכום בלבד." />
      <div className="mt-4 space-y-3">
        {services.map((service) => {
          const active = selectedService?.title === service.title;
          const Icon = service.icon;
          return (
            <button
              key={service.title}
              onClick={() => setSelectedService(service)}
              className={`w-full rounded-[1.6rem] border p-5 text-right transition ${active ? selectedClass : regularClass}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-right">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${active ? "bg-black/10" : "bg-[#e7ded1]/10 text-[#e7ded1]"}`}>
                    <Icon size={23} />
                  </span>
                  <div>
                    <h4 className="text-xl font-semibold">{service.title}</h4>
                    <p className={`mt-1 text-sm ${active ? "text-black/55" : "text-[#e7ded1]/55"}`}>{service.note}</p>
                  </div>
                </div>
                {active && <CheckCircle2 size={25} className="shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      <BookingStepTitle number="2" title="בחר ספר" subtitle="בחר את מי שיטפל בך בתור הזה." />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {workers.map((worker) => {
          const active = selectedWorker?.name === worker.name;
          return (
            <button key={worker.name} onClick={() => setSelectedWorker(worker)} className={`rounded-[1.5rem] border p-3 text-center transition ${active ? selectedClass : regularClass}`}>
              <img alt={worker.name} src={worker.img} className={`mx-auto h-20 w-20 rounded-full object-cover ${active ? "ring-4 ring-black/10" : "ring-2 ring-[#e7ded1]/20"}`} />
              <p className="mt-3 text-sm font-semibold leading-tight">{worker.name}</p>
              <p className={`mt-1 text-xs ${active ? "text-black/55" : "text-[#e7ded1]/50"}`}>{worker.role}</p>
            </button>
          );
        })}
      </div>

      <BookingStepTitle number="3" title="בחר תאריך" />
      <div className="mt-4 rounded-[1.7rem] border border-white/10 bg-[#1f1b18] p-5 shadow-lg">
        <input
          type="date"
          value={selectedDate}
          min={todayValue()}
          max={nextYearValue()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none focus:border-[#e7ded1]"
        />
        <p className="mt-3 text-lg font-semibold text-[#e7ded1]">{formattedDate}</p>
      </div>

      <BookingStepTitle number="4" title="בחר שעה" />
      <div className="mt-4 grid grid-cols-4 gap-3">
        {hours.map((hour) => {
          const active = selectedHour === hour;
          const isBooked = bookedHours.includes(hour);
          const isBlocked = blockedHours.includes(hour);
          const isUnavailable = isBooked || isBlocked;
          return (
            <button
              key={hour}
              onClick={() => {
                if (!isUnavailable) {
                  setSelectedHour(hour);
                  setBookingError("");
                }
              }}
              disabled={isUnavailable}
              className={`rounded-2xl border px-3 py-3 font-semibold transition ${
                isUnavailable ? "border-white/5 bg-white/5 text-white/25 line-through" : active ? selectedClass : regularClass
              }`}
            >
              {hour}
            </button>
          );
        })}
      </div>
      {selectedDate && selectedWorker && (bookedHours.length > 0 || blockedHours.length > 0) && (
        <p className="mt-3 text-right text-sm text-[#e7ded1]/55">שעות תפוסות או חסומות מסומנות ואי אפשר לבחור אותן.</p>
      )}

      <div className="mt-8 rounded-[1.8rem] border border-[#e7ded1]/15 bg-[#1f1b18] p-5 shadow-lg">
        <div className="flex items-center justify-start gap-3 text-xl font-semibold">
          <Clock size={20} className="text-[#e7ded1]" />
          <span>סיכום תור</span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="text-right">
            <p className="font-semibold text-white">{selectedService ? selectedService.title : "לא נבחר שירות"} {selectedWorker ? `אצל ${selectedWorker.name}` : ""}</p>
            <p className="mt-1 text-sm leading-6 text-[#e7ded1]/65">{selectedDate ? formattedDate : "לא נבחר תאריך"}{selectedHour ? `, שעה ${selectedHour}` : ""}</p>
          </div>

          <span className={`shrink-0 rounded-full px-5 py-2 font-semibold ${selectedService ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"}`}>
            {selectedService ? selectedService.price : "₪0"}
          </span>
        </div>
      </div>

      {bookingError && <p className="mt-4 text-right text-sm font-semibold text-red-300">{bookingError}</p>}

      <button
        disabled={isBooking || (!user ? false : !isReady)}
        onClick={handleConfirmAppointment}
        className={`mt-6 w-full rounded-full py-5 text-xl font-semibold shadow-xl transition ${user && isReady ? "bg-[#e7ded1] text-black" : !user ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"}`}
      >
        {isBooking ? "קובע תור..." : user ? "אישור תור" : "התחברות לקביעת תור"}
      </button>

      {done && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-[#e7ded1] p-7 text-center text-black shadow-2xl">
            <CheckCircle2 className="mx-auto text-black" size={54} />
            <h3 className="mt-4 text-3xl font-semibold">התור נקבע</h3>
            <p className="mt-2 text-black/70">{selectedService.title} אצל {selectedWorker.name}, {formattedDate} בשעה {selectedHour}, {selectedService.price}</p>
            <button
              onClick={() => {
                setDone(false);
                setSelectedService(null);
                setSelectedWorker(null);
                setSelectedDate("");
                setSelectedHour(null);
              }}
              className="mt-6 rounded-full bg-black px-10 py-3 font-semibold text-white"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamScreen() {
  return (
    <div className="pb-28" dir="rtl">
      <div className="relative h-72 overflow-hidden">
        <img alt="Barbershop team background" src={heroImg} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <h2 className="absolute bottom-10 right-6 text-5xl font-semibold text-white">הצוות שלנו</h2>
      </div>
      <div className="-mt-8 rounded-t-[2.5rem] bg-[#141210] px-6 pb-8 pt-10">
        <div className="space-y-5">
          {workers.map((worker) => (
            <div key={worker.name} className="flex items-center justify-between border-b border-white/10 pb-5 text-white">
              <img alt={worker.name} src={worker.img} className="h-20 w-20 rounded-full object-cover ring-4 ring-[#e7ded1]/30" />
              <div className="text-right">
                <h3 className="text-2xl font-semibold">{worker.name}</h3>
                <p className="text-[#e7ded1]/70">{worker.role}</p>
              </div>
              <button className="rounded-full bg-[#e7ded1] px-5 py-2 font-semibold text-black">פרטים</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryScreen() {
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <div className="px-6 pb-32 pt-7 text-white" dir="rtl">
      <div className="text-right">
        <h2 className="text-4xl font-semibold tracking-tight">גלריית עבודות</h2>
        <p className="mt-2 text-[#e7ded1]/70">רגעים, סטיילים ועבודות מהמספרה.</p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        {gallery.map((img, i) => (
          <motion.div
            key={img}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPreviewImage(img)}
            className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_18px_45px_rgba(0,0,0,0.45)] ${
              i === 0 || i === 5 ? "col-span-2 h-72" : "h-56"
            }`}
          >
            <img
              alt="Barbershop haircut work"
              src={img}
              className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/90 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              aria-label="סגירת תמונה"
              className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white"
            >
              <X />
            </button>
            <motion.img
              src={previewImage}
              alt="Barbershop haircut work preview"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[78vh] w-full max-w-md rounded-[1.7rem] object-cover shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SideMenu({ isOpen, setIsOpen, setScreen, screen, user, setLoginOpen, isAdmin }) {
  const items = isAdmin
    ? [
        { id: "home", label: "דף מנהל", icon: Home },
        { id: "admin", label: "ניהול תורים", icon: CalendarCheck },
        { id: "profile", label: "האזור האישי", icon: User },
        { id: "gallery", label: "גלריית עבודות", icon: Grid3X3 },
      ]
    : [
        { id: "home", label: "לובי", icon: Home },
        { id: "profile", label: "האזור האישי", icon: CalendarCheck },
        { id: "team", label: "הצוות שלנו", icon: UsersRound },
        { id: "gallery", label: "גלריית עבודות", icon: Grid3X3 },
        { id: "booking", label: "קביעת תור", icon: CalendarCheck },
      ];

  const goTo = (screenName) => {
    setScreen(screenName);
    setIsOpen(false);
  };

  const handleAuthAction = async () => {
    if (user) {
      await signOut(auth);
      setIsOpen(false);
      return;
    }
    setLoginOpen(true);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 z-[70] bg-black/55 backdrop-blur-sm" />
          <motion.aside
            dir="rtl"
            initial={{ x: "110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "110%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute right-0 top-0 z-[80] flex h-full w-[82%] flex-col rounded-l-[2.5rem] border-l border-white/10 bg-[#171310] px-7 py-8 text-white shadow-2xl"
          >
            <button onClick={() => setIsOpen(false)} aria-label="סגירת תפריט" className="mr-auto flex rounded-full bg-white/10 p-3 text-[#e7ded1]"><X /></button>
            <div className="mt-16 space-y-3 text-right text-xl font-medium">
              {items.map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => goTo(item.id)}
                    className={`relative w-full rounded-2xl py-4 pl-4 pr-14 text-right transition ${
                      active ? "bg-[#e7ded1] text-black" : "text-white/85 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={23} className="absolute right-4 top-1/2 -translate-y-1/2" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto rounded-[1.6rem] border border-white/10 bg-black/20 p-4 text-right">
              <p className="text-sm text-[#e7ded1]/60">Liran Levy Barbershop</p>
              <button onClick={handleAuthAction} className="mt-3 flex w-full flex-row-reverse items-center justify-start gap-2 rounded-full bg-[#e7ded1] px-4 py-3 text-sm font-semibold text-black">
                {user ? <LogOut size={17} /> : <User size={17} />}
                <span>{user ? "התנתקות" : "התחברות"}</span>
              </button>
              <a href={`tel:${shopPhone}`} className="mt-2 flex flex-row-reverse items-center justify-end gap-2 text-lg font-semibold text-white">
                <span>{shopPhone}</span>
                <Phone size={18} />
              </a>
              <p className="mt-2 flex flex-row-reverse items-center justify-end gap-2 text-sm text-[#e7ded1]/65">
                <span>{shopAddress}</span>
                <MapPin size={16} />
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userAppointments, setUserAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [adminAppointmentsLoading, setAdminAppointmentsLoading] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null);
  const [stories, setStories] = useState([]);
  const [uploadingStoryFor, setUploadingStoryFor] = useState("");
  const [blockingHour, setBlockingHour] = useState(false);
  const isAdmin = adminEmails.includes((currentUser?.email || "").toLowerCase());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setUserName(firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "");
      setAuthLoading(false);

      if (firebaseUser) {
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            name: firebaseUser.displayName || firebaseUser.email || "לקוח",
            email: firebaseUser.email || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCurrentUserProfile(null);
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      setCurrentUserProfile(snapshot.exists() ? snapshot.data() : null);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setUserAppointments([]);
      setAppointmentsLoading(false);
      return undefined;
    }

    setAppointmentsLoading(true);
    const appointmentsQuery = query(collection(db, "appointments"), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const loadedAppointments = snapshot.docs
          .map(mapAppointmentDoc)
          .filter((appointment) => appointment.status !== "cancelled")
          .sort((a, b) => `${a.rawDate} ${a.hour}`.localeCompare(`${b.rawDate} ${b.hour}`));
        setUserAppointments(loadedAppointments);
        setAppointmentsLoading(false);
      },
      () => {
        setAppointmentsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!isAdmin) {
      setAllAppointments([]);
      setAdminAppointmentsLoading(false);
      return undefined;
    }

    setAdminAppointmentsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "appointments"),
      (snapshot) => {
        const loadedAppointments = snapshot.docs
          .map(mapAppointmentDoc)
          .filter((appointment) => appointment.status !== "cancelled")
          .sort((a, b) => `${a.rawDate} ${a.hour}`.localeCompare(`${b.rawDate} ${b.hour}`));
        setAllAppointments(loadedAppointments);
        setAdminAppointmentsLoading(false);
      },
      () => {
        setAdminAppointmentsLoading(false);
      }
    );

    return unsubscribe;
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setBlockedSlots([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(collection(db, "blockedSlots"), (snapshot) => {
      const loadedBlockedSlots = snapshot.docs
        .map((slotDoc) => ({ id: slotDoc.id, ...slotDoc.data() }))
        .filter((slot) => slot.status === "blocked")
        .sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`));
      setBlockedSlots(loadedBlockedSlots);
    });

    return unsubscribe;
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stories"), (snapshot) => {
      const loadedStories = snapshot.docs.map((storyDoc) => ({
        id: storyDoc.id,
        ...storyDoc.data(),
      }));
      setStories(getActiveStories(loadedStories));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStories((currentStories) => getActiveStories(currentStories));
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleNav = (nextScreen) => {
    if (nextScreen === "menu") {
      setIsMenuOpen((prev) => !prev);
      return;
    }
    if (nextScreen === "admin" && !isAdmin) {
      setScreen("home");
      setIsMenuOpen(false);
      return;
    }
    setScreen(nextScreen);
    setIsMenuOpen(false);
  };

  const handleCancelAppointment = async (appointment) => {
    if (!currentUser || !appointment?.id) return;

    const confirmed = window.confirm("לבטל את התור הזה?");
    if (!confirmed) return;

    setCancellingAppointmentId(appointment.id);
    try {
      await runTransaction(db, async (transaction) => {
        const appointmentRef = doc(db, "appointments", appointment.id);
        const appointmentSnap = await transaction.get(appointmentRef);

        if (!appointmentSnap.exists()) {
          throw new Error("missing-appointment");
        }

        const appointmentData = appointmentSnap.data();
        const currentUserIsAdmin = adminEmails.includes((currentUser.email || "").toLowerCase());
        if (appointmentData.userId !== currentUser.uid && !currentUserIsAdmin) {
          throw new Error("not-owner");
        }

        transaction.update(appointmentRef, {
          status: "cancelled",
          cancelledAt: serverTimestamp(),
        });

        if (appointmentData.slotId) {
          transaction.delete(doc(db, "bookedSlots", appointmentData.slotId));
        }
      });
    } catch (error) {
      alert("לא הצלחנו לבטל את התור. נסה שוב.");
    } finally {
      setCancellingAppointmentId(null);
    }
  };

  const handleBlockHour = async ({ workerName, date, hour }) => {
    if (!isAdmin || !workerName || !date || !hour) return;

    setBlockingHour(true);
    try {
      const slotId = buildSlotId(date, hour, workerName);
      const blockedSlotId = buildBlockedSlotId(date, hour, workerName);
      const bookedSlotRef = doc(db, "bookedSlots", slotId);
      const blockedSlotRef = doc(db, "blockedSlots", blockedSlotId);

      await runTransaction(db, async (transaction) => {
        const bookedSlotSnap = await transaction.get(bookedSlotRef);
        if (bookedSlotSnap.exists()) {
          throw new Error("already-booked");
        }

        transaction.set(blockedSlotRef, {
          workerName,
          date,
          hour,
          status: "blocked",
          createdBy: currentUser.uid,
          createdByEmail: currentUser.email || "",
          createdAt: serverTimestamp(),
        });
      });
    } catch (error) {
      alert(error.message === "already-booked" ? "אי אפשר לחסום שעה שכבר יש בה תור." : "לא הצלחנו לחסום את השעה. נסה שוב.");
    } finally {
      setBlockingHour(false);
    }
  };

  const handleUnblockHour = async (slot) => {
    if (!isAdmin || !slot?.id) return;

    try {
      await deleteDoc(doc(db, "blockedSlots", slot.id));
    } catch (error) {
      alert("לא הצלחנו לשחרר את השעה. נסה שוב.");
    }
  };

  const handleAddStory = async (worker, file, event) => {
    if (event?.target) {
      event.target.value = "";
    }
    if (!isAdmin || !currentUser || !file) return;

    setUploadingStoryFor(worker.name);
    try {
      const createdAtMs = Date.now();
      const safeWorkerName = encodeURIComponent(worker.name);
      const storyRef = ref(storage, `stories/${safeWorkerName}/${createdAtMs}-${file.name}`);

      await uploadBytes(storyRef, file);
      const imageUrl = await getDownloadURL(storyRef);

      await addDoc(collection(db, "stories"), {
        workerName: worker.name,
        workerImg: worker.img,
        imageUrl,
        createdAtMs,
        expiresAtMs: createdAtMs + 24 * 60 * 60 * 1000,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email || "",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      alert("לא הצלחנו להעלות את הסטורי. ודא ש-Firebase Storage פעיל ונסה שוב.");
    } finally {
      setUploadingStoryFor("");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-950" style={{ fontFamily: "Assistant, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div className="relative mx-auto h-screen max-w-md overflow-y-auto overflow-x-hidden bg-[#141210] shadow-2xl">
        <Header isHome={screen === "home"} />
        {authLoading && (
          <div className="px-6 py-4 text-right text-sm font-semibold text-[#e7ded1]/60" dir="rtl">
            מתחבר...
          </div>
        )}
        {screen === "home" && (
          <HomeScreen
            setScreen={setScreen}
            userName={userName}
            setLoginOpen={setIsLoginOpen}
            appointments={userAppointments}
            appointmentsLoading={appointmentsLoading}
            isAdmin={isAdmin}
            adminAppointments={allAppointments}
            adminAppointmentsLoading={adminAppointmentsLoading}
            stories={stories}
            onAddStory={handleAddStory}
            uploadingStoryFor={uploadingStoryFor}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            appointments={userAppointments}
            appointmentsLoading={appointmentsLoading}
            user={currentUser}
            setLoginOpen={setIsLoginOpen}
            onCancelAppointment={handleCancelAppointment}
            cancellingAppointmentId={cancellingAppointmentId}
          />
        )}
        {screen === "booking" && <BookingScreen user={currentUser} userProfile={currentUserProfile} setLoginOpen={setIsLoginOpen} />}
        {screen === "admin" && isAdmin && (
          <AdminScreen
            appointments={allAppointments}
            appointmentsLoading={adminAppointmentsLoading}
            onCancelAppointment={handleCancelAppointment}
            cancellingAppointmentId={cancellingAppointmentId}
            blockedSlots={blockedSlots}
            onBlockHour={handleBlockHour}
            onUnblockHour={handleUnblockHour}
            blockingHour={blockingHour}
          />
        )}
        {screen === "team" && <TeamScreen />}
        {screen === "gallery" && <GalleryScreen />}
        <SideMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} setScreen={setScreen} screen={screen} user={currentUser} setLoginOpen={setIsLoginOpen} isAdmin={isAdmin} />
        <BottomNav screen={isMenuOpen ? "menu" : screen} setScreen={handleNav} isAdmin={isAdmin} />
        <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
      </div>
    </div>
  );
}
