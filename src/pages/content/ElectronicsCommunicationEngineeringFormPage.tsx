import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Electronics and Communication Engineering",
  description: "Specializes in electronics, signal processing, and communication systems.",
  programs: ["B.Sc. Electrical Engineering", "M.Sc. Communication Engineering"],
  head: "Mr. Dawit Tadesse"
};

const ElectronicsCommunicationEngineeringFormPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Electronics and Communication Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ElectronicsCommunicationEngineeringFormPage;
