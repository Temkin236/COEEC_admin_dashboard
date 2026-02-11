import React from 'react';
import { TrophyOutlined, TeamOutlined, CheckCircleOutlined, StarOutlined, SafetyCertificateOutlined, SmileOutlined, HeartOutlined } from '@ant-design/icons';
import AboutHistorySection from "@/components/AboutHistorySection";
import MissionVisionSection from "@/components/MissionVisionSection";
import DeanMessageSection from "@/components/DeanMessageSection";

interface AboutPreviewProps {
  activeTab: string;
  form: any;
  about: any;
  historyItems: any[];
  coreValues: any[];
  admins: any[];
  previewKey: number;
}

const AboutPreview: React.FC<AboutPreviewProps> = ({ 
  activeTab, 
  form, 
  about, 
  historyItems, 
  coreValues, 
  admins, 
  previewKey 
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-blue-900 border-t pt-8">Live Preview</h2>

      {activeTab === "1" && (
            <AboutHistorySection
              sectionLabel={form.getFieldValue('historySectionLabel') || about.items[0]?.historySectionLabel || 'Our Journey'}
              sectionTitle={form.getFieldValue('historySectionTitle') || about.items[0]?.historySectionTitle || 'Three Decades of Growth'}
              sectionDescription={form.getFieldValue('historySectionDescription') || about.items[0]?.historySectionDescription || 'From a small department to a leading college, our history is defined by resilience, expansion, and a relentless pursuit of academic quality.'}
              sectionImage={form.getFieldValue('historySectionImage') || about.items[0]?.historySectionImage || 'https://picsum.photos/400/300?random=35'}
              timeline={historyItems.length > 0 ? historyItems : about.items[0]?.historyItems || []}
            />
      )}
    
      {activeTab === "2" && (
        <MissionVisionSection
          mission={form.getFieldValue('mission') || about.items[0]?.mission || ''}
          vision={form.getFieldValue('vision') || about.items[0]?.vision || ''}
          missionIcon={form.getFieldValue('missionIcon') || about.items[0]?.missionIcon || 'AimOutlined'}
          visionIcon={form.getFieldValue('visionIcon') || about.items[0]?.visionIcon || 'EyeOutlined'}
          missionTitle={form.getFieldValue('missionTitle') || about.items[0]?.missionTitle || 'Our Mission'}
          visionTitle={form.getFieldValue('visionTitle') || about.items[0]?.visionTitle || 'Our Vision'}
        />
      )}
      {activeTab === "3" && (
        <DeanMessageSection
          leadershipLabel={form.getFieldValue('deanLeadershipLabel') || about.items[0]?.deanLeadershipLabel || 'LEADERSHIP'}
          sectionTitle={form.getFieldValue('deanSectionTitle') || about.items[0]?.deanSectionTitle || 'Building the Future of Engineering'}
          quote={form.getFieldValue('deanQuote') || about.items[0]?.deanQuote || 'We are not just teaching engineering; we are cultivating the mindset of innovation that will drive Ethiopia\'s digital transformation. Our students are the architects of tomorrow.'}
          detail={form.getFieldValue('deanDetail') || about.items[0]?.deanDetail || 'Welcome to the College of Electrical Engineering and Computing (COEEC). For over three decades, we have been at the forefront of technological advancement in the region. Our curriculum balances rigorous theoretical foundations with hands-on practical experience, ensuring our graduates are industry-ready from day one.\nI invite you to explore our vibrant community, where cutting-edge research meets social impact.'}
          deanName={form.getFieldValue('deanName') || about.items[0]?.deanName || ''}
          deanTitle={form.getFieldValue('deanTitle') || about.items[0]?.deanTitle || ''}
          deanMessage={form.getFieldValue('deanMessage') || about.items[0]?.deanMessage || ''}
          deanImage={form.getFieldValue('deanImage') || about.items[0]?.deanImage || ''}
          signature={form.getFieldValue('deanSignature') || about.items[0]?.deanSignature || ''}
        />
      )}
      {activeTab === "4" && (
        <>{/* Core Values Preview */}
          <div className="flex flex-wrap gap-8 mt-8">
            {coreValues.map((value, idx) => {
              const iconMap: any = {
                TrophyOutlined: <TrophyOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                TeamOutlined: <TeamOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                CheckCircleOutlined: <CheckCircleOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                StarOutlined: <StarOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                SafetyCertificateOutlined: <SafetyCertificateOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                SmileOutlined: <SmileOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                HeartOutlined: <HeartOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
              };
              return (
                <div key={idx} className="bg-white rounded-2xl shadow p-8 w-full md:w-1/3 flex flex-col items-start border border-gray-100">
                  <div className="mb-4">{iconMap[value.icon]}</div>
                  <div className="text-2xl font-bold mb-2 text-gray-900">{value.title}</div>
                  <div className="text-lg text-gray-500">{value.description}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {activeTab === "5" && (
        <div className="flex flex-wrap justify-center gap-8 mt-8" key={previewKey}>
          {admins.map((admin, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow p-8 w-full md:w-1/4 flex flex-col items-center border border-gray-100">
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  overflow: "hidden",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px 0 rgba(60,60,60,0.07)"
                }}
              >
                {admin.image ? (
                  <img src={admin.image} alt={admin.name} style={{ width: 120, height: 120, objectFit: "cover" }} />
                ) : (
                  <div style={{ fontSize: 14, color: '#9ca3af' }}>Upload</div>
                )}
              </div>
              <div
                className="mb-1 text-center"
                style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}
              >
                {admin.name}
              </div>
              <div
                className="mb-1 text-center"
                style={{ fontSize: 18, fontWeight: 600, color: '#2b4362', letterSpacing: 0.5 }}
              >
                {admin.title}
              </div>
              <div
                className="text-center"
                style={{ fontSize: 16, fontWeight: 500, color: '#3b5b8c', letterSpacing: 0.5 }}
              >
                {admin.subtitle}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AboutPreview;
