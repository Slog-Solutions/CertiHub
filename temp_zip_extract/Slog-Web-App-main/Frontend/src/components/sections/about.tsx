import { Badge } from "@/components/ui/badge";

const stats = [
    { value: "50%", label: "Reduction in identity management costs", gradient: "from-teal-300 via-cyan-400 to-blue-500" },
    { value: "98%", label: "Improvement in Employee satisfaction Indices", gradient: "from-teal-300 via-cyan-400 to-blue-500" },
    { value: "97%", label: "Fewer security related incidences", gradient: "from-teal-300 via-cyan-400 to-blue-500" },
    { value: "3X", label: "Lightning fast authentication", gradient: "from-teal-300 via-cyan-400 to-blue-500" }
]

const features = ["Affordable pricing", "Job placement support", "Lifetime access to course materials"];

export default function About() {
  return (
    <section id="about" className="py-6bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="container">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">About Us</h2>
            <p className="mt-4 text-2xl  text-gray-700">
              Learn & Grow Your Skills From Anywhere
            </p>
            <p className="   mt-6 text-gray-600 leading-relaxed text-xl">
              Slog solutions is your ideal destination for mastering software development, offering flexible, online courses that adapt to your schedule. With practical projects and a vibrant community, you gain hands-on experience and ongoing support. Whether you're a beginner or a seasoned pro, we empower your career journey.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <Badge key={index} className="bg-primary/80 text-primary-foreground text-sm py-1 px-3">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                 <div key={index} className={`p-6 md:p-8 rounded-2xl text-white bg-gradient-to-br ${stat.gradient} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <p className="text-4xl md:text-5xl font-bold">{stat.value}</p>
                    <p className="mt-2 text-sm md:text-base font-medium">{stat.label}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
