import React from "react";
import Layout from "../layout";

import ProfilePage from "@/components/shared/Profile/profilePage";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/shared/Header/Header";

const index = () => {
  //@ts-ignore
  const { user } = useAuth();
  return (
    <Layout>
      <>
        <Header title={"Profile"} />
        <ProfilePage user={user} />
      </>
    </Layout>
  );
};

export default index;
