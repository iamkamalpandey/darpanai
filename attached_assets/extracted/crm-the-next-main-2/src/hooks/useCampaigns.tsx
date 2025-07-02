import api from "@/services/api";
import { useState } from "react";

interface Campaign {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  platform?: string;
  status?: string;
  target?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get("/campaigns");
      setCampaigns(response.data.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (data: Partial<Campaign>) => {
    try {
      await api.post("/campaigns", data);
      await fetchCampaigns();
    } catch (error) {
      throw error;
    }
  };

  const updateCampaign = async (id: number, data: Partial<Campaign>) => {
    try {
      await api.put(`/campaigns/${id}`, data);
      await fetchCampaigns();
    } catch (error) {
      throw error;
    }
  };

  const deleteCampaign = async (id: number) => {
    try {
      await api.delete(`/campaigns/${id}`);
      await fetchCampaigns();
    } catch (error) {
      throw error;
    }
  };

  return {
    campaigns,
    loading,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
