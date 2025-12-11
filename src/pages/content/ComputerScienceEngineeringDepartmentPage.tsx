import React from "react";
import DepartmentForm from "./DepartmentForm";

const initialValues = {
  name: "Computer Science Engineering",
  description: "Covers algorithms, computation, and computer systems.",
  head: "Dr. Sarah Ahmed",
  established: "1995",
  students: "1,200+",
  faculty: "45",
  programs: ["B.Sc. Computer Science", "M.Sc. Software Engineering", "PhD AI"],
  researchAreas: ["Artificial Intelligence", "Cybersecurity", "Data Science"],
  news: []
};

const ComputerScienceEngineeringDepartmentPage = () => {
  const handleSubmit = (values) => {
    // Save logic here
    console.log("Computer Science Engineering Department Saved:", values);
  };

  return <DepartmentForm initialValues={initialValues} onSubmit={handleSubmit} />;
};

export default ComputerScienceEngineeringDepartmentPage;
