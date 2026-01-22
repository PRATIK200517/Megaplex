import React from 'react';
import { Phone, Mail, Heart, MapPin, ExternalLink, School, GraduationCap, BookOpen, Users } from 'lucide-react';

const UserFooter = () => {
  return (
    <footer className="relative overflow-hidden bg-linear-to-b from-white to-gray-50 pt-16 pb-10 px-4 border-t border-gray-200">
      {/* Decorative background elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#8E1B1B]/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-linear-to-br from-[#673AB7]/5 to-[#E91E63]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-linear-to-tr from-[#8E1B1B]/5 to-[#00695C]/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* School Information & Contact */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#8E1B1B]/10 to-[#673AB7]/10 text-[#8E1B1B] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <School size={16} />
                Excellence in Education
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Z.P. Primary School <span className="text-[#8E1B1B]">Jawali</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Nurturing young minds with quality education, modern facilities,
                and a commitment to holistic development since establishment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-[#8E1B1B]/10 to-[#673AB7]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#8E1B1B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                    <p className="text-gray-600 text-sm">
                      Z.P. Primary School Jawali,<br />
                      Mahabaleshwar, Satara<br />
                      412806 Maharashtra
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-[#E91E63]/10 to-[#673AB7]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#E91E63]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a
                      href="mailto:ABC@gmail.com"
                      className="text-[#8E1B1B] hover:text-[#673AB7] transition-colors text-sm font-medium"
                    >
                      ABC@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-[#00695C]/10 to-[#26A69A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#00695C]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Contact</h4>
                    <p className="text-gray-600 text-sm">XXXXXX9090</p>
                    <p className="text-gray-500 text-xs mt-1">Mon-Fri, 9:00 AM - 5:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-[#455A64]/10 to-[#78909C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-6 h-6 text-[#455A64]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quick Links</h4>
                    <div className="flex gap-4">
                      <a
                        href="#"
                        className="text-[#8E1B1B] hover:text-[#673AB7] transition-colors text-sm font-medium"
                      >
                        Gallery
                      </a>
                      <a
                        href="#"
                        className="text-[#8E1B1B] hover:text-[#673AB7] transition-colors text-sm font-medium"
                      >
                        Alumni
                      </a>
                      <a
                        href="#"
                        className="text-[#8E1B1B] hover:text-[#673AB7] transition-colors text-sm font-medium"
                      >
                        Admissions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Social */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Important Links
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: <BookOpen size={16} />, text: 'DDU Kaushik Kendra', color: 'text-[#8E1B1B]' },
                  { icon: <GraduationCap size={16} />, text: 'Login/Register', color: 'text-[#673AB7]' },
                  { icon: <Users size={16} />, text: 'Alumni Portal', color: 'text-[#E91E63]' },
                  { icon: <School size={16} />, text: 'Admissions 2024', color: 'text-[#00695C]' },
                  { icon: <BookOpen size={16} />, text: 'Examination Portal', color: 'text-[#455A64]' },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center gap-3 group"
                    >
                      <div className={`${link.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                        {link.icon}
                      </div>
                      <span className="text-gray-700 group-hover:text-[#8E1B1B] font-medium transition-colors">
                        {link.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Interactive Map
              </h3>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 bg-linear-to-r from-[#8E1B1B] to-[#673AB7] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium text-center mb-2">
                      Visit Our Campus
                    </p>
                    <p className="text-gray-500 text-sm text-center">
                      Mahabaleshwar, Satara
                    </p>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=17.944458,73.617873"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      View on Map
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Heart size={14} className="text-[#E91E63] fill-[#E91E63]" />
                <span className="text-gray-600 font-medium">
                  Developed and maintained with passion
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Z.P. Primary School Jawali. All rights reserved.
              </p>
            </div>

            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-4">
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#8E1B1B] text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#8E1B1B] text-sm transition-colors"
                >
                  Terms of Service
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#8E1B1B] text-sm transition-colors"
                >
                  Sitemap
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                <span className="font-semibold text-[#8E1B1B]">Pratik More</span> • Full Stack Developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;