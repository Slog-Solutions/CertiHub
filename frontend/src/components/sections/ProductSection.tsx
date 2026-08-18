"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "../product-card";

type Product = {
  id: number;
  name: string;
  description: string;
  image: string;
  features_list: string[];
};

type ProductSectionProps = {
  section: "software_development" | "lab_setup" | "product_development";
};

export function ProductSection({ section }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fallbacks: Record<string, Product[]> = {
      software_development: [
        {
          id: 1,
          name: "Custom ERP & CRM Suites",
          description: "Scalable, secure, and fully customized enterprise resource planning software to automate workflows and business intelligence.",
          image: "/assets/books.jpeg",
          features_list: ["Real-time inventory management", "Automated invoice generation", "Role-based access control"]
        },
        {
          id: 2,
          name: "Cross-Platform Mobile Apps",
          description: "High-performance React Native and Flutter mobile applications tailored for optimal user experiences on both Android and iOS.",
          image: "/assets/books.jpeg",
          features_list: ["Offline synchronization", "Push notifications engine", "Biometric authentication login"]
        },
        {
          id: 3,
          name: "E-Commerce Platforms",
          description: "Complete e-commerce suites with secure payment gateway integrations, shipping logistics tracking, and analytics dashboards.",
          image: "/assets/books.jpeg",
          features_list: ["Multi-vendor support", "Advanced discount & coupon engines", "Integrated SEO analytics"]
        }
      ],
      lab_setup: [
        {
          id: 1,
          name: "Computer Science Lab Infrastructure",
          description: "Complete software and hardware server-client architecture layout setups tailored for colleges, schools, and corporate labs.",
          image: "/assets/books.jpeg",
          features_list: ["Pre-configured developer tools", "Secure gigabit networking", "Centralized server administration logs"]
        },
        {
          id: 2,
          name: "Advanced CAD/CAM Design Labs",
          description: "Specialized graphics-accelerated workstation systems optimized for industry standard engineering simulations and layout designing.",
          image: "/assets/books.jpeg",
          features_list: ["Certified AutoCAD & SolidWorks machines", "Licensing server configurations", "Large format plotter/printer setups"]
        }
      ],
      product_development: [
        {
          id: 1,
          name: "Custom IoT Prototyping Board",
          description: "End-to-end design, custom PCB routing, and firmware programming for smart automation and telemetry systems.",
          image: "/assets/books.jpeg",
          features_list: ["ESP32 / Arduino custom schematics", "MQTT & WebSocket cloud integrations", "Industrial-grade sensor testing"]
        }
      ]
    };

    async function fetchProducts() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/api/products/?section=${section}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data && data.length > 0 ? data : fallbacks[section]);
      } catch (e) {
        console.error("Failed to fetch products, using fallbacks:", e);
        setProducts(fallbacks[section] || []);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [section]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Products:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
