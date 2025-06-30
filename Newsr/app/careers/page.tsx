'use client';

import { useState } from 'react';
import { FaCode, FaLaptopCode, FaServer, FaCloud, FaChartBar, FaUsers, FaEnvelope, FaMapPin, FaClock, FaGraduationCap } from 'react-icons/fa';

export default function CareersPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const toggleRole = (roleId: string) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  const positions = [
    {
      id: 'fullstack-developer',
      title: 'Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaCode className="h-8 w-8 text-blue-600" />,
      summary: 'Build and maintain our news platform using modern web technologies across the entire stack.',
      responsibilities: [
        'Develop responsive web applications using React, Next.js, and TypeScript',
        'Design and implement RESTful APIs and GraphQL endpoints',
        'Work with databases (PostgreSQL, MongoDB) and cloud services (AWS, Vercel)',
        'Collaborate with designers to implement pixel-perfect UI/UX designs',
        'Write clean, maintainable code with comprehensive test coverage',
        'Participate in code reviews and maintain high development standards',
        'Optimize application performance and ensure scalability',
        'Troubleshoot and debug complex technical issues'
      ],
      required: [
        'Bachelor\'s degree in Computer Science, Engineering, or related field',
        '3+ years of experience in full-stack web development',
        'Proficiency in JavaScript/TypeScript, React, and Node.js',
        'Experience with modern frameworks (Next.js, Express.js)',
        'Knowledge of SQL and NoSQL databases',
        'Understanding of RESTful API design and implementation',
        'Experience with version control systems (Git)',
        'Strong problem-solving and debugging skills'
      ],
      preferred: [
        'Experience with cloud platforms (AWS, GCP, Azure)',
        'Knowledge of containerization (Docker, Kubernetes)',
        'Familiarity with CI/CD pipelines',
        'Experience with media/news platforms',
        'Understanding of SEO and web performance optimization',
        'Experience with real-time data processing'
      ]
    },
    {
      id: 'frontend-engineer',
      title: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaLaptopCode className="h-8 w-8 text-blue-600" />,
      summary: 'Create exceptional user experiences for our news platform with modern frontend technologies.',
      responsibilities: [
        'Build responsive, accessible web interfaces using React and Next.js',
        'Implement complex UI components and interactive features',
        'Optimize frontend performance and ensure cross-browser compatibility',
        'Collaborate with UX/UI designers to translate designs into code',
        'Implement automated testing for frontend components',
        'Ensure web accessibility standards (WCAG) compliance',
        'Work with backend teams to integrate APIs and data services',
        'Maintain and improve existing codebase'
      ],
      required: [
        'Bachelor\'s degree in Computer Science, Design, or related field',
        '2+ years of frontend development experience',
        'Expert knowledge of HTML5, CSS3, and JavaScript/TypeScript',
        'Strong experience with React and modern JavaScript frameworks',
        'Proficiency in responsive design and CSS preprocessors',
        'Experience with frontend build tools (Webpack, Vite)',
        'Understanding of web accessibility and performance optimization',
        'Experience with version control and collaborative development'
      ],
      preferred: [
        'Experience with Next.js and server-side rendering',
        'Knowledge of design systems and component libraries',
        'Familiarity with testing frameworks (Jest, Cypress)',
        'Experience with progressive web app (PWA) development',
        'Understanding of SEO best practices',
        'Experience with content management systems'
      ]
    },
    {
      id: 'backend-developer',
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaServer className="h-8 w-8 text-blue-600" />,
      summary: 'Build robust, scalable backend systems that power our news platform and data processing.',
      responsibilities: [
        'Design and develop scalable REST APIs and GraphQL services',
        'Build and maintain database schemas and data models',
        'Implement authentication, authorization, and security measures',
        'Develop data processing pipelines for news content and analytics',
        'Optimize database queries and system performance',
        'Integrate third-party APIs and services',
        'Implement automated testing and monitoring systems',
        'Collaborate with frontend teams on API design and documentation'
      ],
      required: [
        'Bachelor\'s degree in Computer Science, Engineering, or related field',
        '3+ years of backend development experience',
        'Strong proficiency in Node.js, Python, or similar languages',
        'Experience with database design (PostgreSQL, MongoDB)',
        'Knowledge of API design principles and best practices',
        'Understanding of authentication and security protocols',
        'Experience with cloud services and deployment',
        'Familiarity with automated testing and CI/CD'
      ],
      preferred: [
        'Experience with microservices architecture',
        'Knowledge of message queues and event-driven architecture',
        'Familiarity with caching strategies (Redis, Memcached)',
        'Experience with data analytics and processing frameworks',
        'Understanding of DevOps practices and containerization',
        'Experience with real-time data streaming'
      ]
    },
    {
      id: 'devops-engineer',
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaCloud className="h-8 w-8 text-blue-600" />,
      summary: 'Manage our infrastructure, deployment pipelines, and ensure platform reliability and scalability.',
      responsibilities: [
        'Design and maintain cloud infrastructure on AWS/GCP/Azure',
        'Implement and manage CI/CD pipelines for automated deployments',
        'Monitor system performance and implement alerting systems',
        'Manage containerization with Docker and orchestration with Kubernetes',
        'Implement security best practices and compliance measures',
        'Automate infrastructure provisioning and configuration management',
        'Optimize costs and resource utilization across cloud services',
        'Collaborate with development teams on deployment strategies'
      ],
      required: [
        'Bachelor\'s degree in Computer Science, Engineering, or related field',
        '3+ years of DevOps or infrastructure experience',
        'Strong experience with cloud platforms (AWS, GCP, or Azure)',
        'Proficiency in containerization technologies (Docker, Kubernetes)',
        'Experience with Infrastructure as Code (Terraform, CloudFormation)',
        'Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
        'Understanding of monitoring and logging solutions',
        'Experience with scripting languages (Bash, Python)'
      ],
      preferred: [
        'Certifications in cloud platforms (AWS Solutions Architect, etc.)',
        'Experience with service mesh technologies (Istio, Linkerd)',
        'Knowledge of security scanning and compliance tools',
        'Familiarity with database administration and backup strategies',
        'Experience with content delivery networks (CDN)',
        'Understanding of network security and VPN configurations'
      ]
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaChartBar className="h-8 w-8 text-blue-600" />,
      summary: 'Analyze user behavior, content performance, and business metrics to drive data-driven decisions.',
      responsibilities: [
        'Analyze user engagement, content performance, and platform metrics',
        'Create comprehensive dashboards and reports for stakeholders',
        'Develop predictive models for content recommendation and user behavior',
        'Conduct A/B tests and statistical analysis of product features',
        'Collaborate with engineering teams to implement tracking and analytics',
        'Identify trends and insights to improve user experience and engagement',
        'Build automated reporting systems and data pipelines',
        'Present findings and recommendations to leadership team'
      ],
      required: [
        'Bachelor\'s degree in Statistics, Mathematics, Economics, or related field',
        '2+ years of experience in data analysis or related role',
        'Strong proficiency in SQL and data querying',
        'Experience with data visualization tools (Tableau, Power BI, or similar)',
        'Knowledge of statistical analysis and hypothesis testing',
        'Proficiency in Python or R for data analysis',
        'Understanding of web analytics and user behavior tracking',
        'Strong communication skills for presenting complex data insights'
      ],
      preferred: [
        'Experience with machine learning and predictive modeling',
        'Knowledge of news/media industry metrics and KPIs',
        'Familiarity with Google Analytics, Mixpanel, or similar platforms',
        'Experience with big data tools (Apache Spark, Hadoop)',
        'Understanding of data warehouse concepts and ETL processes',
        'Experience with A/B testing platforms and experimental design'
      ]
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      icon: <FaUsers className="h-8 w-8 text-blue-600" />,
      summary: 'Drive product strategy and roadmap for our news platform, ensuring we deliver value to our users.',
      responsibilities: [
        'Define product vision, strategy, and roadmap for news platform features',
        'Conduct user research and gather feedback to inform product decisions',
        'Collaborate with engineering, design, and analytics teams',
        'Write detailed product requirements and user stories',
        'Prioritize features and manage product backlog',
        'Analyze market trends and competitive landscape',
        'Define and track key product metrics and success criteria',
        'Communicate product updates and strategy to stakeholders'
      ],
      required: [
        'Bachelor\'s degree in Business, Engineering, or related field',
        '3+ years of product management experience, preferably in media/tech',
        'Strong analytical and problem-solving skills',
        'Experience with product management tools (Jira, Confluence, etc.)',
        'Understanding of user-centered design principles',
        'Excellent communication and stakeholder management skills',
        'Experience with agile development methodologies',
        'Data-driven decision making and metrics-focused mindset'
      ],
      preferred: [
        'MBA or advanced degree in relevant field',
        'Experience in news, media, or content platforms',
        'Knowledge of SEO, content strategy, and digital marketing',
        'Experience with user research and usability testing',
        'Understanding of technical architecture and development processes',
        'Experience with growth hacking and user acquisition strategies'
      ]
    }
  ];

  const companyBenefits = [
    'Competitive salary and equity package',
    'Comprehensive health, dental, and vision insurance',
    'Flexible remote work environment',
    'Professional development budget ($2,000/year)',
    'Latest technology and equipment provided',
    'Flexible PTO and work-life balance focus',
    'Opportunity to shape the future of digital news',
    'Collaborative and innovative team culture'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Join Our Team</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Help us build the future of digital news with innovative technology and exceptional user experiences.
        </p>
      </div>

      {/* Company Culture Section */}
      <div className="bg-blue-600 text-white rounded-lg mb-16 overflow-hidden">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Work at Newsr?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="mb-4">
                We're building a news platform that prioritizes accuracy, accessibility, and user experience. 
                Our goal is to inform and engage audiences with high-quality journalism and cutting-edge technology.
              </p>
              <p>
                Join us in creating a platform that makes a real difference in how people consume and interact with news.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Culture</h3>
              <p className="mb-4">
                We believe in fostering an environment of innovation, collaboration, and continuous learning. 
                Our team values diversity, creativity, and the pursuit of excellence in everything we do.
              </p>
              <p>
                We're committed to work-life balance and providing the resources you need to grow professionally and personally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-16 overflow-hidden">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Benefits & Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Open Positions
        </h2>
        
        <div className="space-y-6">
          {positions.map((position) => (
            <div key={position.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleRole(position.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {position.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center">
                          <FaUsers className="mr-1" />
                          {position.department}
                        </span>
                        <span className="flex items-center">
                          <FaMapPin className="mr-1" />
                          {position.location}
                        </span>
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {position.type}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {position.summary}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    {expandedRole === position.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {expandedRole === position.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        {position.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {responsibility}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Required Qualifications
                      </h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                        {position.required.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Preferred Skills
                      </h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        {position.preferred.map((skill, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                    <a
                      href={`mailto:dakota@newsr.io?subject=Application for ${position.title}&body=Hi Dakota,%0D%0A%0D%0AI'm interested in the ${position.title} position at Newsr. Please find my resume attached.%0D%0A%0D%0AThank you for your consideration.`}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaEnvelope className="mr-2" />
                      Apply for this Position
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Application Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Submit Application</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Send your resume and cover letter to dakota@newsr.io with the position title in the subject line.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Initial Interview</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll schedule a video call to discuss your background, experience, and interest in the role.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Technical Assessment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete a practical assessment relevant to the role, followed by a technical discussion.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Questions about our positions or application process? 
              <a href="mailto:dakota@newsr.io" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Contact us directly
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 