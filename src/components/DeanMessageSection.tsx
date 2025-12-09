import React from "react";

interface DeanMessageSectionProps {
  leadershipLabel: string;
  sectionTitle: string;
  quote: string;
  detail: string;
  deanName: string;
  deanTitle: string;
  deanMessage: string;
  deanImage: string;
  signature?: string;
}

const DeanMessageSection: React.FC<DeanMessageSectionProps> = ({
  leadershipLabel,
  sectionTitle,
  quote,
  detail,
  deanName,
  deanTitle,
  deanMessage,
  deanImage,
  signature,
}) => {
  return (
    <section className="w-full py-12 px-2 md:px-0 flex justify-center items-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Dean Image with orange accent and name */}
        <div className="relative flex flex-col justify-end h-full">
          <div className="rounded-3xl overflow-hidden shadow-2xl relative" style={{ minHeight: 420 }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 40,
              height: 40,
              background: '#FF4B2B',
              borderTopLeftRadius: 24,
              borderBottomRightRadius: 16,
              zIndex: 2
            }} />
            {deanImage && (
              <img
                src={deanImage}
                alt={deanName}
                className="w-full h-96 object-cover"
                style={{ borderRadius: 24 }}
              />
            )}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-3xl">
              <div className="text-white text-2xl font-bold drop-shadow-lg">{deanName}</div>
              <div className="text-blue-100 text-base font-semibold tracking-widest uppercase">{deanTitle}</div>
            </div>
          </div>
        </div>
        {/* Right: Message and signature */}
        <div className="flex flex-col gap-6">
          <span className="uppercase text-base font-bold text-orange-600 tracking-widest mb-2">{leadershipLabel}</span>
          <h2 className="text-5xl font-extrabold text-blue-900 mb-4 leading-tight drop-shadow-lg">{sectionTitle}</h2>
          <blockquote className="border-l-4 border-orange-500 pl-6 italic text-2xl text-gray-700 font-medium mb-4" style={{ fontFamily: 'Georgia,serif' }}>
            “{quote}”
          </blockquote>
          <div className="text-gray-700 text-lg font-medium leading-relaxed whitespace-pre-line">{detail}</div>
          {signature && (
            <img src={signature} alt="Signature" className="w-32 mt-2" />
          )}
        </div>
      </div>
    </section>
  );
};

export default DeanMessageSection;
