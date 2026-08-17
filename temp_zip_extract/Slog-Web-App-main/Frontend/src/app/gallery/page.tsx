

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type GalleryImage = {
  id: number;
  title?: string;
  image: string;
  category: string;
  created_at: string;
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    fetch(`${API_URL}/api/gallery/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch gallery");
        return res.json();
      })
      .then((data: GalleryImage[]) => {
        const updated = data.map((img) => ({
          ...img,
          image: img.image.startsWith("http")
            ? img.image
            : `${API_URL}${img.image}`,
        }));
        setImages(updated);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching gallery:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600">
        Loading Gallery...
      </div>
    );
  }

  // Group images by category
  const groupedImages = images.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  return (
    <section className="min-h-screen bg-gradient-to-r from-teal-800 to-blue-900 py-16 px-6">
      <div className="text-center mb-16">
        <motion.h1
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Stunning Gallery
        </motion.h1>
        <p className="mt-4 text-gray-200 text-lg">
          Explore memories grouped beautifully by categories
        </p>
      </div>

      {/* Render categories in columns */}
      <div className="flex flex-row flex-wrap gap-8">
        {Object.entries(groupedImages).map(([category, imgs], catIndex) => (
          <motion.div
            key={category}
            className="min-w-[300px] flex-1 mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: catIndex * 0.2 }}
            viewport={{ once: true }}
          >
            {/* Category heading */}
            <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-teal-400 pl-4">
              {category}
            </h2>

            {/* Images in a single column */}
            <div className="grid grid-cols-1 gap-6">
              {imgs.map((img, index) => (
                <motion.div
                  key={img.id}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image */}
                  <img
                    src={img.image}
                    alt={img.title || "Gallery Image"}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <motion.div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-4">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">
                        {img.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-gray-300">
                        {new Date(img.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>

                  {/* Glow shadow */}
                  <motion.div className="absolute inset-0 rounded-3xl bg-teal-300/30 -z-10 blur-xl opacity-0 group-hover:opacity-100 transition" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* No images fallback */}
      {images.length === 0 && (
        <div className="text-center text-white mt-12 text-lg">
          No images uploaded yet.
        </div>
      )}
    </section>
  );
}