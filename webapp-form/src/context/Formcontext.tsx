import { ReviewCustomPartialWithRelations } from "@/prisma/generated/zod";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Définir le type de contexte
interface FormContextType {
  review: ReviewCustomPartialWithRelations | null;
  setReview: Dispatch<SetStateAction<ReviewCustomPartialWithRelations | null>>;
}

// Créer le contexte avec les types appropriés
const FormContext = createContext<FormContextType | undefined>(undefined);

// Définir le provider du contexte
export const FormContextProvider = ({
  children,
  initialReview,
}: {
  children: ReactNode;
  initialReview: ReviewCustomPartialWithRelations | null;
}) => {
  const [review, setReview] = useState<ReviewCustomPartialWithRelations | null>(
    initialReview
  );

  return (
    <FormContext.Provider value={{ review, setReview }}>
      {children}
    </FormContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
