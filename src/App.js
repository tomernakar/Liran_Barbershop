import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const yaronDefaultImg = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop";
const aboutDefaultImg = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop";

const workers = [
  {
    name: "לירן לוי",
    role: "Owner & Barber",
    img: liranImg,
  },
  {
    name: "ירון דדון",
    role: "Barber",
    img: yaronDefaultImg,
  },
  {
    name: "אוהד גולן",
    role: "Barber",
    img: ohadImg,
  },
];

const gallery = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

const services = [
  { title: "תספורת + זקן", price: "₪90" },
  { title: "סידור זקן", price: "₪30" },
  { title: "שעווה", price: "₪50" },
];

const hours = ["10:00", "10:30", "11:00", "12:00", "13:30", "15:00", "16:30", "18:00"];

const appointments = [
  { service: "תספורת + זקן", barber: "לירן לוי", location: shopAddress, date: "יום א׳, 17.11", hour: "08:20" },
  { service: "תספורת + זקן", barber: "ירון דדון", location: shopAddress, date: "יום ה׳, 21.11", hour: "18:00" },
  { service: "סידור זקן", barber: "אוהד גולן", location: shopAddress, date: "יום ב׳, 25.11", hour: "12:30" },
];

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

function AppointmentCard({ appointment }) {
  return (
    <motion.div
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-[#e8dfd2] to-[#d7cbbb] p-5 text-[#201b17] shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
    >
      <div className="text-right">
        <h4 className="text-3xl font-semibold leading-tight tracking-tight">{appointment.service}</h4>

        <div className="mt-5 space-y-3 text-lg text-[#5d5650]">
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

      <div className="my-5 h-px bg-[#c2b6aa]" />

      <div className="flex flex-row-reverse items-center justify-between text-lg font-semibold text-[#3b342e]">
        <div className="flex flex-row-reverse items-center gap-2">
          <CalendarDays size={22} />
          <span>{appointment.date}</span>
        </div>
        <div className="flex flex-row-reverse items-center gap-2">
          <Clock size={22} />
          <span>{appointment.hour}</span>
        </div>
      </div>
    </motion.div>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    { id: "gallery", icon: Grid3X3 },
    { id: "booking", icon: CalendarCheck },
    { id: "home", icon: Scissors },
    { id: "team", icon: UsersRound },
    { id: "menu", icon: Menu },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[88%] max-w-sm -translate-x-1/2 rounded-[2rem] bg-black/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between text-white/60">
        {items.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                active ? "bg-[#e7ded1] text-black" : "hover:text-white"
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

function Header() {
  return (
    <div className="sticky top-0 z-40 bg-[#070707] px-0 pb-0 pt-0 text-center shadow-lg">
      <img
        src={logoImg}
        alt="Liran Levy Barbershop"
        className="h-[7.7rem] w-full object-cover object-center"
      />
    </div>
  );
}

function LoginModal({ isOpen, setIsOpen, setUserName }) {
  const [nameInput, setNameInput] = useState("");

  const handleLogin = () => {
    const cleanName = nameInput.trim();
    if (!cleanName) return;
    setUserName(cleanName);
    setIsOpen(false);
    setNameInput("");
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
            <button onClick={() => setIsOpen(false)} className="mb-5 rounded-full bg-white/10 p-3">
              <X />
            </button>

            <h3 className="text-3xl font-semibold">התחברות</h3>
            <p className="mt-2 text-[#e7ded1]/70">הכנס שם כדי להמשיך לקביעת תור.</p>

            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="השם שלך"
              className="mt-6 w-full rounded-2xl border border-[#342d27] bg-[#100e0d] px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#e7ded1]"
            />

            <button
              onClick={handleLogin}
              disabled={!nameInput.trim()}
              className={`mt-5 w-full rounded-full py-4 text-xl font-semibold transition ${
                nameInput.trim() ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"
              }`}
            >
              התחבר
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HomeScreen({ setScreen, userName, setLoginOpen }) {
  const isLoggedIn = Boolean(userName);

  return (
    <div className="pb-28" dir="rtl">
      <div className="sticky top-[123px] h-[34rem] overflow-hidden">
        <motion.img
          alt="Liran Levy Barbershop interior"
          src={heroImg}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 7, ease: "easeOut" }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/80" />
        <div className="absolute bottom-40 right-7 max-w-xs text-right text-white drop-shadow-2xl">
          <h2 className="text-5xl font-medium leading-tight tracking-tight">
            {isLoggedIn ? `שלום, ${userName}` : "שלום, אורח"}
          </h2>
        </div>
      </div>

      <motion.div
        initial={{ y: 32, opacity: 0.94 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 -mt-16 rounded-t-[2.8rem] bg-[#141210]/88 px-6 pb-8 pt-8 shadow-[0_-18px_45px_rgba(0,0,0,0.55)] backdrop-blur-md"
      >
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

        <div className="mt-10 flex items-end justify-between gap-4">
          <h3 className="text-right text-3xl font-semibold leading-tight tracking-tight text-white">התורים הבאים שלך</h3>
          <button
            onClick={() => setScreen("profile")}
            className="pb-1 text-sm font-medium text-[#e7ded1]/70 underline-offset-4 hover:text-[#e7ded1] hover:underline"
          >
            הצג הכל
          </button>
        </div>

        <div className="mt-5">
          <AppointmentCard appointment={appointments[0]} />
        </div>

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
      </motion.div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="min-h-screen px-6 pb-32 pt-7 text-white" dir="rtl">
      <h2 className="text-4xl font-semibold tracking-tight">האזור האישי</h2>
      <p className="mt-2 text-[#e7ded1]/70">כל התורים הקרובים שלך במקום אחד.</p>
      <div className="mt-7 space-y-5">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.service + appointment.date} appointment={appointment} />
        ))}
      </div>
    </div>
  );
}

function BookingScreen() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [done, setDone] = useState(false);

  const formattedDate = useMemo(() => formatHebDate(selectedDate), [selectedDate]);
  const selectedClass = "border-[#e7ded1] bg-[#e7ded1] text-black shadow-xl";
  const regularClass = "border-[#342d27] bg-[#1f1b18] text-white shadow-md";
  const isReady = selectedService && selectedWorker && selectedDate && selectedHour;

  return (
    <div className="px-6 pb-32 pt-7 text-white" dir="rtl">
      <h2 className="text-4xl font-semibold tracking-tight">קביעת תור</h2>
      <p className="mt-2 text-[#e7ded1]/70">בחר שירות, ספר, תאריך ושעה.</p>

      <h3 className="mt-7 text-2xl font-semibold">בחר שירות</h3>
      <div className="mt-4 space-y-3">
        {services.map((service) => {
          const active = selectedService?.title === service.title;
          return (
            <button
              key={service.title}
              onClick={() => setSelectedService(service)}
              className={`w-full rounded-[2rem] border p-5 text-right transition ${active ? selectedClass : regularClass}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold">{service.title}</h4>
                {active && <CheckCircle2 size={26} className="shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      <h3 className="mt-8 text-2xl font-semibold">בחר ספר</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {workers.map((worker) => {
          const active = selectedWorker?.name === worker.name;
          return (
            <button key={worker.name} onClick={() => setSelectedWorker(worker)} className={`rounded-3xl border p-3 text-center transition ${active ? selectedClass : regularClass}`}>
              <img alt={worker.name} src={worker.img} className="mx-auto h-16 w-16 rounded-full object-cover" />
              <p className="mt-2 text-sm font-semibold">{worker.name}</p>
            </button>
          );
        })}
      </div>

      <h3 className="mt-8 text-2xl font-semibold">בחר תאריך</h3>
      <div className="mt-4 rounded-[2rem] bg-[#1f1b18] p-5 shadow-lg">
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

      <h3 className="mt-6 text-2xl font-semibold">בחר שעה</h3>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {hours.map((hour) => {
          const active = selectedHour === hour;
          return (
            <button key={hour} onClick={() => setSelectedHour(hour)} className={`rounded-2xl border px-3 py-3 font-semibold transition ${active ? selectedClass : regularClass}`}>{hour}</button>
          );
        })}
      </div>

      <div className="mt-8 rounded-[2rem] bg-[#1f1b18] p-5 shadow-lg">
        <div className="flex items-center gap-2 text-xl font-semibold"><Clock size={20} /> סיכום תור</div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="text-right">
            <p className="text-[#e7ded1]/70">{selectedService ? selectedService.title : "לא נבחר שירות"} {selectedWorker ? `אצל ${selectedWorker.name}` : ""}</p>
            <p className="text-[#e7ded1]/70">{selectedDate ? formattedDate : "לא נבחר תאריך"}{selectedHour ? `, שעה ${selectedHour}` : ""}</p>
          </div>

          <span className={`shrink-0 rounded-full px-5 py-2 font-semibold ${selectedService ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"}`}>
            {selectedService ? selectedService.price : "₪0"}
          </span>
        </div>
      </div>

      <button disabled={!isReady} onClick={() => setDone(true)} className={`mt-6 w-full rounded-full py-5 text-xl font-semibold shadow-xl transition ${isReady ? "bg-[#e7ded1] text-black" : "bg-white/10 text-white/35"}`}>אישור תור</button>

      {done && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-[#e7ded1] p-7 text-center text-black shadow-2xl">
            <CheckCircle2 className="mx-auto text-black" size={54} />
            <h3 className="mt-4 text-3xl font-semibold">התור נקבע</h3>
            <p className="mt-2 text-black/70">{selectedService.title} אצל {selectedWorker.name}, {formattedDate} בשעה {selectedHour}, {selectedService.price}</p>
            <button onClick={() => setDone(false)} className="mt-6 rounded-full bg-black px-10 py-3 font-semibold text-white">סגור</button>
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
    </div>
  );
}

function SideMenu({ isOpen, setIsOpen, setScreen }) {
  const goTo = (screenName) => {
    setScreen(screenName);
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
            className="absolute right-0 top-0 z-[80] h-full w-[82%] rounded-l-[2.5rem] border-l border-white/10 bg-[#171310] px-7 py-8 text-white shadow-2xl"
          >
            <button onClick={() => setIsOpen(false)} className="mr-auto flex rounded-full bg-white/10 p-3"><X /></button>
            <div className="mt-20 space-y-8 text-right text-2xl font-medium">
              <button onClick={() => goTo("home")} className="flex w-full flex-row items-center justify-start gap-4"><Home /><span>לובי</span></button>
              <button onClick={() => goTo("profile")} className="flex w-full flex-row items-center justify-start gap-4"><CalendarCheck /><span>האזור האישי</span></button>
              <button onClick={() => goTo("team")} className="flex w-full flex-row items-center justify-start gap-4"><UsersRound /><span>הצוות שלנו</span></button>
              <button onClick={() => goTo("gallery")} className="flex w-full flex-row items-center justify-start gap-4"><Grid3X3 /><span>גלריית עבודות</span></button>
              <button onClick={() => goTo("booking")} className="flex w-full flex-row items-center justify-start gap-4"><CalendarCheck /><span>קביעת תור</span></button>
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

  const handleNav = (nextScreen) => {
    if (nextScreen === "menu") {
      setIsMenuOpen((prev) => !prev);
      return;
    }
    setScreen(nextScreen);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-950" style={{ fontFamily: "Assistant, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div className="relative mx-auto h-screen max-w-md overflow-y-auto overflow-x-hidden bg-[#141210] shadow-2xl">
        <Header />
        {screen === "home" && <HomeScreen setScreen={setScreen} userName={userName} setLoginOpen={setIsLoginOpen} />}
        {screen === "profile" && <ProfileScreen />}
        {screen === "booking" && <BookingScreen />}
        {screen === "team" && <TeamScreen />}
        {screen === "gallery" && <GalleryScreen />}
        <SideMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} setScreen={setScreen} />
        <BottomNav screen={isMenuOpen ? "menu" : screen} setScreen={handleNav} />
        <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} setUserName={setUserName} />
      </div>
    </div>
  );
}