import { generateUniqueId } from "cli/generators/utils/idGenerator.js";
import fetch from "node-fetch-native";
import { Ontouml2Gufo, Project } from "ontouml-js";

export interface GufoResultResponse {
    result: string
}

export interface ErrorGufoResultResponse {
    id?: string
    message?: string
    status?: number
    info: ErrorInfo[]
}

interface ErrorInfo {
    code?: string
    description?: string
    severity?: string
    title?: string
}

export async function TransformTontoToGufo(project: Project): Promise<GufoResultResponse | ErrorGufoResultResponse> {
    const body = {
        project,
        options: {},
    };

    try {

    const service = new Ontouml2Gufo(project, {});
    const result = service.run();
    return {
        id: generateUniqueId(),
        result: result.result,
        status: 200,
    }
        const response = await fetch("http://api.ontouml.org/v1/transform/gufo", {
            method: "post",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        });
        const json = await response.json();
        const resultResponse = json as GufoResultResponse;
        if (resultResponse) {
            return resultResponse;
        } else {
            return json as ErrorGufoResultResponse;
        }
    } catch (error) {
        console.log(error);
    }
    return {
        status: 500,
        message: "error while transforming model to Gufo",
    } as ErrorGufoResultResponse;
}
