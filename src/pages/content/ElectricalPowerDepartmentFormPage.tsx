import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Electrical Power Department",
  description: "Deals with power systems, generation, and electrical infrastructure.",
  programs: ["B.Sc. Power Engineering", "M.Sc. Power Systems"],
  head: "Dr. Solomon Bekele"
};

const ElectricalPowerDepartmentFormPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Electrical Power Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ElectricalPowerDepartmentFormPage;
