import React from "react";
import { FormProvider, useFormContext } from "./FormContext";
import StepNavigator from "./StepNavigator";
import CircularProgressBar from "./CircularProgressBar";
import PageLayout from "@/components/PageLayout";

// Import all step components
import BasicInfoStep from "./steps/BasicInfoStep";
import LifeStoryStep from "./steps/LifeStoryStep";
import ImagesStep from "./steps/ImagesStep";
import DatesStep from "./steps/DatesStep";
import SocialMediaStep from "./steps/SocialMediaStep";

// This component renders the form steps based on currentStep from context
const FormStepsRenderer = ({ formSteps, onSubmit }) => {
  const { currentStep } = useFormContext();

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / formSteps.length) * 100;

  // Get the current step component
  const CurrentStepComponent = formSteps[currentStep].component;
  const currentStepLabel = formSteps[currentStep].label;

  return (
    <>
      {/* Current step heading and progress */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl text-white font-medium">{currentStepLabel}</h3>
        <CircularProgressBar percentage={progressPercentage} />
      </div>

      {/* Render only the current step component */}
      <CurrentStepComponent />

      {/* Step navigation */}
      <StepNavigator steps={formSteps} onSubmit={onSubmit} />
    </>
  );
};

const MultiStepFormContainer = ({
  initialData = {},
  onSubmit,
  isEdit = false,
}) => {
  // Define form steps and their validation fields
  const formSteps = [
    {
      component: BasicInfoStep,
      label: "פרטים בסיסיים",
      fieldsToValidate: ["name", "rank"],
    },
    {
      component: LifeStoryStep,
      label: "סיפור חיים",
      fieldsToValidate: ["lifeStory"],
    },
    {
      component: ImagesStep,
      label: "תמונות",
      fieldsToValidate: ["images"],
    },
    {
      component: DatesStep,
      label: "תאריכים",
      fieldsToValidate: ["birthDate", "dateOfDeath", "warFellIn"],
    },
    {
      component: SocialMediaStep,
      label: "מדיה חברתית",
      fieldsToValidate: [], // These are optional
    },
  ];

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-md py-10">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            {isEdit ? "עריכת חייל/ת" : "הוספת חייל/ת"}
          </h2>

          <FormProvider initialData={initialData} isEdit={isEdit}>
            <FormStepsRenderer formSteps={formSteps} onSubmit={onSubmit} />
          </FormProvider>
        </div>
      </div>
    </PageLayout>
  );
};

export default MultiStepFormContainer;
