import { describe, expect, test } from "vitest";
import { parseTontoDiagramSpec, serializeTontoDiagramSpec, updateTontoDiagramLayout } from "../src/diagram-spec/index.js";

describe("tontodiagram parser", () => {
    test("parses the canonical diagram format", () => {
        const source = `diagram "People Overview" {
  source "./src/people.tonto"
  module people

  filter {
    include Person, Child, Employment
    external false
    datatypes true
  }

  presentation {
    theme tonto-uml
    direction LR
    stereotypes true
    attributes true
  }

  node Person { x 80 y 120 }
  node Child { x 360 y 120 }

  viewport { x 0 y 0 zoom 1 }
}`;

        const result = parseTontoDiagramSpec(source);

        expect(result.issues.filter((issue) => issue.severity === "error")).toHaveLength(0);
        expect(result.spec).toBeDefined();
        expect(result.spec?.title).toBe("People Overview");
        expect(result.spec?.source).toBe("./src/people.tonto");
        expect(result.spec?.module).toBe("people");
        expect(result.spec?.nodes).toEqual([
            { target: "Child", x: 360, y: 120 },
            { target: "Person", x: 80, y: 120 },
        ]);
    });

    test("serializes diagram state deterministically", () => {
        const parsed = parseTontoDiagramSpec(`diagram "People Overview" {
  source "./src/people.tonto"

  filter {
    external false
    datatypes true
  }

  presentation {
    theme tonto-uml
    direction LR
    stereotypes true
    attributes true
  }

  viewport { x 0 y 0 zoom 1 }
}`);

        const updated = updateTontoDiagramLayout(
            parsed.spec!,
            [
                { target: "people.Child", x: 360.154, y: 120.499 },
                { target: "people.Person", x: 80, y: 120 },
            ],
            { x: 4.124, y: 10.333, zoom: 0.875 }
        );

        expect(serializeTontoDiagramSpec(updated)).toContain("node people.Child { x 360.15 y 120.5 }");
        expect(serializeTontoDiagramSpec(updated)).toContain("viewport { x 4.12 y 10.33 zoom 0.88 }");
    });

    test("reports missing source declarations", () => {
        const result = parseTontoDiagramSpec(`diagram "Broken" {
  viewport { x 0 y 0 zoom 1 }
}`);

        expect(result.spec).toBeUndefined();
        expect(result.issues.some((issue) => issue.message.includes("Diagram source is required"))).toBe(true);
    });
});
