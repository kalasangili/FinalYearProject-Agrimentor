import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="bg-[#F9F9E0] min-h-screen">
      
      <Sidebar />

      <main className="ml-64">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;