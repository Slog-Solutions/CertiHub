'use client';
import Image from "next/image";
import partner1 from '../../assets/autodesk.png';
import partner2 from '../../assets/certiport.png';
import partner3 from '../../assets/eict.png';
import partner4 from '../../assets/iit.png';
import partner5 from '../../assets/institute.png';
import partner6 from '../../assets/microsoft.png';
import partner7 from '../../assets/nsdc.png';
import partner8 from '../../assets/tssc.png';
import partner9 from '../../assets/mca.png';
import partner10 from '../../assets/iso.png';
import partner11 from '../../assets/aicte.png';
import partner12 from '../../assets/msme.png';

import leafRight from '../../assets/leaf-right.png';

const partners = [
  { name: "Autodesk", logo: partner1, dataAiHint: "tech company logo" },
  { name: "Certiport", logo: partner2, dataAiHint: "software firm logo" },
  { name: "EICT", logo: partner3, dataAiHint: "education partner logo" },
  { name: "IIT", logo: partner4, dataAiHint: "startup incubator logo" },
  { name: "Institute", logo: partner5, dataAiHint: "corporate training logo" },
  { name: "Microsoft", logo: partner6, dataAiHint: "business solutions logo" },
  { name: "NSDC", logo: partner7, dataAiHint: "business solutions logo" },
  { name: "TSSC", logo: partner8, dataAiHint: "business solutions logo" },
  { name: "MCA", logo: partner9, dataAiHint: "business solutions logo" },
  { name: "ISO", logo: partner10, dataAiHint: "business solutions logo" },
  { name: "AICTE", logo: partner11, dataAiHint: "business solutions logo" },
  { name: "MSME", logo: partner12, dataAiHint: "business solutions logo" },
];

export default function Partners() {
  return (
    <section id="partners" className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
            <div className="text-sm font-semibold text-primary tracking-wide uppercase">Collaboration</div>
            <div className="w-3 h-3 bg-primary rounded-full ml-3"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-primary">Partners</span>
          </h2>
          
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/70 mx-auto mb-6 rounded-full"></div>
          
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock opportunities for collaboration and growth by learning with our esteemed industry partners. 
            Join us today to expand your horizons!
          </p>
        </div>

        {/* Logos + Side Leaves */}
        <div className="relative flex justify-center items-center">
          
          {/* Left leaf */}
          <div className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 opacity-80">
            <Image 
              src={leafRight} 
              alt="Decorative leaf" 
              width={120} 
              height={300} 
              className="scale-x-[-1] object-contain"
            />
          </div>

          {/* Logos grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
            {partners.map((partner) => (
              <div 
                key={partner.name} 
                className="group flex justify-center items-center p-4 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative w-full h-16 md:h-20 flex items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain transition-all duration-300 group-hover:scale-105"
                    data-ai-hint={partner.dataAiHint}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right leaf */}
          <div className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 opacity-80">
            <Image 
              src={leafRight} 
              alt="Decorative leaf" 
              width={120} 
              height={300} 
              className="object-contain"
            />
          </div>
        </div>

        {/* CTA Button */}
        {/* <div className="text-center mt-16">
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
            Become a Partner
          </button>
        </div> */}
      </div>
    </section>
  );
}