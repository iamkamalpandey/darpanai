import { useCampaigns } from "@/hooks/useCampaigns";
import { useState } from "react";
import Layout from "../../layout";
import Header from "@/components/shared/Header/Header";
import { CampaignForm } from "@/components/shared/campaigns/CampaignForm";

export default function NewCampaignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useCampaigns();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createCampaign(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Header title={"Create Campaigns"} />
      <div className=" py-2.5">
        <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
