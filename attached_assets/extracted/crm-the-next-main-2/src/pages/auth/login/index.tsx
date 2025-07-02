import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import Logo from "@/assets/icons/logo.svg";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { LoginValues } from "@/types/api-types";
import EpitomeLogo from "@/assets/Logo.png";

const index = () => {
  //@ts-ignore
  const { login } = useAuth();

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: any
  ): Promise<void> => {
    try {
      console.log("Working");
      await login(values.email, values.password);
    } catch (error) {
      console.error("Login failed", error);
    }
    setSubmitting(false);
  };

  // Define Yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
    <div className="flex flex-col justify-between h-screen w-full">
      <div className="flex flex-col items-center justify-center grow">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ isSubmitting, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="w-full max-w-lg p-4">
              <Card className="space-y-4">
                <CardHeader className="text-center">
                  <Image
                    src={Logo}
                    alt="Logo"
                    height={150}
                    width={150}
                    className="mx-auto object-cover"
                  />
                  <Separator />
                  <div className="my-2.5"></div>
                  <CardTitle>Account Login</CardTitle>
                  <CardDescription>
                    Login to your account from here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Field type="email" name="email" as={Input} />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Field type="password" name="password" as={Input} />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </Formik>
      </div>
      <div className="text-center p-2 text-sm">
        Powered by{" "}
        <span className="inline-block align-middle">
          <Image
            src={EpitomeLogo}
            height={24}
            width={24}
            alt={"Epitome Logo"}
          />
        </span>{" "}
        Epitome Solutions
      </div>
    </div>
  );
};

export default index;
