import fetch from "node-fetch-native";
import { Project } from "ontouml-js";

export interface ResultResponse {
  code?: string;
  data?: {
    source?: {
      id?: string;
      description?: string;
      stereotype?: string;
      type?: string;
    };
  };
  description?: string;
  severity?: string;
  title?: string;
}

export interface ErrorResultResponse {
  id?: string;
  message?: string;
  status?: number;
  info: ErrorInfo[];
}

interface ErrorInfo {
  keyword?: string;
  message?: string;
  dataPath?: string;
  schemaPath?: string;
}

export async function validateTontoFile(
  project: Project
): Promise<ResultResponse[] | ErrorResultResponse> {
  const body = {
    project,
    options: undefined,
  };

  try {
    const response = await fetch("http://api.ontouml.org/v1/verify", {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    const resultResponse = json.result as ResultResponse[];
    if (resultResponse) {
      return resultResponse;
    } else {
      return json as ErrorResultResponse;
    }
  } catch (error) {
    console.log(error);
  }
  return {
    status: 500,
    message: "error while validating model"
  } as ErrorResultResponse;
}