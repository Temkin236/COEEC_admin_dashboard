
import React from "react";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface AboutHistorySectionProps {
  sectionLabel?: string;
  sectionTitle: string;
  sectionDescription: string;
  sectionImage: string;
  timeline: TimelineItem[];
}

const AboutHistorySection: React.FC<AboutHistorySectionProps> = ({
  sectionLabel = "Our Journey",
  sectionTitle,
  sectionDescription,
  sectionImage,
  timeline,
}) => {
  return (
    <section className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 py-20 px-2 md:px-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start rounded-3xl shadow-2xl bg-white/90 p-8 md:p-16">
        {/* Left: Section Title, Description, Image */}
        <div className="flex flex-col items-center md:items-start">
          <span className="uppercase text-base font-bold text-orange-600 tracking-widest mb-3">{sectionLabel}</span>
          <h2 className="text-5xl font-extrabold text-blue-900 mb-6 leading-tight drop-shadow-lg">{sectionTitle}</h2>
          <p className="text-gray-700 mb-8 text-xl font-medium leading-relaxed">{sectionDescription}</p>
          {sectionImage && (
            <img
              src={sectionImage}
              alt="History Section"
              className="w-full max-w-lg h-80 rounded-2xl shadow-xl object-cover mb-4 border-4 border-blue-100"
              style={{ boxShadow: '0 12px 48px 0 rgba(60,60,60,0.13)' }}
            />
          )}
        </div>
        {/* Right: Timeline */}
        <div className="relative w-full">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-200 rounded-full" style={{ zIndex: 0 }} />
          <ol className="relative z-10">
            {timeline.map((item, idx) => (
              <li key={idx} className="mb-16 flex items-start relative group">
                <span className="flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-300 rounded-full text-blue-900 font-extrabold text-2xl shadow-lg absolute -left-10 top-0 group-hover:scale-110 transition-transform duration-200" style={{ zIndex: 10 }}>
                  {item.year}
                </span>
                <div className="ml-16">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">{item.title}</h3>
                  <p className="text-gray-700 text-lg md:text-xl leading-relaxed">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default AboutHistorySection;
