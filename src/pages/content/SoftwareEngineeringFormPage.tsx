import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Software Engineering",
  description: "Focuses on software design, development, and engineering principles.",
  programs: ["B.Sc. Computer Science", "M.Sc. Software Engineering", "PhD AI"],
  head: "Dr. Sarah Ahmed"
};

const SoftwareEngineeringFormPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Software Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default SoftwareEngineeringFormPage;
