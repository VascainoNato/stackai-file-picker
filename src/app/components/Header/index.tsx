import { Grid, Menu, MoreVertical, Plus, Search } from "lucide-react";
import Image from "next/image";

export default function Header() {
    return (
      <div className="flex w-full h-16 bg-[#c1c1c1] lg:bg-white lg:h-20">
        <div className="flex w-full h-full px-6 items-center justify-between lg:px-8 xl:px-16">
          <div className="flex gap-6 lg:justify-between lg:w-full lg:h-20 items-center lg:border-b-2 border-gray-200">
            <button 
              className="flex items-center lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded p-1"

            >
              <Menu size={24} color="gray"/>
            </button>
            <h1 className="flex text-black font-normal text-xl lg:hidden font-roboto ">My Drive</h1>
            <div className="hidden lg:flex items-center px-6 lg:px-0 gap-2">
              <Image
                src="/drive.webp"
                alt="Google Drive"
                width={30}
                height={30}
              />
              <h1 className="text-md font-roboto font-medium text-[color:#202124]">Google Drive</h1>
              <div className="flex items-center p-1 rounded bg-gray-200 text-gray-500 ml-2 font-roboto text-sm">
                Beta
              </div>
            </div>
            <button className="flex items-center px-2 py-1 rounded bg-gray-200 text-gray-500 font-roboto gap-2 text-sm hidden lg:flex items-center align-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset">
              <Plus size={16} color="gray"/>
              Add Account
            </button>
          </div>
          <div className="flex gap-6 lg:hidden">
            <button 
              className="flex items-center lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded p-1"

            >
              <Search size={22} color="gray"/>
            </button>
            <button 
              className="flex items-center lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded p-1"

            >
             <Grid size={24} color="gray"/>
            </button>
            <button 
              className="flex items-center lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded p-1"

            >
             <MoreVertical size={24} color="gray" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  