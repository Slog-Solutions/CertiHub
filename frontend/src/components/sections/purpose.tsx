'use client'
import React from 'react';

const PurposeSection = () => {
  return (
      <div className="purpose-container bg-white px-4" id="aboutus">
  <div className="relative text-center px-6 py-12 border border-sky-400 rounded-lg bg-white shadow-lg mb-10">
    {/* Heading */}
    <h2 className="text-3xl font-bold text-black mb-4">
      Our Purpose:
    </h2>

    {/* Paragraph */}
    <p className="text-2xl text-black leading-relaxed">
  Our purpose is to empower individuals, organizations, and communities by 
  fostering innovation, building sustainable solutions, and creating meaningful 
  opportunities. We are committed to amplifying human potential through 
  technology, collaboration, and continuous growth, enabling a brighter and 
  more inclusive future for all.
</p>

  </div>

      <h2 className="text-3xl font-extrabold text-black mb-4 text-center">
          About US
        </h2>
        <p className='text-center mb-10'>Learn & Grow Your Skills From Anywhere</p>
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Projects Successfully Delivered</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Successful Training Programs</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">15k+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
      </div>

      <style jsx>{`
        .purpose-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: tungstenw05-medium, Oswald, sans-serif;
          color: #333;
        }
        
        .purpose-box {
          border: 2px solid #e0e0e0;
          border-radius: 0 20px 20px 20px;
          padding: 30px;
          margin-bottom: 40px;
          max-width: 700px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 15px 0;
          color: #2c2c2c;
        }
        
        .purpose-text {
          font-size: 22px;
          line-height: 1.4;
          margin: 0;
          color: #2c2c2c;
        }
        
        .about-section {
          margin-bottom: 50px;
        }
        
        .about-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #2c2c2c;
        }
        
        .about-description {
          font-size: 18px;
          line-height: 1.4;
          margin: 0;
          color: #555;
        }
        
        .stats-container {
          display: flex;
              justify-content: space-evenly;
              text-align: center;
              width: 100%; 
        }
        
        .stat-item {
          flex: 1;
          min-width: 200px;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #2c2c2c;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 16px;
          line-height: 1.4;
          color: #555;
        }
        
        @media (max-width: 768px) {
          .stats-container {
            flex-direction: column;
            gap: 30px;
          }
          
          .purpose-text, .about-description {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default PurposeSection;