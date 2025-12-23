import { createContext, useContext, useState, useEffect } from "react";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyData, setCompanyData] = useState({
    company_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    gstin: ""
  });

  // Load from localStorage on app start
  useEffect(() => {
    const storedData = localStorage.getItem("company_data");
    if (storedData) {
      setCompanyData(JSON.parse(storedData));
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (companyData?.company_name) {
      localStorage.setItem("company_data", JSON.stringify(companyData));
    }
  }, [companyData]);

  return (
    <CompanyContext.Provider value={{ companyData, setCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
