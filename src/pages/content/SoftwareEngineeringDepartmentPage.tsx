import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Software Engineering",
  description: "Focuses on software design, development, and engineering principles.",
  head: "Dr. Sarah Ahmed",
  established: "1995",
  students: "1,200+",
  faculty: "45",
  programs: ["B.Sc. Computer Science", "M.Sc. Software Engineering", "PhD AI"],
  researchAreas: ["Software Engineering", "Artificial Intelligence", "Cybersecurity"],
  news: []
};

const SoftwareEngineeringDepartmentPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Software Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default SoftwareEngineeringDepartmentPage;
