import { useState, useEffect } from "react";

const CLIENT_ID_KEY = "gentlepulse_client_id";

export function useClientId(): string {
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    // Get or create client ID from localStorage
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      // Generate a random UUID-like string
      id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    setClientId(id);
  }, []);

  return clientId;
}
