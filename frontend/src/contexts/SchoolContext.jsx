/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubdomain } from '../utils/subdomain';
import { schoolService } from '../services/schoolService';

const SchoolContext = createContext(null);

export const SchoolProvider = ({ children }) => {
  const [subdomain, setSubdomainState] = useState(getSubdomain());
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenant = async () => {
    const currentSub = getSubdomain();
    setSubdomainState(currentSub);
    if (!currentSub || currentSub === 'admin') {
      setSchool(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await schoolService.getTenantInfo();
      setSchool(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load school tenant info:", err);
      setError("School portal not found or inactive.");
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  return (
    <SchoolContext.Provider value={{ subdomain, school, loading, error, refreshTenant: fetchTenant }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);
