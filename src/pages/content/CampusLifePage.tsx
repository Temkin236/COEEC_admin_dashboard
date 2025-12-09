import React from "react";

const CampusLifePage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-900">
      {/* Quick Links Bar */}
      <div className="w-full bg-blue-900 text-white flex items-center px-8 py-3 gap-8">
        <span className="font-semibold italic tracking-wide text-gray-200">QUICK LINKS :</span>
        <a href="#" className="font-bold hover:underline flex items-center gap-1">LIBRARY <span aria-hidden="true">↗</span></a>
        <a href="#" className="font-bold hover:underline flex items-center gap-1">E-LEARNING <span aria-hidden="true">↗</span></a>
        <a href="#" className="font-bold hover:underline flex items-center gap-1">CAMPUS LIFE <span aria-hidden="true">↗</span></a>
        <a href="#" className="font-bold hover:underline flex items-center gap-1">ALUMNI <span aria-hidden="true">↗</span></a>
        <a href="#" className="font-bold hover:underline flex items-center gap-1">MEET OUR STAFF <span aria-hidden="true">↗</span></a>
      </div>
      {/* Background Image */}
      <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
        <img src="/downloads/campus-bg.jpg" alt="Campus" className="absolute inset-0 w-full h-full object-cover opacity-70 z-10" />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 z-10" />
        <div className="relative z-20 flex flex-col md:flex-row items-center justify-center w-full h-full px-4 md:px-0">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full md:ml-24 mb-8 md:mb-0">
            <div className="mb-2">
              <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded">EVERY CAMPUS</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-3">Events and Activities</h3>
            <p className="text-gray-700 mb-6">Our students engage in events, activities, and clubs year-round across all campuses. From holiday celebrations to club involvement and voluntary work, we offer plenty of opportunities to socialize.</p>
            <a href="#" className="text-blue-900 font-semibold hover:underline flex items-center gap-1">View Gallery <span aria-hidden="true">↗</span></a>
          </div>
          {/* Campus Life Heading */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight mb-6">CAMPUS LIFE</h2>
            <div className="bg-white bg-opacity-80 rounded-full p-4 flex items-center justify-center">
              <span className="material-icons text-blue-900 text-4xl">add</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusLifePage;
