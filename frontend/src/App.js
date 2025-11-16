import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  useEffect(() => {
    const helloWorldApi = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log(response.data.message);
      } catch (e) {
        console.error(e, `errored out requesting / api`);
      }
    };
    helloWorldApi();
  }, []);

  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <Header />
        <div className="flex flex-1">
          <RightSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Sidebar />
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
