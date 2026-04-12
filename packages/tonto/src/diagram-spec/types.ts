export type TontoDiagramDirection = "LR" | "RL" | "TB" | "BT";

export type TontoDiagramTheme = "tonto-uml";

export type TontoDiagramSeverity = "error" | "warning";

export type TontoDiagramFilter = {
    include: string[];
    external: boolean;
    datatypes: boolean;
};

export type TontoDiagramPresentation = {
    theme: TontoDiagramTheme;
    direction: TontoDiagramDirection;
    stereotypes: boolean;
    attributes: boolean;
};

export type TontoDiagramLayout = {
    target: string;
    x: number;
    y: number;
};

export type TontoDiagramViewport = {
    x: number;
    y: number;
    zoom: number;
};

export type TontoDiagramSpec = {
    title: string;
    source: string;
    module?: string;
    filter: TontoDiagramFilter;
    presentation: TontoDiagramPresentation;
    nodes: TontoDiagramLayout[];
    viewport: TontoDiagramViewport;
};

export type TontoDiagramIssue = {
    message: string;
    severity: TontoDiagramSeverity;
    line?: number;
};

export type TontoDiagramParseResult = {
    spec?: TontoDiagramSpec;
    issues: TontoDiagramIssue[];
};

export type TontoDiagramNodeKind = "class" | "datatype";

export type TontoDiagramRigidity = "rigid" | "anti-rigid" | "semi-rigid" | "unknown";

export type TontoDiagramPaletteToken =
    | "functional-complexes"
    | "collectives"
    | "quantities"
    | "relators"
    | "qualities"
    | "modes"
    | "events"
    | "situations"
    | "types"
    | "abstract-individuals"
    | "none";

export type TontoDiagramNodeAppearance = {
    palette: TontoDiagramPaletteToken;
    rigidity: TontoDiagramRigidity;
    accent: "sortal" | "non-sortal" | "neutral";
    external: boolean;
};

export type TontoDiagramAttribute = {
    name: string;
    type: string;
    cardinality?: string;
};

export type TontoDiagramNode = {
    id: string;
    specifier: string;
    label: string;
    module: string;
    stereotype?: string;
    kind: TontoDiagramNodeKind;
    appearance: TontoDiagramNodeAppearance;
    attributes: TontoDiagramAttribute[];
    isEnum: boolean;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
};

export type TontoDiagramConnector =
    | "association"
    | "aggregation"
    | "aggregation-inverted"
    | "composition"
    | "composition-inverted";

export type TontoDiagramEdgeKind = "relation" | "specialization";

export type TontoDiagramEdge = {
    id: string;
    kind: TontoDiagramEdgeKind;
    source: string;
    target: string;
    label?: string;
    stereotype?: string;
    connector?: TontoDiagramConnector;
    sourceCardinality?: string;
    targetCardinality?: string;
};

export type TontoDiagramGraph = {
    title: string;
    source: string;
    module: string;
    viewport: TontoDiagramViewport;
    nodes: TontoDiagramNode[];
    edges: TontoDiagramEdge[];
    issues: TontoDiagramIssue[];
};
