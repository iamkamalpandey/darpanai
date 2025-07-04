import { useEffect } from "react";

import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignList } from "@/components/shared/campaigns/CampaignList";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

export default function CampaignsPage() {
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useCampaigns();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <Layout>
      <Header title={"Campaigns"} />

      <div className="p-2.5">
        <CampaignList
          campaigns={campaigns}
          onDelete={deleteCampaign}
          isLoading={loading}
        />
      </div>
    </Layout>
  );
}
