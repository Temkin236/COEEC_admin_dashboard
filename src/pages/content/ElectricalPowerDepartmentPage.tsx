import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Electrical Power Department",
  description: "Deals with power systems, generation, and electrical infrastructure.",
  head: "Dr. Solomon Bekele",
  established: "2001",
  students: "800+",
  faculty: "32",
  programs: ["B.Sc. Power Engineering", "M.Sc. Power Systems"],
  researchAreas: ["Power Systems", "Renewable Energy"],
  news: []
};

const ElectricalPowerDepartmentPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Electrical Power Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ElectricalPowerDepartmentPage;
