import { createContext, useContext, useState, useEffect } from "react";

const MultiStepFormContext = createContext();

export const FormProvider = ({
  initialData = {},
  children,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData, isEdit]);

  const updateFormData = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const setStep = (step) => {
    setCurrentStep(step);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileLinks = files.map((file) => URL.createObjectURL(file));
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images ? [...prevData.images, ...fileLinks] : fileLinks,
    }));

    // Clear any image-related errors
    if (errors.images) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleImageDelete = (index) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index);
      return {
        ...prevData,
        images: newImages,
      };
    });
  };

  const validateStep = (stepFields) => {
    const newErrors = {};

    stepFields.forEach((field) => {
      if (field === "name" && !formData.name) {
        newErrors.name = "שם מלא נדרש";
      }

      if (field === "rank" && !formData.rank) {
        newErrors.rank = "דרגה נדרשת";
      }

      if (field === "lifeStory" && !formData.lifeStory) {
        newErrors.lifeStory = "סיפור חיים נדרש";
      }

      if (field === "birthDate" && !formData.birthDate) {
        newErrors.birthDate = "תאריך לידה נדרש";
      }

      if (field === "dateOfDeath" && !formData.dateOfDeath) {
        newErrors.dateOfDeath = "תאריך פטירה נדרש";
      }

      if (
        field === "images" &&
        (!formData.images || formData.images.length === 0)
      ) {
        newErrors.images = "חובה להעלות לפחות תמונה אחת";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "שם מלא נדרש";
    if (!formData.rank) newErrors.rank = "דרגה נדרשת";
    if (!formData.lifeStory) newErrors.lifeStory = "סיפור חיים נדרש";
    if (!formData.birthDate) newErrors.birthDate = "תאריך לידה נדרש";
    if (!formData.dateOfDeath) newErrors.dateOfDeath = "תאריך פטירה נדרש";
    if (!formData.images || formData.images.length === 0)
      newErrors.images = "חובה להעלות לפחות תמונה אחת";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <MultiStepFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        nextStep,
        prevStep,
        setStep,
        errors,
        setErrors,
        isSubmitting,
        setIsSubmitting,
        validateStep,
        validateAll,
        handleImageChange,
        handleImageDelete,
        isEdit,
      }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
