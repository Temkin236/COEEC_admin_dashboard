import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Computer Science Engineering",
  description: "Covers algorithms, computation, and computer systems.",
  programs: ["B.Sc. Computer Science", "M.Sc. Software Engineering", "PhD AI"],
  head: "Dr. Sarah Ahmed"
};

const ComputerScienceEngineeringFormPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Computer Science Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ComputerScienceEngineeringFormPage;
