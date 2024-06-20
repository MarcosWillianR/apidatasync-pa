"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { InternalAxiosRequestConfig } from "axios";

import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const useAxiosAuth = () => {
  useEffect(() => {
    const addAuthHeader = async (config: InternalAxiosRequestConfig) => {
      const session = await getSession();

      if (session?.user?.token && !config.headers["Authorization"]) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
      }

      return config;
    };

    const handleErrorResponse = (error: any) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Handle unauthorized error (e.g., redirect to login)
            break;
          // Add other status codes if needed
          default:
            break;
        }
      }

      toast({
        variant: "destructive",
        title: "Ops, houve um problema.",
        description: error.message,
      });

      return Promise.reject(error);
    };

    const requestInterceptor = api.interceptors.request.use(addAuthHeader, Promise.reject);
    const responseInterceptor = api.interceptors.response.use((response) => response, handleErrorResponse);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return api;
};

export default useAxiosAuth;
