import React from "react";
import { useFormContext } from "./FormContext";

const StepNavigator = ({ steps, onSubmit }) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    formData,
    validateStep,
    validateAll,
    isSubmitting,
    setIsSubmitting,
    isEdit,
    imageFiles,
  } = useFormContext();

  const handleNext = () => {
    const stepData = steps[currentStep];

    // Validate current step fields
    if (validateStep(stepData.fieldsToValidate)) {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (validateAll()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData, imageFiles);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full mt-8">
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg transition duration-200
            ${
              currentStep === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-[rgb(25,25,25)] text-white hover:bg-gray-800"
            }`}
        >
          הקודם
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-dark-blue text-white rounded-lg hover:bg-darker-blue transition duration-200"
          >
            הבא
          </button>
        ) : (
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-dark-blue text-white rounded-lg hover:bg-darker-blue transition duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isEdit
                ? "מעדכן..."
                : "מוסיף..."
              : isEdit
                ? "עדכן"
                : "הוסף"}
          </button>
        )}
      </div>
    </div>
  );
};

export default StepNavigator;
