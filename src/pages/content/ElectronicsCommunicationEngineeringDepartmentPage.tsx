import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Electronics and Communication Engineering",
  description: "Specializes in electronics, signal processing, and communication systems.",
  head: "Mr. Dawit Tadesse",
  established: "1998",
  students: "900+",
  faculty: "38",
  programs: ["B.Sc. Electrical Engineering", "M.Sc. Communication Engineering"],
  researchAreas: ["Signal Processing", "Embedded Systems", "Telecommunications"],
  news: []
};

const ElectronicsCommunicationEngineeringDepartmentPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Electronics and Communication Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ElectronicsCommunicationEngineeringDepartmentPage;
