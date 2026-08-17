import { BookOpen, MonitorPlay, Award, Users } from 'lucide-react';

const stats = [
  {
    icon: <BookOpen className="h-10 w-10 text-white" />,
    value: "100+",
    title: "Online Courses",
    description: "Minimize errors, maximize precision"
  },
  {
    icon: <MonitorPlay className="h-10 w-10 text-white" />,
    value: "50+",
    title: "Top Instructor",
    description: "Minimize errors, maximize precision"
  },
  {
    icon: <Award className="h-10 w-10 text-white" />,
    value: "35+",
    title: "Online Certificates",
    description: "Minimize errors, maximize precision"
  },
  {
    icon: <Users className="h-10 w-10 text-white" />,
    value: "2000+",
    title: "Members",
    description: "Minimize errors, maximize precision"
  }
];

export default function WhyChooseUs() {
  return (
    <div className='bg-white'>
      
      <div className="text-center mb-12 ">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 pt-2">
              Why Choose Us?
            </h2>
        </div>
      <section id="why-us" className="pt-10 pb-12 md:pt-14 md:pb-16 bg-gray-200">

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          
          

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative p-6 text-center text-white bg-gradient-to-b from-indigo-500 to-blue-500"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)",
                  borderRadius: "8px"
                }}
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
                <p className="text-sm opacity-90">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
