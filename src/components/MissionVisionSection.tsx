import React from "react";

import { AimOutlined, EyeOutlined, BulbOutlined, HeartOutlined, ThunderboltOutlined, CodeOutlined, LaptopOutlined, RocketOutlined } from "@ant-design/icons";

interface MissionVisionSectionProps {
  mission: string;
  vision: string;
  missionIcon?: string;
  visionIcon?: string;
  missionTitle?: string;
  visionTitle?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  AimOutlined: <AimOutlined style={{ fontSize: 56, color: '#23456A' }} />,
  EyeOutlined: <EyeOutlined style={{ fontSize: 56, color: '#FF4B2B' }} />,
  BulbOutlined: <BulbOutlined style={{ fontSize: 56, color: '#23456A' }} />,
  HeartOutlined: <HeartOutlined style={{ fontSize: 56, color: '#FF4B2B' }} />,
  ThunderboltOutlined: <ThunderboltOutlined style={{ fontSize: 56, color: '#FFB300' }} />,
  CodeOutlined: <CodeOutlined style={{ fontSize: 56, color: '#23456A' }} />,
  LaptopOutlined: <LaptopOutlined style={{ fontSize: 56, color: '#23456A' }} />,
  RocketOutlined: <RocketOutlined style={{ fontSize: 56, color: '#FF4B2B' }} />,
};

const MissionVisionSection: React.FC<MissionVisionSectionProps> = ({ mission, vision, missionIcon = 'AimOutlined', visionIcon = 'EyeOutlined', missionTitle = 'Our Mission', visionTitle = 'Our Vision' }) => {
  return (
    <section className="w-full py-12 px-2 md:px-0 flex justify-center items-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 8px 32px 0 rgba(60,60,60,0.13)',
            minHeight: 340,
            border: 'none',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="mb-6 flex items-center">
            <span className="inline-block mr-4">
              {iconMap[missionIcon]}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{missionTitle}</h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">{mission}</p>
          <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-gray-100 rounded-bl-full" style={{ zIndex: 0 }} />
        </div>
        {/* Vision Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2451A6 0%, #0B2547 100%)',
            borderRadius: 24,
            boxShadow: '0 8px 32px 0 rgba(60,60,60,0.13)',
            minHeight: 340,
            border: 'none',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="mb-6 flex items-center">
            <span className="inline-block mr-4">
              {iconMap[visionIcon]}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{visionTitle}</h2>
          </div>
          <p className="text-lg md:text-xl text-white font-medium leading-relaxed">{vision}</p>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
