import { generateUniqueId } from "../generators/utils/idGenerator.js";
import { Class, Ontouml2Gufo, Project } from "ontouml-js";
import { isJsonGenerationError } from "./jsonGeneration.js";

export interface GufoResultResponse {
    id?: string
    status?: number
    result: string
}

export interface GufoErrorInfo {
    code?: string
    description?: string
    severity?: string
    title?: string
}

export interface ErrorGufoResultResponse {
    id?: string
    message?: string
    status?: number
    info: GufoErrorInfo[]
}

function getGufoErrorInfo(error: unknown): GufoErrorInfo {
    if (error instanceof Error) {
        return {
            severity: "error",
            title: error.name,
            description: error.message,
        };
    }

    return {
        severity: "error",
        title: "Unexpected error",
        description: String(error),
    };
}

export function createGufoErrorResponse(
    message: string,
    options: { error?: unknown; info?: GufoErrorInfo[]; status?: number } = {}
): ErrorGufoResultResponse {
    const info = options.info ?? getGufoErrorInfos(options.error);

    return {
        id: generateUniqueId(),
        message,
        status: options.status ?? 500,
        info,
    };
}

export function formatGufoErrorMessage(error: Partial<ErrorGufoResultResponse> | undefined): string {
    const message = error?.message?.trim() || "Error transforming model";
    const details = (error?.info ?? [])
        .map((info) => info.description ?? info.title)
        .filter((detail): detail is string => Boolean(detail))
        .join("\n");

    return details ? `${message}\n${details}` : message;
}

function getElementLabel(element: { id?: string; getName?: () => string | null } | undefined): string {
    if (!element) {
        return "(unknown)";
    }

    return element.getName?.() || element.id || "(unknown)";
}

function getGufoErrorInfos(error: unknown): GufoErrorInfo[] {
    if (isJsonGenerationError(error)) {
        return error.info.map((info) => ({
            code: info.code,
            severity: info.severity,
            title: info.title,
            description: info.description,
        }));
    }

    return error ? [getGufoErrorInfo(error)] : [];
}

function describeClassifierKind(classifier: Class): string {
    if (classifier.hasEnumerationStereotype()) {
        return "Enumeration";
    }

    if (classifier.hasDatatypeStereotype()) {
        return "Datatype";
    }

    return "Class";
}

export function validateProjectForGufoTransform(project: Project): GufoErrorInfo[] {
    const issues: GufoErrorInfo[] = [];
    const rootModel = project.model;

    if (!rootModel) {
        issues.push({
            code: "missing_project_model",
            severity: "error",
            title: "Missing project model",
            description: "The generated OntoUML project has no root model package.",
        });
        return issues;
    }

    const packages = [rootModel, ...project.getAllPackages().filter((pkg) => pkg.id !== rootModel.id)];
    for (const pkg of packages) {
        if (!pkg.getName()) {
            issues.push({
                code: "missing_package_name",
                severity: "error",
                title: "Missing package name",
                description: `Package "${pkg.id}" has no name. gUFO transformation requires named packages.`,
            });
        }
    }

    for (const classifier of project.getAllClasses()) {
        if (!classifier.getName()) {
            const kind = describeClassifierKind(classifier);
            issues.push({
                code: "missing_classifier_name",
                severity: "error",
                title: `Missing ${kind.toLowerCase()} name`,
                description: `${kind} "${classifier.id}" has no name. This can trigger internal gUFO transformer errors when URIs are generated.`,
            });
        }
    }

    for (const literal of project.getAllLiterals()) {
        if (!literal.getName()) {
            issues.push({
                code: "missing_literal_name",
                severity: "error",
                title: "Missing enumeration literal name",
                description: `Enumeration literal "${literal.id}" has no name.`,
            });
        }
    }

    for (const relation of project.getAllRelations()) {
        const sourceEnd = relation.properties?.[0];
        const targetEnd = relation.properties?.[1];

        if (!sourceEnd?.propertyType || !targetEnd?.propertyType) {
            issues.push({
                code: "missing_relation_endpoint_type",
                severity: "error",
                title: "Missing relation endpoint type",
                description: `Relation "${getElementLabel(relation)}" must have source and target types before gUFO transformation.`,
            });
        }
    }

    return issues;
}

export async function TransformTontoToGufo(project: Project): Promise<GufoResultResponse | ErrorGufoResultResponse> {
    try {
        const validationIssues = validateProjectForGufoTransform(project);
        if (validationIssues.length > 0) {
            return createGufoErrorResponse("Cannot transform model to Gufo because the generated OntoUML project is incomplete", {
                info: validationIssues,
                status: 400,
            });
        }

        const service = new Ontouml2Gufo(project, {});
        const result = service.run();

        return {
            id: generateUniqueId(),
            result: result.result,
            status: 200,
        };
    } catch (error) {
        return createGufoErrorResponse("Error while transforming model to Gufo", { error });
    }
}
