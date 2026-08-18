"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./mentor.css"; // keep your custom CSS

interface Mentor {
  name: string;
  designation: string;
  image: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallbacks: Mentor[] = [
      {
        name: "Er. Narendra Kumar Yadav",
        designation: "Ex. Chairman IEI-UKSC Dehradun, FIE, IITR",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_2_qr9lpi"
      },
      {
        name: "Er. Prashant Kumar",
        designation: "Director, IEI-UKSC Civil Engineering Laboratory",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_nxs313"
      },
      {
        name: "Er. Suraj Singh",
        designation: "Director",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/suraj_ga3mmj"
      },
      {
        name: "Er. Kiran Bisht",
        designation: "Director",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/1730734550846_yxkdgm"
      },
      {
        name: "Er. Chandra Prakash Sharma",
        designation: "FIE (INDIA), Chairman   IEI-UKSC, Dehradun",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_4.48.12_PM_ofdbb5"
      },
      {
        name: "Mrs. Neeraja  Sisodia",
        designation: "Outbound Training, Soft Skill and Personality Development Expert",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_1_rsgsr6"
      },
      {
        name: "Er. Himanshu Awasthi",
        designation: "FIE, Honorary Secretary IEI-UKSC, Dehradun",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_4.48.13_PM_ofvn6j"
      },
      {
        name: "Brigadier Govind  Singh  Sisodia (Retired)",
        designation: "Outbound Training Expert",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.42_PM_sfgnu0"
      },
      {
        name: "Er. Sarthak Aggarwal",
        designation: "Software Developer Engineer  (Team Lead)",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-19_at_10.05.02_AM_kerlox"
      },
      {
        name: "Er.  Pinki Negi",
        designation: "Branch  Coordinator",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.57.41_AM_avzdsq"
      },
      {
        name: "Mr. Om Mehta",
        designation: "Center Manager",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-01_at_5.04.29_PM_ea2dfv"
      },
      {
        name: "Er. Mahadeep Chauhan",
        designation: "IOT, Drone, PLC Expert",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.57.51_AM_gwpsmu"
      },
      {
        name: "Er. Laksh Rajkumar",
        designation: "Software Development Engineer - II",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.59.43_PM_imxglb"
      },
      {
        name: "Er. Atul Thakur",
        designation: "Cyber Security, CCNA and Networking",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/07128134-1163-45ca-a4dc-0294c72d30d8_lsp6ia"
      },
      {
        name: "Er. Vinayak  Gupta",
        designation: "CAD Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.44_PM_gjse1b"
      },
      {
        name: "Er. Adarsh Kumar",
        designation: "Web Developer Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_1.48.43_PM_yudqsh"
      },
      {
        name: "Er. Jayesh Suntha",
        designation: "Software Developer  Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.44_PM_1_i659p2"
      },
      {
        name: "Er. Mohit Rawat",
        designation: "Android App Developer & IOT",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/me_profile_1_lxblam"
      },
      {
        name: "Er. Vansh  Gupta",
        designation: "Software Development Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-23_at_11.51.31_AM_schaxn"
      },
      {
        name: "Er. Harshit Bhatnagar",
        designation: "AI/ML  Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-22_at_4.43.53_PM_oc4iv2"
      },
      {
        name: "Mr. Rajesh  Pundir",
        designation: "Business Development Executive",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.02.26_AM_loloi0"
      },
      {
        name: "Er. Shubham Singh",
        designation: "Full Stack Developer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/Confident_professional_headshot_in_navy_suit_woewjk"
      },
      {
        name: "Er. Sumit Singh",
        designation: "Application Developer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/Picsart_26-03-25_16-51-45-336_1_awj45w"
      },
      {
        name: "Er. Harshit Waldia",
        designation: "AI/ML  Engineer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-03-25_at_4.22.05_PM_ngwnvn"
      },
      {
        name: "Er. Keshav Maheshwari",
        designation: "Data Analytics Intern",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/file_0000000000ac71fab6d1fc329227bbe9_1_dnus1i"
      },
      {
        name: "Er. Aryan Kashyap",
        designation: "Data Scientist Intern",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/1774269321309_f7g6t1"
      },
      {
        name: "Miss Shivangi Chandel",
        designation: "HR",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-03-28_at_4.54.46_PM_ouleg3"
      },
      {
        name: "Er. Sajal Singh",
        designation: "Cybersecurity and Networking",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-04_at_5.04.50_PM_u8mf5x"
      },
      {
        name: "Er. Sachin Singh",
        designation: "Full Stack Developer Intern",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/7768803e-6657-4f94-afac-1afa5c2d1929_mas0tr"
      },
      {
        name: "Er. Himanshu Panwar",
        designation: "Full Stack Developer Intern",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-06_at_5.24.28_PM_yq17me"
      },
      {
        name: "Er. Sahil Negi",
        designation: "AI/ML  Developer",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-05-14_at_10.53.48_AM_haldr9"
      },
      {
        name: "Er. Ayush Kulhari",
        designation: "Cyber Security",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/IMG_3593_sasvrp"
      },
      {
        name: "Miss Srishty",
        designation: "HR Intern",
        image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-05-14_at_11.02.49_AM_j5d6vg"
      }
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${API_URL}/api/mentors/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setMentors(data && data.length > 0 ? data : fallbacks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error, using static mentors:", err);
        setMentors(fallbacks);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-stone-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-teal-800 to-blue-900 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block mb-4 text-sm font-semibold tracking-wider text-teal-600 uppercase">
            Introducing Our Professionals
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Team that powers <span className="text-teal-600">Slog</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white leading-relaxed">
            Learn from industry leaders and passionate educators dedicated to your success.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* Grid of mentors (no slider) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="flip-card perspective opacity-100 transition-opacity duration-500"
            >
              <div className="flip-card-inner">
                {/* Front Face */}
                <div className="flip-card-front bg-white">
                  <div className="relative w-full h-80">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      fill
                      className="object-cover w-full h-full"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-stone-900/10 to-transparent"></div>
                  </div>
                </div>
                {/* Back Face */}
                <div className="flip-card-back">
                  <div className="w-full h-full flex flex-col justify-center items-center p-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-1">
                      {mentor.name}
                    </h2>
                    <p className="text-stone-700 text-base font-medium">
                      {mentor.designation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
