import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  Camera,
  Calendar,
  MapPin,
  Package,
  Check,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Plus,
  Eye,
  Home,
  Shield,
  Users,
  Briefcase,
  Heart,
  Trash2,
} from "lucide-react";
import axios from "../../api/axios";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const worker_code = localStorage.getItem("employeeCode");
  const worker_name = localStorage.getItem("employeeName");
  const [center_id, setCenterId] = useState(null); // Will store the DB ID (e.g. 5)
  const [worker_id, setWorkerId] = useState(null); // Will store the DB ID (e.g. 102)
  const [center_name, setCenterName] = useState("");
  const [beneficiaryData, setBeneficiaryData] = useState({});
  // --- State Management ---
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [coords, setCoords] = useState({ lat: "", lon: "" });

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showScheduleExpanded, setShowScheduleExpanded] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Data & Selection
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [location, setLocation] = useState("Getting location...");
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Notification System
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [newStock, setNewStock] = useState({
    name: "",
    currentStock: 0,
    usedStock: 0,
    receivedStock: 0,
    expiryDate: formatDate(new Date().toISOString()),
  });

  // --- Utilities ---

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const getPriority = (count) => {
    if (count >= 15) return "High";
    if (count >= 10) return "Medium";
    return "Normal";
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const fetchCenterDetails = async () => {
    if (!worker_code) return;

    try {
      // 👇 CHANGED: Use axios to ensure the 'Authorization' header is sent
      const response = await axios.get(`/api/center/worker/${worker_code}`);

      // Update State (Backend returns { centerId, centerName, workerId })
      setCenterId(response.data.centerId);
      setCenterName(response.data.centerName);
      setWorkerId(response.data.workerId);
    } catch (err) {
      console.error("Center Fetch Error:", err);
      showNotification("Could not fetch assigned center details", "error");
    }
  };
  const handleBulkDateChange = (beneficiaryId, date) => {
    setBeneficiaryData((prev) => ({
      ...prev,
      [beneficiaryId]: { ...prev[beneficiaryId], nextDueDate: date },
    }));
  };

  // Helper to update photo for a specific beneficiary
  const handleBulkPhotoChange = (beneficiaryId, file) => {
    setBeneficiaryData((prev) => ({
      ...prev,
      [beneficiaryId]: { ...prev[beneficiaryId], photo: file },
    }));
  };

  // Helper to check if a specific beneficiary has data entered
  const isBeneficiaryComplete = (id) => {
    return beneficiaryData[id]?.photo && beneficiaryData[id]?.nextDueDate;
  };

  const getStockStatus = (stock) => {
    if (
      stock.currentStock === undefined ||
      stock.currentStock === null ||
      stock.currentStock < 0
    ) {
      return { color: "text-gray-500", bg: "bg-gray-100", label: "Unknown" };
    }
    if (stock.currentStock < 75)
      return { color: "text-red-500", bg: "bg-red-100", label: "Low Stock" };
    if (stock.currentStock < 150)
      return { color: "text-yellow-500", bg: "bg-yellow-100", label: "Medium" };
    return { color: "text-green-500", bg: "bg-green-100", label: "Good Stock" };
  };

  // --- API Calls ---

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `/api/supervisor/distribution/worker/${worker_id}`
      );

      if (response.data.success) {
        console.log(response.data.data);
        setScheduleList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Schedule:", error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(
        `/api/beneficiaries/pending/${center_id}`
      );
      setPendingApprovals(response.data);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      showNotification("Error fetching beneficiaries", "error");
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`/api/stock/center/${center_id}`);
      const formattedData = response.data.map((stock) => ({
        ...stock,
        expiryDate: formatDate(stock.expiryDate) || "",
        currentStock: parseInt(stock.currentStock) || 0,
        usedStock: parseInt(stock.usedStock) || 0,
        receivedStock: parseInt(stock.receivedStock) || 0,
      }));
      setStockData(formattedData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      showNotification("Error fetching stock data", "error");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude.toString(), lon: longitude.toString() });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            if (data && data.address) {
              console.log(data.address); // Helpful for debugging

              const { city, town, village, suburb, county, state } =
                data.address;

              // Priority: City -> Town -> Village -> Suburb -> County
              const localName = city || town || village || suburb || county;

              // Set location as "City, State"
              setLocation(`${localName}, ${state}`);
            } else {
              setLocation("Location not found");
            }
          } catch (error) {
            console.error(error);
            setLocation("Error fetching location");
          }
        },
        (error) => {
          console.error("Location error", error);
          showNotification("Please enable location services", "error");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetchCenterDetails();
    getCurrentLocation();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Run WHEN worker_id is ready -> Fetch Schedule
  useEffect(() => {
    if (worker_id) {
      fetchSchedules();
    }
  }, [worker_id]);

  // 3. Run WHEN center_id is ready -> Fetch Stock & Approvals
  useEffect(() => {
    if (center_id) {
      console.log("Center ID found:", center_id, "Fetching data...");
      fetchPendingApprovals();
      fetchStockData();
    }
  }, [center_id]);

  // --- Handlers ---

  const handleLogout = () => {
    // Remove worker authentication data
    localStorage.removeItem("workerToken");
    localStorage.removeItem("workerRole"); // if you store role separately
    localStorage.removeItem("workerId"); // optional (if stored)

    localStorage.clear();
    navigate("/workerlogin", { replace: true });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. Save raw file for upload
      setRawFile(file);

      // 2. Create preview for UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto({ name: file.name, data: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyBeneficiary = async (beneficiaryId) => {
    try {
      await axios.post(`api/worker/verify/${beneficiaryId}`, {
        adharVerified: true,
        remarks: "Verified during field visit",
        workerName: worker_name,
      });

      setPendingApprovals((prev) => prev.filter((b) => b.id !== beneficiaryId));
      setSelectedBeneficiary(null);
      setShowApprovalModal(false);
      showNotification("Beneficiary verified successfully!");
    } catch (error) {
      console.error(error);
      showNotification("An error occurred while verifying", "error");
    }
  };
  const handleRejectBeneficiary = async (beneficiaryId) => {
    try {
      await axios.post(`api/worker/reject/${beneficiaryId}`, {
        adharVerified: false,
        remarks: "Verified during field visit",
        workerName: worker_name,
      });

      setPendingApprovals((prev) => prev.filter((b) => b.id !== beneficiaryId));
      setSelectedBeneficiary(null);
      setShowApprovalModal(false);
      showNotification("Beneficiary Rejected successfully!");
    } catch (error) {
      console.error(error);
      showNotification("An error occurred while Rejecting", "error");
    }
  };

  const handleApproval = (beneficiaryId, action) => {
    if (action === "approve") {
      handleVerifyBeneficiary(beneficiaryId);
      setPendingApprovals((prev) => prev.filter((b) => b.id !== beneficiaryId));
      setSelectedBeneficiary(null);
      setShowApprovalModal(false);
      showNotification("Beneficiary rejected successfully!");
    } else {
      // Handle Reject Logic
      handleRejectBeneficiary(beneficiaryId);
      setPendingApprovals((prev) => prev.filter((b) => b.id !== beneficiaryId));
      setSelectedBeneficiary(null);
      setShowApprovalModal(false);
      showNotification("Beneficiary rejected successfully!");
    }
  };

  const submitAttendance = async () => {
    // Validation: Ensure at least one beneficiary has data
    if (Object.keys(beneficiaryData).length === 0) {
      showNotification("Please update at least one beneficiary!", "error");
      return;
    }

    const token = localStorage.getItem("workerToken");
    const formData = new FormData();

    // 1. Append Standard Data
    formData.append("workerId", worker_id);
    formData.append("centerId", center_id);
    formData.append("latitude", coords.lat ? String(coords.lat) : "0");
    formData.append("longitude", coords.lon ? String(coords.lon) : "0");
    formData.append("location", location || "Unknown Location");
    
    // IMPORTANT: Send the Assignment ID (Parent Task ID)
    if (selectedSchedule?.id) {
      formData.append("taskId", selectedSchedule.id);
    }

    // 2. Append Dynamic Beneficiary Data
    // Backend expects: photo_101, date_101, photo_102, date_102, etc.
    Object.entries(beneficiaryData).forEach(([id, data]) => {
      if (data.photo) {
        formData.append(`photo_${id}`, data.photo);
      }
      if (data.nextDueDate) {
        formData.append(`date_${id}`, data.nextDueDate);
      }
    });

    try {
      // 3. Send Request
      await axios.post("/api/attendance/submit", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Axios sets boundary automatically
        },
      });

      showNotification("Attendance & Visit Details submitted successfully!");

      // 4. Update UI: Remove the completed schedule from the list
      if (selectedSchedule?.id) {
        setScheduleList((prev) =>
          prev.filter((item) => item.id !== selectedSchedule.id)
        );
      }

      // 5. Cleanup
      setShowAttendanceModal(false);
      setBeneficiaryData({});
      setSelectedSchedule(null);

    } catch (error) {
      console.error("Upload error", error);
      showNotification(
        "Failed: " + (error.response?.data || error.message),
        "error"
      );
    }
  };

  // --- Stock Management Handlers ---

  const updateLocalStock = (vaccineId, field, value) => {
    setStockData((prev) =>
      prev.map((vaccine) =>
        vaccine.id === vaccineId
          ? {
              ...vaccine,
              [field]: field === "expiryDate" ? value : parseInt(value) || 0,
            }
          : vaccine
      )
    );
  };

  const submitStockUpdate = async () => {
    try {
      const updatePromises = stockData.map((vaccine) => {
        return axios.put(`/api/stock/${vaccine.id}`, vaccine);
      });

      await Promise.all(updatePromises);
      showNotification("Stock updated successfully!");
      setShowStockModal(false);
      fetchStockData();
    } catch (error) {
      console.error("Error submitting stock update:", error);
      showNotification("Failed to submit stock update", "error");
    }
  };

  const submitNewStock = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...newStock,
        currentStock: parseInt(newStock.currentStock) || 0,
        usedStock: parseInt(newStock.usedStock) || 0,
        receivedStock: parseInt(newStock.receivedStock) || 0,
      };

      const response = await axios.post(
        `/api/stock/center/${center_id}`,
        dataToSend
      );

      const addedStock = {
        ...response.data,
        expiryDate: formatDate(response.data.expiryDate),
      };

      setStockData((prev) => [...prev, addedStock]);
      setNewStock({
        name: "",
        currentStock: 0,
        usedStock: 0,
        receivedStock: 0,
        expiryDate: formatDate(new Date().toISOString()),
      });
      showNotification(`New stock '${response.data.name}' added successfully!`);
    } catch (error) {
      console.error("Error submitting new stock:", error);
      showNotification("Failed to add new stock", "error");
    }
  };

  const handleDeleteStock = async (vaccineId) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) {
      return;
    }
    try {
      await axios.delete(`/api/stock/${vaccineId}`);
      setStockData((prev) => prev.filter((v) => v.id !== vaccineId));
      showNotification("Stock item deleted successfully!", "error");
    } catch (error) {
      console.error("Error deleting stock:", error);
      showNotification("Failed to delete stock item", "error");
    }
  };

  // REPLACE your generatePDFReport function with this:
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const date = new Date().toISOString().split("T")[0];

    doc.setFontSize(18);
    doc.text("Stock Report", 10, 15);

    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 10, 30);

    // 👇 UPDATED: Use dynamic variables
    doc.text(`Worker: ${worker_name || "N/A"}`, 10, 40);
    doc.text(`Worker Code: ${worker_code || "N/A"}`, 10, 50);
    doc.text(`Center: ${center_name || "N/A"}`, 10, 60);

    doc.setFontSize(14);
    doc.text("Stocks:", 10, 80); // Adjusted Y position slightly
    doc.setFontSize(12);

    let y = 90; // Adjusted start position

    if (stockData.length === 0) {
      doc.text("No stock data available", 10, y);
    } else {
      doc.setFont("helvetica", "bold");
      doc.text("Name", 10, y);
      doc.text("Current", 60, y);
      doc.text("Used", 110, y);
      doc.text("Received", 150, y);
      doc.setFont("helvetica", "normal");
      y += 10;

      stockData.forEach((item) => {
        doc.text(item.name || "-", 10, y);
        doc.text(String(item.currentStock || "0"), 60, y);
        doc.text(String(item.usedStock || "0"), 110, y);
        doc.text(String(item.receivedStock || "0"), 150, y);
        y += 10;

        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(`stock-report-${date}.pdf`);
    showNotification("Stock report downloaded as PDF!");
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-lg shadow-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" />
            Worker Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border-l-4 ${
            notification.type === "error"
              ? "bg-red-50 border-red-500 text-red-800"
              : "bg-green-50 border-green-500 text-green-800"
          } transform transition-all duration-300 animate-pulse`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "error" ? (
              <X className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              </div>

              <div>
                <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent mb-2">
                  Worker Dashboard
                </h1>
                <p className="text-gray-700 text-lg">
                  Welcome {worker_name}
                  <br />
                  Worker Code : {worker_code}
                  <br />
                  Center Name : {center_name}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Approvals */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Approvals
                    </h3>
                    <p className="text-gray-900">
                      Pending verification requests
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-emerald-800 font-semibold">
                      Pending Requests
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {pendingApprovals.length}
                  </div>
                  <p className="text-sm text-emerald-700">
                    Awaiting your review
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowApprovalModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <Eye className="w-5 h-5" />
                Review Pending ({pendingApprovals.length})
              </button>
            </div>
          </div>

          {/* Right Column - Schedule & Stock */}
          <div className="xl:col-span-2 space-y-8">
            {/* Schedule Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Vaccination Schedule
                    </h3>
                    <p className="text-gray-900">
                      Upcoming appointments & drives
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {scheduleList
                  .slice(0, showScheduleExpanded ? scheduleList.length : 3)
                  .map((schedule) => {
                    const priority = getPriority(schedule.assigned);
                    const locationName = `Center: ${schedule.center.code}`;

                    return (
                      <div
                        key={schedule.id}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowAttendanceModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800">
                                {locationName}
                              </h4>
                              <p className="text-sm text-blue-600">
                                {schedule.date}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                              priority
                            )}`}
                          >
                            {priority} Priority
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{schedule.assigned} Beneficiaries</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Heart className="w-4 h-4" />
                            <span>Vaccination Drive</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {scheduleList.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No schedules assigned for today.
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowScheduleExpanded(!showScheduleExpanded)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {showScheduleExpanded ? (
                  <>
                    Show Less <ChevronUp className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    View Full Schedule <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Stock Report Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 mt-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Vaccine Inventory
                    </h3>
                    <p className="text-gray-900">
                      Current stock levels & status
                    </p>
                  </div>
                </div>
              </div>

              {stockData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {stockData.map((stock) => {
                    const status = getStockStatus(stock);
                    return (
                      <div
                        key={stock.id}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStock(stock.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-purple-900 mb-2">
                          {stock.currentStock}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {stock.name}
                        </div>
                        <div className="text-xs text-gray-900">
                          Expires: {stock.expiryDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-10 h-10 mx-auto mb-3" />
                  <p>
                    No stock data available. Try refreshing or adding new stock.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowStockModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Plus className="w-5 h-5" />
                  Update/Add Stock
                </button>
                <button
                  onClick={generatePDFReport}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. APPROVAL MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Pending Approvals
                </h2>
                <p className="text-sm text-gray-500">
                  Verify beneficiary details against their documents
                </p>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!selectedBeneficiary ? (
              /* --- LIST VIEW --- */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 py-10">
                    No pending approvals found.
                  </div>
                ) : (
                  pendingApprovals.map((beneficiary) => (
                    <div
                      key={beneficiary.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 group"
                      onClick={() => setSelectedBeneficiary(beneficiary)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          {/* Avatar / Placeholder */}
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {beneficiary.name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">
                              {beneficiary.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                              {beneficiary.membertype} • {beneficiary.gender}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due:{" "}
                              {beneficiary.nextDueDate || "N/A"}
                            </p>
                          </div>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* --- DETAIL VIEW --- */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  onClick={() => setSelectedBeneficiary(null)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium mb-2"
                >
                  ← Back to List
                </button>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  {/* Top Section: Photo & Header */}
                  <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-gray-200 pb-6">
                    {/* Photo Display */}
                    <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white">
                      {selectedBeneficiary.photo ? (
                        <img
                          src={selectedBeneficiary.photo}
                          alt="Beneficiary"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col text-gray-400">
                          <User className="w-10 h-10 mb-2" />
                          <span className="text-xs">No Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedBeneficiary.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold">
                          {selectedBeneficiary.membertype}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-semibold">
                          {selectedBeneficiary.gender}
                        </span>
                        {selectedBeneficiary.status && (
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold">
                            {selectedBeneficiary.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grid Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Section 1: Identity */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">
                        Identity Details
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">
                            Date of Birth
                          </label>
                          <p className="font-medium text-gray-900">
                            {selectedBeneficiary.dob}
                            <span className="text-gray-400 text-sm ml-1">
                              ({calculateAge(selectedBeneficiary.dob)} Yrs)
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Guardian Name
                          </label>
                          <p className="font-medium text-gray-900">
                            {selectedBeneficiary.guardian_name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">
                          ID Proof Type
                        </label>
                        <p className="font-medium text-gray-900">
                          {selectedBeneficiary.idproof}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          ID Number
                        </label>
                        <p className="font-mono bg-white border px-2 py-1 rounded inline-block text-gray-800">
                          {selectedBeneficiary.idnumber}
                        </p>
                      </div>
                    </div>

                    {/* Section 2: Contact & Location */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">
                        Contact & Location
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">
                            Phone Number
                          </label>
                          <p className="font-medium text-gray-900">
                            {selectedBeneficiary.phoneNo}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="font-medium text-gray-900 truncate">
                            {selectedBeneficiary.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">Address</label>
                        <p className="font-medium text-gray-900">
                          {selectedBeneficiary.address}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">City</label>
                          <p className="font-medium text-gray-900">
                            {selectedBeneficiary.city}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Pincode
                          </label>
                          <p className="font-medium text-gray-900">
                            {selectedBeneficiary.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() =>
                      handleApproval(selectedBeneficiary.id, "approve")
                    }
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    Verify & Approve
                  </button>
                  <button
                    onClick={() =>
                      handleApproval(selectedBeneficiary.id, "reject")
                    }
                    className="flex-1 bg-white border-2 border-red-100 text-red-600 py-3 px-6 rounded-xl font-bold text-lg hover:bg-red-50 hover:border-red-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X className="w-6 h-6" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE MODAL */}
      {showAttendanceModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Record Visit Details</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedSchedule.center?.code || "Center Code"}</span>
                  <span className="text-gray-300">|</span>
                  <span>{location}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setSelectedSchedule(null);
                  setBeneficiaryData({}); // Clear data on close
                }}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Beneficiary List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
              {selectedSchedule.tasks && selectedSchedule.tasks.length > 0 ? (
                selectedSchedule.tasks.map((task) => {
                  // 👇 KEY CHANGE: Use specific fields from your 'tasks' array
                  const bId = task.beneficiaryId; 
                  const bName = task.beneficiaryName;
                  
                  const data = beneficiaryData[bId] || {};
                  const isDone = isBeneficiaryComplete(bId);

                  return (
                    <div 
                      key={bId} 
                      className={`border rounded-xl p-4 transition-all duration-200 ${
                        isDone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Beneficiary Name Row */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDone ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                             {bName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{bName}</h4>
                            <div className="flex flex-col sm:flex-row sm:gap-3 text-xs text-gray-500 mt-1">
                                <span>ID: {bId}</span>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span>{task.beneficiaryAddress}</span>
                            </div>
                          </div>
                        </div>
                        {isDone && (
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ready
                          </div>
                        )}
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* 1. Next Due Date */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Next Due Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              required
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                              onChange={(e) => handleBulkDateChange(bId, e.target.value)}
                              value={data.nextDueDate || ''}
                            />
                          </div>
                        </div>

                        {/* 2. Photo Upload */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Proof of Visit</label>
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*"
                              id={`file-${bId}`}
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleBulkPhotoChange(bId, e.target.files[0]);
                                }
                              }}
                            />
                            <label
                              htmlFor={`file-${bId}`}
                              className={`flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed rounded-lg cursor-pointer transition-all text-sm
                                ${data.photo 
                                  ? 'border-green-500 bg-green-50 text-green-700' 
                                  : 'border-gray-300 bg-white text-gray-600 hover:bg-white hover:border-blue-400 shadow-sm'
                                }`}
                            >
                              {data.photo ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span className="truncate max-w-[120px]">{data.photo.name}</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-4 h-4" />
                                  <span>Take Photo</span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No beneficiaries found in this assignment.
                </div>
              )}
            </div>

            {/* Footer / Submit Button */}
            <div className="pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={submitAttendance}
                disabled={Object.keys(beneficiaryData).length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Submit Records ({Object.keys(beneficiaryData).length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. STOCK MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Manage Vaccine Stock
              </h2>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Add New Stock Form */}
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 mb-8 bg-purple-50">
              <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add New Vaccine Stock
              </h3>
              <form
                onSubmit={submitNewStock}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newStock.name}
                    onChange={(e) =>
                      setNewStock((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., COVAX-19"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current
                  </label>
                  <input
                    type="number"
                    value={newStock.currentStock}
                    onChange={(e) =>
                      setNewStock((prev) => ({
                        ...prev,
                        currentStock: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="hidden">
                  <input type="hidden" value={newStock.usedStock} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received
                  </label>
                  <input
                    type="number"
                    value={newStock.receivedStock}
                    onChange={(e) =>
                      setNewStock((prev) => ({
                        ...prev,
                        receivedStock: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newStock.expiryDate}
                    onChange={(e) =>
                      setNewStock((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Add Stock Item
                  </button>
                </div>
              </form>
            </div>

            {/* Update Existing Stock */}
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Update Existing Stock Items ({stockData.length})
            </h3>

            <div className="space-y-6">
              {stockData.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="border rounded-xl p-6 bg-gray-50"
                >
                  <h3 className="text-lg font-bold mb-4 text-purple-600">
                    {vaccine.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        value={vaccine.currentStock}
                        onChange={(e) =>
                          updateLocalStock(
                            vaccine.id,
                            "currentStock",
                            e.target.value
                          )
                        }
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Used Today
                      </label>
                      <input
                        type="number"
                        value={vaccine.usedStock}
                        onChange={(e) =>
                          updateLocalStock(
                            vaccine.id,
                            "usedStock",
                            e.target.value
                          )
                        }
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Received Today
                      </label>
                      <input
                        type="number"
                        value={vaccine.receivedStock}
                        onChange={(e) =>
                          updateLocalStock(
                            vaccine.id,
                            "receivedStock",
                            e.target.value
                          )
                        }
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={vaccine.expiryDate}
                        onChange={(e) =>
                          updateLocalStock(
                            vaccine.id,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={submitStockUpdate}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Submit All Updates
              </button>
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
