import fetch from "node-fetch-native";
import { Project } from "ontouml-js";

export interface ResultResponse {
    code?: string
    data?: {
        source?: {
            id?: string
            description?: string
            stereotype?: string
            type?: string
        }
    }
    description?: string
    severity?: string
    title?: string
}

export interface ErrorResultResponse {
    id?: string
    message?: string
    status?: number
    info: ErrorInfo[]
}

interface ErrorInfo {
    keyword?: string
    message?: string
    dataPath?: string
    schemaPath?: string
}

interface JsonResult {
    result: ResultResponse[];
}

export interface ValidationReturn {
    result: ResultResponse[];
    numberOfErrors: number;
}

export async function validateTontoFile(project: Project, locally: boolean): Promise<ValidationReturn | ErrorResultResponse> {
    const body = {
        project,
        options: undefined,
    };
    const url = locally ? "http://localhost:80/v1/verify" : "http://api.ontouml.org/v1/verify";

    try {
        const response = await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        });
        const json: JsonResult | ErrorResultResponse = await response.json() as JsonResult;
        if (json) {
            return {
                result: json.result,
                numberOfErrors: json.result.length
            } as ValidationReturn;
        } else {
            // TODO: Fix ErrorResult
            return {} as ErrorResultResponse;
        }
    } catch (error) {
        console.log(error);
    }
    return {
        status: 500,
        message: "error while validating model",
    } as ErrorResultResponse;
}
