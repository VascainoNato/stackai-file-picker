import Content from "./components/Content";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LeftBar from "./components/LeftBar";
import "./globals.css";

export default function Home() {
  return (
    <div className="flex w-full h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full h-screen">
        <LeftBar/>
        <div className="flex w-full flex-col">
          <Header/>
          <div className="flex w-full flex-grow">
            <Content />
          </div>
          <Footer/>
        </div>
      </div>
    </div>
  );
}
