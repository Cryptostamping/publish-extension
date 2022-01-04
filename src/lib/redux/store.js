import { configureStore } from "@reduxjs/toolkit"
import uiReducer from "~/src/lib/redux/features/uiSlice"
import stamperReducer from "~/src/lib/redux/features/stamperSlice"

export default configureStore({
  reducer: {
    stamper: stamperReducer,
    ui: uiReducer
  },
})