"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";

const useAxiosAuth = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (session?.user.token && !config.headers["Authorization"]) {
        config.headers.Authorization = `Bearer ${session?.user.token}`;
      }
  
      return config;
    }, Promise.reject);

    const responseInterceptor = api.interceptors.response.use((response) => response, (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 403:
            signOut();
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
    });

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [session, status]);

  return api;
};

export default useAxiosAuth;
