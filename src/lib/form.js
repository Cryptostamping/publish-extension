import { useState, useEffect, useCallback } from "react";
import _debounce from "lodash/debounce";

export const useInputText = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(""),
    bind: {
      value,
      onChange: (event) => {
        setValue(event.target.value);
      },
    },
  };
};

export const useInputObject = (initialValue, fields) => {
  const [objectValue, setObjectValue] = useState(initialValue);

  const binding = useCallback(
    (field) => {
      return {
        value: objectValue[field] || "",
        onChange: (event) => {
          const update_object = { ...objectValue};
          update_object[field] = event.target.value;
          setObjectValue(update_object);
        },
      };
    },
    [objectValue, setObjectValue]
  );

  return {
    objectValue,
    setObjectValue,
    binding,
  };
};

export const useInputRange = (initialValue) => {
  const [value, setValue] = useState([0, initialValue]);

  return {
    value,
    setValue,
    reset: () => setValue([0, initialValue]),
    bind: {
      value,
      onChange: (event) => {
        setValue(event.target.value);
      },
    },
  };
};

/*
export const useInputDebounceText = (initialValue, endFunction, delay) => {
  const [value, setValue] = useState(initialValue);

  const debouncedCallback = useCallback(
    _debounce(() => {
      endFunction(value);
    }, delay || 500),
    [delay, value]
  );

  useEffect(() => {
    if (value !== initialValue) debouncedCallback();
    // Cancel the debounce on useEffect cleanup.
    return debouncedCallback.cancel;
  }, [value, debouncedCallback, initialValue]);

  return {
    value,
    setValue,
    reset: () => setValue(""),
    cancel: () => debouncedCallback.cancel(),
    bind: {
      value,
      onChange: (event) => {
        const { value: nextValue } = event.target;
        setValue(nextValue);
      },
    },
  };
};
*/
export const useDropdown = (initialValue) => {
  const [selected, setSelected] = useState(initialValue);

  return {
    selected,
    setSelected,
    reset: () => setSelected(initialValue),
    bind: {
      selected,
      onChange: (event) => {
        setSelected(event.value);
      },
    },
  };
};

/* Deprecated & Unused 
export const useInputSingleRange = initialValue => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(initialValue),
    bind: {
      value,
      onInput: event => {
        setValue(event.target.value);
      }
    }
  };
};
*/
