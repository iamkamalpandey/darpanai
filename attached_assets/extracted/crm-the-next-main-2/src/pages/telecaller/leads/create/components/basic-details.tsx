import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Select from "react-select";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/assets/icons/logo.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import { Calendar, MessageSquare } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { leadValidationSchema } from "@/schemas/lead-schema";
import Header from "@/components/shared/Header/Header";

const BasicDetails = ({
  initialValues,
  handleSubmit,
  formikProps,
}: {
  initialValues: any;
  handleSubmit: any;
  formikProps: any;
}) => {
  const { values, handleChange, setFieldValue, touched, errors } = formikProps;
  //@ts-ignore
  const { setLoading } = useAuth();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await api.get("/countries");
      if (!response) throw new Error("Network response was not ok");
      const countryOptions = response.data.data.map((country: any) => ({
        value: country.id,
        label: country.name,
      }));
      setCountries(countryOptions);
    } catch (err) {
      console.error(err);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="items-left justify-left">
        <Image src={Logo} className="h-14 object-contain" alt={"LOGO"} />
      </div>
      <Card className="border-none mt-5 shadow-none">
        <CardContent className="gap-2.5 grid grid-cols-1 items-start">
          <div className="">
            <Label htmlFor="name">First Name</Label>
            <span className="text-red-600">*</span>
            <Input
              id="first_name"
              name="first_name"
              value={values?.first_name}
              onChange={handleChange}
            />
            {touched.first_name && errors.first_name ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.first_name}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="last_name">Last Name</Label>
            <span className="text-red-600">*</span>
            <Input
              id="last_name"
              name="last_name"
              value={values?.last_name}
              onChange={handleChange}
            />
            {touched.last_name && errors.last_name ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.last_name}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={values?.gender}
              onChange={handleChange}
              className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="">Date of Birth</Label>
            <DatePicker
              selected={values?.dob}
              onChange={(date: Date) => setFieldValue("dob", date)}
              className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="MM/dd/yyyy"
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>

          <div className="">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={values?.email}
              onChange={handleChange}
            />
            {touched.email && errors.email ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.email}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="phone">Phone Number</Label>
            <span className="text-red-600">*</span>
            <Input
              id="phone_number"
              name="phone_number"
              value={values?.phone_number}
              onChange={handleChange}
            />
            {touched.phone_number && errors.phone_number ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.phone_number}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="phone">Secondary Phone Number</Label>

            <Input
              id="secondary_number"
              name="secondary_number"
              value={values?.secondary_number}
              onChange={handleChange}
            />
            {touched.secondary_number && errors.secondary_number ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.secondary_number}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="interested_countries">Interested Countries</Label>
            <Select
              id="interested_countries"
              name="interested_countries"
              value={values.interested_countries}
              onChange={(value) => setFieldValue("interested_countries", value)}
              options={countries}
              isMulti
            />
          </div>
          <div className="">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={values?.city}
              onChange={handleChange}
            />
            {touched.city && errors.city ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.city}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="interested_course">Interested Course</Label>
            <Input
              id="interested_course"
              name="interested_course"
              value={values?.interested_course}
              onChange={handleChange}
            />
            {touched.interested_course && errors.interested_course ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.interested_course}
              </div>
            ) : null}
          </div>
          <div className="">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              value={values?.source}
              onChange={handleChange}
            />
            {touched.source && errors.source ? (
              <div style={{ color: "red", marginTop: "0.5rem" }}>
                {errors.source}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicDetails;
