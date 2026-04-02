import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../component/UserSidebar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] flex">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-58">
        <div className="lg:hidden h-16" />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;