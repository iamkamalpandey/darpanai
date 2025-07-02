import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
import UsersTable from "@/components/shared/Tables/UsersTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const UserFormSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  roleId: Yup.number().required("Role is required"),
});

const Index = () => {
  const [data, setData] = useState([]);

  const fetchData = () => {
    api.get("user/counsellor/get-all").then((response) => {
      setData(response.data.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <Header title="Counsellors" />
      <div className="p-2.5">
        <UsersTable people={data} />
      </div>
    </Layout>
  );
};

export default Index;
