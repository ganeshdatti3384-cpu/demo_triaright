import React, { useEffect, useState } from "react";

const PartnersSection = () => {
  const [companies, setCompanies] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const [companiesRes, collegesRes] = await Promise.all([
          fetch("https://triaright.com/api/users/employers/companies"),
          fetch("https://triaright.com/api/colleges/collegedata"),
        ]);

        const companiesData = await companiesRes.json();
        const collegesData = await collegesRes.json();

        setCompanies(companiesData || []);
        setColleges(collegesData.colleges || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-white text-center">
        <p className="text-gray-600">Loading partners...</p>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Trusted
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Partners
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We collaborate with leading companies and prestigious institutions
            to provide the best opportunities for our students
          </p>
        </div>

        {/* Corporate Partners */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
            Corporate Partners & Recruiters
          </h3>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mx-6 px-8 py-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col items-center"
                >
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.companyName}
                      className="w-20 h-20 object-contain mb-3"
                    />
                  )}
                  <div className="text-gray-700 font-medium text-center whitespace-nowrap">
                    {company.companyName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Partners */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
            Academic Partners & Associated Institutions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {colleges.map((college, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group"
              >
                {college.collegeLogo ? (
                  <img
                    src={college.collegeLogo}
                    alt={college.collegeName}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                    {college.collegeName
                      ? college.collegeName.substring(0, 2).toUpperCase()
                      : "CL"}
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 text-sm">
                  {college.collegeName || "Unnamed College"}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Why Companies Choose Us</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Join our network of partners and access top talent, innovative
              solutions, and comprehensive training programs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">🎯</span>
              </div>
              <h4 className="font-semibold mb-2">Quality Talent</h4>
              <p className="text-blue-100 text-sm">
                Access to pre-screened, skilled candidates ready for immediate
                contribution
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">🚀</span>
              </div>
              <h4 className="font-semibold mb-2">Fast Hiring</h4>
              <p className="text-blue-100 text-sm">
                Streamlined recruitment process with reduced time-to-hire
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">📊</span>
              </div>
              <h4 className="font-semibold mb-2">Analytics</h4>
              <p className="text-blue-100 text-sm">
                Comprehensive insights and analytics on candidate performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
