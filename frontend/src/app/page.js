'use client';
import { Button } from '@carbon/react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { 
  Calendar, 
  UserProfile, 
  Notification, 
  Document,
  ChartLine,
  Security,
  CloudServiceManagement,
  Mobile
} from '@carbon/icons-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in and get their role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  const getRoleSpecificButton = () => {
    if (userRole === 'patient') {
      return (
        <Link href="/patient-appointment">
          <Button kind="primary">View Appointments</Button>
        </Link>
      );
    } else if (userRole === 'physician') {
      return (
        <Link href="/physician-appointment">
          <Button kind="primary">View Schedule</Button>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Medi-Connect</h1>
          <p className="hero-subtitle">Revolutionizing Healthcare Management</p>
          <p className="hero-description">
            Experience seamless healthcare coordination with our state-of-the-art platform. 
            Connect with healthcare providers, manage appointments, and take control of your health journey.
          </p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <>
                <Link href="/register">
                  <Button kind="primary">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button kind="tertiary">Sign In</Button>
                </Link>
              </>
            ) : (
              getRoleSpecificButton()
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <Image
            src="/images/hero-medical.jpg"
            alt="Modern healthcare technology"
            width={600}
            height={400}
            className="hero-image"
            priority
          />
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <h3>10K+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>500+</h3>
          <p>Healthcare Providers</p>
        </div>
        <div className="stat-card">
          <h3>50K+</h3>
          <p>Appointments Scheduled</p>
        </div>
        <div className="stat-card">
          <h3>98%</h3>
          <p>User Satisfaction</p>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Medi-Connect?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Image
              src="/images/scheduling.jpg"
              alt="Smart Scheduling"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Smart Scheduling</h3>
            <p>Book appointments with healthcare providers at your convenience. Real-time availability and instant confirmations.</p>
          </div>

          <div className="feature-card">
            <Image
              src="/images/patient-portal.jpg"
              alt="Patient Portal"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Patient Portal</h3>
            <p>Access your complete medical history, test results, and treatment plans in one secure location.</p>
          </div>

          <div className="feature-card">
            <Image
              src="/images/reminders.jpg"
              alt="Smart Reminders"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Smart Reminders</h3>
            <p>Never miss an appointment with automated reminders and follow-up notifications.</p>
          </div>

          <div className="feature-card">
            <Image
              src="/images/digital-records.jpg"
              alt="Digital Records"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Digital Records</h3>
            <p>Maintain organized, accessible, and secure digital health records for better care coordination.</p>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <h2>Key Benefits</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <Image
              src="/images/efficiency.jpg"
              alt="Improved Efficiency"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Improved Efficiency</h3>
            <p>Streamline healthcare processes and reduce administrative overhead for both patients and providers.</p>
          </div>

          <div className="benefit-card">
            <Image
              src="/images/security.jpg"
              alt="Enhanced Security"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Enhanced Security</h3>
            <p>Your health data is protected with enterprise-grade security and compliance measures.</p>
          </div>

          <div className="benefit-card">
            <Image
              src="/images/cloud.jpg"
              alt="Cloud-Based Solution"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Cloud-Based Solution</h3>
            <p>Access your healthcare information anytime, anywhere, with our reliable cloud infrastructure.</p>
          </div>

          <div className="benefit-card">
            <Image
              src="/images/mobile.jpg"
              alt="Mobile Friendly"
              width={64}
              height={64}
              className="feature-image"
            />
            <h3>Mobile Friendly</h3>
            <p>Manage your healthcare on the go with our responsive, mobile-optimized platform.</p>
          </div>
        </div>
      </section>

      <section className="image-grid">
        <div className="image-card">
          <Image
            src="/images/medical-team.jpg"
            alt="Medical Team"
            width={300}
            height={200}
            className="medical-image"
          />
          <div className="image-overlay">
            <h3>Expert Medical Team</h3>
            <p>Dedicated healthcare professionals at your service</p>
          </div>
        </div>
        <div className="image-card">
          <Image
            src="/images/technology.jpg"
            alt="Modern Technology"
            width={300}
            height={200}
            className="medical-image"
          />
          <div className="image-overlay">
            <h3>Cutting-edge Technology</h3>
            <p>State-of-the-art healthcare solutions</p>
          </div>
        </div>
        <div className="image-card">
          <Image
            src="/images/patient-care.jpg"
            alt="Patient Care"
            width={300}
            height={200}
            className="medical-image"
          />
          <div className="image-overlay">
            <h3>Personalized Care</h3>
            <p>Tailored healthcare experience for every patient</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Transform Your Healthcare Experience</h2>
        <p>Join thousands of users who have already simplified their healthcare journey with Medi-Connect.</p>
        <div className="cta-buttons">
          {!isAuthenticated ? (
            <>
              <Link href="/register">
                <Button kind="primary">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button kind="tertiary">Sign In</Button>
              </Link>
            </>
          ) : (
            getRoleSpecificButton()
          )}
        </div>
      </section>
    </div>
  );
}
