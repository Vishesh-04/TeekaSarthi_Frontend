import React, { useEffect, useState } from "react";
import axios from "axios";
import BeneficiaryCard from "./BeneficiaryCard";
import { useNavigate } from "react-router-dom";
import { PlayCircle, IdCard, Link2, CheckCircle, LogIn, Activity } from "lucide-react";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchBeneficiaries = async () => {
  try {
    // Get the email from local storage, or use a default for testing
    const userId = localStorage.getItem("email") || "testuser100@gmail.com"; // Use the 'userId' variable and the relative path (base URL is in axios.js)

    const response = await axios.get(`api/beneficiaries/email/${userId}`);

    setBeneficiaries(response.data);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    setLoading(false);
  }
};

useEffect(() => {
  fetchBeneficiaries();
}, []);

return (
  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Left Section: Welcome and Add Button */}
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-xl text-center flex flex-col items-center justify-center">
        <img
          src="https://answers.childrenshospital.org/wp-content/uploads/2021/03/COVID-Vaccinated_image.jpg"
          alt="Family"
          className="w-48 md:w-64 mb-4 rounded-2xl shadow"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-2">
          Welcome to Teeka Sarthi
        </h2>
        <p className="text-gray-700 mb-4">
          Register your <strong>family members</strong> easily for vaccination
          to ensure timely protection.
        </p>
        <button
          onClick={() => navigate("/add-beneficiary")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Add a Family Member
        </button>
      </div>
      ‌
      {/* Right Section: Beneficiary Cards */}
      <div className="flex-1 bg-white p-6 rounded-3xl shadow-xl overflow-y-auto max-h-[80vh]">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4 text-center">
          Registered Beneficiaries
        </h3>
        {loading ? (
          <p className="text-center text-gray-600">Loading beneficiaries...</p>
        ) : beneficiaries.length === 0 ? (
          <p className="text-center text-gray-600">
            No beneficiaries registered yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {beneficiaries.map((ben) => (
              <BeneficiaryCard key={ben._id} beneficiary={ben} />
            ))}
          </div>
        )}
      </div>
    </div>
    ‌
    {/* Growth Monitoring Assessment Charts Section */}
    <section className="py-12 bg-gradient-to-b from-white to-blue-50 rounded-1xl mt-10 shadow-md">
      <div className="max-w-7xl mx-auto text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-10">
          Growth Monitoring Assessment Charts
        </h2>
        ‌
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Stunted Card */}
          <div className="bg-[#C8D64A] rounded-[4rem] shadow-xl flex flex-col items-center text-center py-8 px-4">
            <img
              src="https://www.poshantracker.in/images/NewPoshanCalculator/stunted.svg"
              alt="Stunted"
              className="w-40 h-40 mb-4"
            />
            <h3 className="text-xl font-bold text-indigo-900">Stunted</h3>
            <p className="text-indigo-900 mt-1">
              (Height for Age) <br /> 0 months to 6 years
            </p>
            <a
              href="#"
              className="text-indigo-900 font-semibold mt-4 flex items-center justify-center gap-2 hover:text-indigo-700 transition-all"
            >
              Download
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </a>
          </div>
          ‌
          {/* Wasted Card */}
          <div className="bg-[#F7B538] rounded-[4rem] shadow-xl flex flex-col items-center text-center py-8 px-4">
            <img
              src="https://www.poshantracker.in/images/NewPoshanCalculator/wasting.svg"
              alt="Wasted"
              className="w-40 h-40 mb-4"
            />
            <h3 className="text-xl font-bold text-indigo-900">Wasted</h3>
            <p className="text-indigo-900 mt-1">
              (Weight for Height) <br /> 0 months to 5 years
            </p>
            <a
              href="#"
              className="text-indigo-900 font-semibold mt-4 flex items-center justify-center gap-2 hover:text-indigo-700 transition-all"
            >
              Download
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </a>
          </div>
          ‌
          {/* Underweight Card */}
          <div className="bg-[#EB5E7A] rounded-[4rem] shadow-xl flex flex-col items-center text-center py-8 px-4">
            <img
              src="https://www.poshantracker.in/images/NewPoshanCalculator/underweight.svg"
              alt="Underweight"
              className="w-40 h-40 mb-4"
            />
            <h3 className="text-xl font-bold text-indigo-900">Underweight</h3>
            <p className="text-indigo-900 mt-1">
              (Weight for Age) <br /> 0 months to 6 years
            </p>
            <a
              href="#"
              className="text-indigo-900 font-semibold mt-4 flex items-center justify-center gap-2 hover:text-indigo-700 transition-all"
            >
              Download
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>


    {/* bottom section details about teeka sarthi */}
    <section className="flex flex-col md:flex-row items-center justify-between bg-white mt-12 px-10 py-16 rounded-3xl shadow-lg">
      {/* Left Section */}
      <div className="md:w-1/2 space-y-5">
        <h2 className="text-blue-700 text-3xl font-bold">Teeka Sarthi</h2>
        <h1 className="text-4xl font-extrabold text-blue-900 leading-tight">
          (About Teeka Sarthi)
        </h1>
        ‌
        <p className="text-gray-600 text-lg leading-relaxed">
          Teeka Sarthi is a unified digital vaccination management platform designed to simplify how families, health workers, and supervisors manage immunization data. It ensures timely vaccination, transparent reporting, and seamless coordination across all health centers.
        </p>
        ‌
        <div className="flex items-center justify-center md:justify-start mt-10">
          <div className="relative w-72 h-48 bg-gray-100 border rounded-2xl flex items-center justify-center shadow-md">
            <none className="text-red-500 w-12 h-12 absolute cursor-pointer" />
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966483.png"
              alt="ABHA illustration"
              className="w-60 h-40 object-contain opacity-80"
            />
          </div>
        </div>
      </div>
      ‌
      {/* Right Section */}
      <div className="md:w-1/2 mt-10 md:mt-0 space-y-8">
        <Feature
          icon={<IdCard className="text-white w-6 h-6" />}
          title="Smart Beneficiary Tracking"
          desc="Register and monitor vaccination records for all family members in one place."
        />
        <Feature
          icon={<Link2 className="text-white w-6 h-6" />}
          title="Automatic Reminders"
          desc="Get alerts for upcoming or missed vaccination schedules."
        />
        <Feature
          icon={<CheckCircle className="text-white w-6 h-6" />}
          title="Digital Records"
          desc="Securely access vaccination certificates and history anytime."
        />
        <Feature
          icon={<LogIn className="text-white w-6 h-6" />}
          title="Worker & Supervisor Dashboard"
          desc="Manage attendance, reports, and vaccine stock efficiently"
        />
        <Feature
          icon={<Activity className="text-white w-6 h-6" />}
          title="Community Health Insights"
          desc="Manage attendance, reports, and vaccine stock efficiently"
        />
        {/*
          <button className="mt-6 bg-blue-900 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-blue-800 transition">
            Know More →
          </button> */}
      </div>
    </section>
  </div>
);
};

const Feature = ({ icon, title, desc }) => (
  <div className="flex items-start gap-5">
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold text-blue-900">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  </div>
);

export default DashboardHome;