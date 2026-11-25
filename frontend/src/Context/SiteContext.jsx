import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchGlobalSettings } from "../services/strapi";
import { fetchSanityGlobalSettings } from "../services/sanity";
import defaultLogo from "../assets/mens_hub_logo.png";

export const SiteContext = createContext({
  siteName: "Clothings Store",
  siteLogo: defaultLogo,
  tagline: "Quality products, Fresh Choices",
  announcement: "",
  settings: {},
  loading: true,
  refreshSettings: () => {},
});

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem("app_site_settings");
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      site_name: "Clothings Store",
      tagline: "Quality products, Fresh Choices",
      announcement_banner: "",
      logoUrl: null,
      free_shipping_threshold: 999,
    };
  });
  const [loading, setLoading] = useState(!sessionStorage.getItem("app_site_settings"));

  const applySettingsToDOM = (data) => {
    if (!data) return;
    if (data.site_name) {
      const brandName = data.site_name;
      const tagline = data.tagline ? ` | ${data.tagline}` : "";
      document.title = `${brandName}${tagline}`;
    }
    if (data.logoUrl) {
      let faviconLink = document.querySelector("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "shortcut icon";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = data.logoUrl;
    }
  };

  const loadSettings = useCallback(async (forceRefresh = false) => {
    try {
      // Return cached settings if fresh within 10 minutes unless force-refreshed
      if (!forceRefresh) {
        const lastFetched = sessionStorage.getItem("app_site_settings_ts");
        const cached = sessionStorage.getItem("app_site_settings");
        if (cached && lastFetched && Date.now() - Number(lastFetched) < 10 * 60 * 1000) {
          applySettingsToDOM(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      // 1. First attempt to fetch from Sanity CMS Edge CDN (<10ms)
      let data = await fetchSanityGlobalSettings();

      // 2. If Sanity has no global settings, fall back to Strapi
      if (!data) {
        data = await fetchGlobalSettings();
      }

      if (data) {
        setSettings(data);
        try {
          sessionStorage.setItem("app_site_settings", JSON.stringify(data));
          sessionStorage.setItem("app_site_settings_ts", String(Date.now()));
        } catch {}

        applySettingsToDOM(data);
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

  const refreshSettings = useCallback(() => {
    return loadSettings(true);
  }, [loadSettings]);

  const siteName = settings?.site_name || "Clothings Store";
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
        refreshSettings,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);

export default SiteContext;
