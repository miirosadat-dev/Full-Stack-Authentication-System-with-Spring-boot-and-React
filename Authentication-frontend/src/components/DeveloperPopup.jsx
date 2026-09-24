import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import Modal from "./Modal";
import photo from "../assets/images/miiro-sadat.webp";

const DEVELOPER = {
    name: "Miiro Sadat",
    title: "Full-stack developer",
    // Your own WhatsApp number: digits only, with the country code, no + and no spaces
    whatsapp: "256787760797",
};

const SHOW_ON_EVERY_PAGE = true;
const EXCLUDED_PATHS = ["/reset-password"];
const DELAY_MS = 1500;

const SEEN_KEY = "anchor_developer_popup_seen";

const skills = [
    "React",
    "Tailwind CSS",
    "Spring Boot",
    "Spring Security",
    "PostgreSQL",
    "JWT",
];

const hasSeenPopup = () => {
    try {
        return sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
};

const markSeen = () => {
    try {
        sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
        // ignore: it will just show again
    }
};

const buildWhatsappLink = () => {
    const firstName = DEVELOPER.name.split(" ")[0];

    const message = [
        `Hello ${firstName},`,
        "",
        "I have seen your project and I would like to talk to you about working together.",
        `Sent from: ${window.location.href}`,
    ].join("\n");

    return `https://wa.me/${DEVELOPER.whatsapp}?text=${encodeURIComponent(message)}`;
};

const DeveloperPopup = () => {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const path = pathname.replace(/\/+$/, "") || "/";

        if (EXCLUDED_PATHS.includes(path)) {
            setOpen(false);
            return;
        }

        if (!SHOW_ON_EVERY_PAGE && hasSeenPopup()) return;

        let timer;

        const show = () => {
            timer = setTimeout(() => {
                setOpen(true);
                markSeen();
            }, DELAY_MS);
        };

        if (document.readyState === "complete") {
            show();
        } else {
            window.addEventListener("load", show, { once: true });
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener("load", show);
        };
    }, [pathname]);

    return (
        <Modal
            isModalOpen={open}
            setIsModalOpen={setOpen}
            label={`About ${DEVELOPER.name}`}
        >
            <div className="text-center">
                <img
                    src={photo}
                    alt={DEVELOPER.name}
                    width="96"
                    height="96"
                    className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-orange-100"
                />

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                    Hello, my name is {DEVELOPER.name}
                </h2>

                <p className="mt-1 text-sm font-semibold text-orange-600">
                    {DEVELOPER.title}
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                    This project is a full-stack authentication system I built with React
                    and Spring Boot. It demonstrates JWT sessions with refresh-token
                    rotation, email OTP verification, account lockout, and secure
                    password/email recovery — the production-grade parts of auth
                    most projects get wrong.
                </p>

                <p className="mt-3 text-slate-600">
                    Have a project or a role in mind? Let's talk.
                </p>

                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {skills.map((skill) => (
                        <li
                            key={skill}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                            {skill}
                        </li>
                    ))}
                </ul>

                <a
                    href={buildWhatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                    <FaWhatsapp size={18} />
                    Hire me
                </a>
            </div>
        </Modal>
    );
};

export default DeveloperPopup;