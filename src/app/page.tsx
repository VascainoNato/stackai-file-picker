import Content from "./components/Content";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LeftBar from "./components/LeftBar";
import "./globals.css";

export default function Home() {
  return (
    <>
    <div className=" flex w-full h-screen flex-col bg-gray-200 lg:hidden">
      <div className="flex hidden md:flex-col md:flex-col flex w-full h-screen">
        <LeftBar />
      </div>
      <div className="flex w-full flex-col h-screen">
        <Header />
        <div className="flex w-full flex-grow  overflow-y-auto ">
          <Content />
        </div>
        <Footer />
      </div>
    </div>

    <div className="flex w-full h-screen flex-col bg-white hidden lg:flex">
      <div className="flex w-full h-screen">
        <LeftBar />
        <div className="flex w-full flex-col">
          <Header />
          <div className="flex w-full flex-grow overflow-y-auto max-h-screen">
            <Content />
          </div>
          <Footer />
        </div>
      </div>
    </div></>
  );
}
