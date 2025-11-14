import { AxiosError, AxiosResponse } from "axios";

function handleAxiosError(
  error: unknown,
  callback: (response?: AxiosResponse) => void
) {
  const err = error;
  if (err instanceof AxiosError) {
    if (err.response) {
      callback(err.response);
    } else {
      callback();
    }
  } else {
    callback();
  }
}

export { handleAxiosError };
