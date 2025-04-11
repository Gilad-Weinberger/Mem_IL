import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import ImageUpload from "./ImageUpload";
import RankDropdown from "./RankDropdown";
import SocialMediaInputs from "./SocialMediaInputs";
import PageLayout from "@/components/PageLayout";

const SoldierFormContainer = ({
  initialData = {},
  onSubmit,
  isEdit = false,
}) => {
  const [soldier, setSoldier] = useState(initialData);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (isEdit && Object.keys(initialData).length > 0) {
      setSoldier(initialData);
    }
  }, [initialData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileLinks = files.map((file) => URL.createObjectURL(file));
    setSoldier((prevSoldier) => ({
      ...prevSoldier,
      images: prevSoldier.images
        ? [...prevSoldier.images, ...fileLinks]
        : fileLinks,
    }));
  };

  const handleImageDelete = (index) => {
    setSoldier((prevSoldier) => {
      const newImages = prevSoldier.images.filter((_, i) => i !== index);
      return {
        ...prevSoldier,
        images: newImages,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!soldier.name) newErrors.name = "שם מלא נדרש";
    if (!soldier.rank) newErrors.rank = "דרגה נדרשת";
    if (!soldier.lifeStory) newErrors.lifeStory = "סיפור חיים נדרש";
    if (!soldier.birthDate) newErrors.birthDate = "תאריך לידה נדרש";
    if (!soldier.dateOfDeath) newErrors.dateOfDeath = "תאריך פטירה נדרש";
    if (!soldier.images || soldier.images.length === 0)
      newErrors.images = "חובה להעלות לפחות תמונה אחת";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(soldier);
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center">
        <form className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-md py-10">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isEdit ? "עריכת חייל/ת" : "הוספת חייל/ת"}
          </h2>
          <FormInput
            id="name"
            name="name"
            value={soldier.name}
            onChange={handleChange}
            placeholder="הכנס שם"
            label="שם מלא"
            error={errors.name}
          />

          <RankDropdown
            value={soldier.rank}
            onChange={handleChange}
            error={errors.rank}
          />

          <FormTextarea
            id="lifeStory"
            name="lifeStory"
            value={soldier.lifeStory}
            onChange={handleChange}
            placeholder="הכנס סיפור חיים"
            label="סיפור חיים"
            error={errors.lifeStory}
          />

          <ImageUpload
            images={soldier.images}
            onImageChange={handleImageChange}
            onImageDelete={handleImageDelete}
            error={errors.images}
          />

          <FormInput
            id="birthDate"
            name="birthDate"
            value={soldier.birthDate}
            onChange={handleChange}
            label="תאריך לידה"
            type="date"
            error={errors.birthDate}
          />

          <FormInput
            id="dateOfDeath"
            name="dateOfDeath"
            value={soldier.dateOfDeath}
            onChange={handleChange}
            label="תאריך פטירה"
            type="date"
            error={errors.dateOfDeath}
          />

          <SocialMediaInputs soldier={soldier} onChange={handleChange} />

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full p-3 rounded bg-dark-blue text-white font-semibold hover:bg-darker-blue transition duration-200"
          >
            {isEdit ? "עדכן" : "שלח"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default SoldierFormContainer;
