"use client"

import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContent } from "@/store/slices/contentSlice"

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { homepage, departments, news } = useAppSelector((s) => s.content as any)

  useEffect(() => {
    dispatch(fetchContent({ type: "homepage" }) as any)
    dispatch(fetchContent({ type: "departments" }) as any)
    dispatch(fetchContent({ type: "news" }) as any)
  }, [dispatch])

  useEffect(() => {
    console.log('HomePage homepageItems:', homepageItems)
    console.log('campusLifeItem:', campusLifeItem)
    console.log('eventsItems:', eventsItems)
    console.log('partnersItem:', partnersItem)
  }, [homepageItems, campusLifeItem, eventsItems, partnersItem])

  // Normalize content: backend may return arrays in different shapes, guard against that
  const homepageItems = Array.isArray(homepage?.items) ? homepage.items : Array.isArray(homepage) ? homepage : []
  // hero item from homepage content (type === 'hero')
  const hero = (homepageItems || []).find((i: any) => i && i.type === "hero") || {
    title: "SEEK WISDOM, ELEVATE YOUR INTELLECT",
    subtitle: "",
    description: "COEEC provides an exceptional educational experience that prepares students for successful completion, employability, and job creation in the digital age.",
    image: "/downloads/astu-building.jpg",
  }

  const newsItems = (homepageItems || []).filter((i: any) => i && (i.type === "news" || i.type === "whatsnew"))
  const campusLifeItem = (homepageItems || []).find((i: any) => i && i.type === "campuslife")
  const eventsItems = (homepageItems || []).filter((i: any) => i && i.type === "events")
  const partnersItem = (homepageItems || []).find((i: any) => i && i.type === "partners")

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-900 to-blue-700 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="flex items-center gap-3">
          <img src="/downloads/astu-logo.png" alt="COEEC Logo" className="h-12 w-12 rounded-full border" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">COEEC</h1>
            <p className="text-xs text-gray-600 tracking-wide">COLLEGE OF ELECTRICAL ENGINEERING</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <a href="#/" className="hover:text-blue-700">HOME</a>
          <a href="#/about" className="hover:text-blue-700">ABOUT US</a>
          <a href="#" className="hover:text-blue-700">ACADEMICS</a>
          <a href="#" className="hover:text-blue-700">RESEARCH</a>
          <a href="#" className="hover:text-blue-700">STUDENTS</a>
          <a href="#" className="hover:text-blue-700">NEWS & EVENTS</a>
          <a href="#" className="hover:text-blue-700">CONTACT US</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/1920/600?random=20)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-white text-5xl font-bold">About the College</h1>
        </div>
      </section>

      {/* Dean's Message */}
      <section className="bg-white py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Dr. Berhanu Bulcha</h2>
            <p className="text-gray-600 mb-2">DEAN, COEEC</p>
            <h3 className="text-2xl font-semibold mb-4">Building the Future of Engineering</h3>
            <blockquote className="text-gray-700 italic mb-4">
              "We are not just teaching engineering; we are cultivating the mindset of innovation that will drive Ethiopia's digital transformation. Our students are the architects of tomorrow."
            </blockquote>
            <p className="text-gray-700 mb-4">
              Welcome to the College of Electrical Engineering and Computing (COEEC). For over three decades, we have been at the forefront of technological advancement in the region. Our curriculum balances rigorous theoretical foundations with hands-on practical experience, ensuring our graduates are industry-ready from day one.
            </p>
            <p className="text-gray-700">
              I invite you to explore our vibrant community, where cutting-edge research meets social impact.
            </p>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" alt="Signature" className="mt-4 w-32" />
          </div>
          <div>
            <img src="https://picsum.photos/600/700?random=30" alt="Dean Dr. Berhanu Bulcha" className="w-full rounded-lg shadow-md" />
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="bg-gray-50 py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Strategic Pillars</h2>
          <p className="text-gray-600">The core principles that guide our academic and operational excellence.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Our Mission</h3>
            <p className="text-gray-700">To produce competent, innovative, and ethical professionals in electrical engineering and computing through quality education, problem-solving research, and community-oriented services that contribute to the sustainable development of the nation.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Our Vision</h3>
            <p className="text-gray-700">To be a premier center of excellence in applied engineering and computing in East Africa by 2030, recognized for high-quality graduates and impactful innovations.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Values</h3>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Excellence:</strong> Striving for the highest standards in teaching and research.</li>
              <li><strong>Inclusivity:</strong> Fostering a diverse and welcoming academic environment.</li>
              <li><strong>Integrity:</strong> Upholding honesty, ethics, and accountability in all actions.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Three Decades of Growth */}
      <section className="bg-white py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Three Decades of Growth</h2>
          <p className="text-gray-600">From a small department to a leading college, our history is defined by resilience, expansion, and a relentless pursuit of academic quality.</p>
        </div>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <img src="https://picsum.photos/400/300?random=35" alt="Old Campus" className="w-64 h-48 rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-2">1993 - Foundation</h3>
              <p className="text-gray-700">Established as the Department of Electrical Engineering under Nazareth Technical College.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 flex-row-reverse">
            <div className="flex-shrink-0">
              <img src="https://picsum.photos/400/300?random=36" alt="University Status" className="w-64 h-48 rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-2">2006 - University Status</h3>
              <p className="text-gray-700">Upgraded to Adama University, expanding programs to include Computer Science.</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <img src="https://picsum.photos/400/300?random=37" alt="Center of Excellence" className="w-64 h-48 rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-2">2011 - Center of Excellence</h3>
              <p className="text-gray-700">Designated as a Science and Technology University (ASTU) by the Ministry of Education.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 flex-row-reverse">
            <div className="flex-shrink-0">
              <img src="https://picsum.photos/400/300?random=38" alt="New Complex" className="w-64 h-48 rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-2">2018 - New Complex</h3>
              <p className="text-gray-700">Inauguration of the dedicated COEEC building with state-of-the-art laboratories.</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <img src="https://picsum.photos/400/300?random=39" alt="PhD Programs" className="w-64 h-48 rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-2">2023 - PhD Programs</h3>
              <p className="text-gray-700">Launched PhD programs in Power Engineering and Software Engineering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Administration */}
      <section className="bg-gray-50 py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Administration</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img src="https://picsum.photos/300/300?random=30" alt="Dr. Berhanu Bulcha" className="w-32 h-32 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Dr. Berhanu Bulcha</h3>
            <p className="text-gray-600">DEAN</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img src="https://picsum.photos/300/300?random=7" alt="Dr. Sarah Ahmed" className="w-32 h-32 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Dr. Sarah Ahmed</h3>
            <p className="text-gray-600">VICE DEAN, ACADEMICS</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img src="https://picsum.photos/300/300?random=8" alt="Mr. Dawit Tadesse" className="w-32 h-32 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Mr. Dawit Tadesse</h3>
            <p className="text-gray-600">VICE DEAN, RESEARCH</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img src="https://picsum.photos/300/300?random=9" alt="Ms. Tigist Alemu" className="w-32 h-32 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Ms. Tigist Alemu</h3>
            <p className="text-gray-600">HEAD, ADMINISTRATION</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-8">
        <div className="max-w-6xl mx-auto text-center text-gray-200 text-sm">
          © 2025 Adama Science and Technology University. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default HomePage
