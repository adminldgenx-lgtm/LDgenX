import { createContext } from "react";

/** Set while the editor saves: nothing can change under the request. */
export const FieldsDisabled = createContext(false);
