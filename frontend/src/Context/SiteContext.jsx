import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchGlobalSettings } from "../services/strapi";
import defaultLogo from "../assets/mens_hub_logo.png";

export const SiteContext = createContext({
  siteName: "Mens Hub",
  siteLogo: defaultLogo,
  tagline: "Quality products, Fresh Choices",
  announcement: "",
  settings: {},
  loading: true,
  refreshSettings: () => {},
});

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: "Mens Hub",
    tagline: "Quality products, Fresh Choices",
    announcement_banner: "",
    logoUrl: null,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchGlobalSettings();
      if (data) {
        setSettings(data);

        // Dynamically update document title
        if (data.site_name) {
          const brandName = data.site_name;
          const tagline = data.tagline ? ` | ${data.tagline}` : "";
          document.title = `${brandName}${tagline}`;
        }

        // Dynamically update favicon if dynamic logo exists
        if (data.logoUrl) {
          let faviconLink = document.querySelector("link[rel*='icon']");
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "shortcut icon";
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = data.logoUrl;
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic site settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const siteName = settings?.site_name || "Mens Hub";
  const siteLogo = settings?.logoUrl || defaultLogo;
  const tagline = settings?.tagline || "Quality products, Fresh Choices";
  const announcement = settings?.announcement_banner || "";

  return (
    <SiteContext.Provider
      value={{
        siteName,
        siteLogo,
        tagline,
        announcement,
        settings,
        loading,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);

export default SiteContext;
