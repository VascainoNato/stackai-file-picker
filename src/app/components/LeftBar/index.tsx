"use client";
import { useFilePicker } from "@/app/contexts/PickerContext";
import { ChevronLeft, FileText } from "lucide-react";
import Image from "next/image";

export default function LeftBar() {
  const {
  folderStack,
  handleGoBack,
} = useFilePicker();
    return (
      <div className="flex lg:w-[30%] xl:w-[15%] h-20 bg-gray-100 h-full lg:flex-col">
        <div className="flex w-full py-4 border-b-2 border-gray-200">
          <div className="flex w-[30%] justify-center items-center">
          {folderStack.length > 0 && (
          <button
            onClick={handleGoBack}
          >
          <ChevronLeft size={30} className="text-gray-400 cursor-pointer"/>
          </button>
        )}
          </div>
          <div className="flex w-[70%]  items-center">
            <h1 className=" font-roboto text-lg text-[color:#202124] font-medium">Integrations</h1>
          </div>
        </div>
        <div className="flex px-6 py-2 w-full flex-col">
          <p className="text-gray-400 font-roboto text-sm font-normal">Integrations</p>
          <div className="flex w-full flex-col pt-4 gap-4">
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md p-1 hover:bg-gray-200 cursor-pointer rounded-md">
              <FileText size={20} color="gray"/>
              <h5 className="text-gray-400 font-roboto text-sm font-medium pt-1">Files</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md p-1 hover:bg-gray-200 cursor-pointer rounded-md">
              <Image
                src="/globe.webp"
                alt="Websites Icon"
                width={20}
                height={15}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium pt-1">Websites</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md">
              <Image
                src="/text-size.webp"
                alt="Text Icon"
                width={20}
                height={15}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium pt-1">Text</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/confluence.webp"
                alt="Confluence Icon"
                width={20}
                height={15}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium pt-1">Confluence</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/Notion.webp"
                alt="Notion Icon"
                width={25}
                height={25}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium ">Notion</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/drive.webp"
                alt="Google Drive Icon"
                width={25}
                height={25}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium ">Google Drive</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/onedrive.webp"
                alt="One Drive Icon"
                width={25}
                height={25}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium ">One Drive</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/sharepoint.webp"
                alt="Share Point Icon"
                width={25}
                height={25}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium ">Sharepoint</h5>
            </div>
            <div className="flex w-full gap-2 items-center p-1 hover:bg-gray-200 cursor-pointer rounded-md ">
              <Image
                src="/slack.webp"
                alt="Slack Icon"
                width={25}
                height={25}
              />
              <h5 className="text-gray-400 font-roboto text-sm font-medium ">Slack</h5>
            </div>
           
          </div>
        </div>
        
       
        
      </div>
    );
  }
  